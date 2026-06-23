const express = require('express');
const router = express.Router();
const { askJSON } = require('../services/gemini');
const pool = require('../db/pool');
const { aiLimiter, sessionLimiter } = require('../middleware/rateLimiter');

const VALID_ROLES = ['tcs_prime', 'sde', 'frontend', 'backend'];

const ROLE_LABELS = {
  tcs_prime: 'TCS Prime',
  sde: 'SDE (Software Development Engineer)',
  frontend: 'Frontend Developer',
  backend: 'Backend Developer',
};

// Question categories and their weights per role
const ROLE_CATEGORIES = {
  tcs_prime:  ['DSA', 'OOP', 'DBMS', 'OS', 'Projects'],
  sde:        ['DSA', 'System Design', 'OOP', 'Projects'],
  frontend:   ['JavaScript', 'React', 'CSS/HTML', 'Performance', 'Projects'],
  backend:    ['Node.js/APIs', 'DBMS', 'System Design', 'Security', 'Projects'],
};

/**
 * POST /api/interview/start
 * Body: { roleType: string, roomId?: string }
 * Creates a new interview session and returns the first question.
 */
router.post('/start', sessionLimiter, async (req, res) => {
  const { roleType, roomId } = req.body;

  if (!VALID_ROLES.includes(roleType)) {
    return res.status(400).json({ error: 'Invalid role type.' });
  }

  try {
    // Create session in DB
    const { rows } = await pool.query(
      `INSERT INTO interview_sessions (room_id, role_type)
       VALUES ($1, $2)
       RETURNING id`,
      [roomId || null, roleType]
    );
    const sessionId = rows[0].id;

    // Generate the first question
    const question = await generateQuestion(roleType, sessionId, 0);

    return res.json({ sessionId, question });
  } catch (err) {
    console.error('Interview start error:', err);
    return res.status(500).json({ error: 'Failed to start interview session.' });
  }
});

/**
 * POST /api/interview/answer
 * Body: { sessionId, questionId, answer, roleType, questionIndex }
 * Evaluates the answer and returns next question (or summary if done).
 */
router.post('/answer', aiLimiter, async (req, res) => {
  const { sessionId, questionId, answer, roleType, questionIndex } = req.body;

  if (!sessionId || !questionId || answer === undefined || !roleType) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  if (!VALID_ROLES.includes(roleType)) {
    return res.status(400).json({ error: 'Invalid role type.' });
  }

  // Verify session exists
  const sessionCheck = await pool.query(
    'SELECT id FROM interview_sessions WHERE id = $1',
    [sessionId]
  );
  if (sessionCheck.rows.length === 0) {
    return res.status(404).json({ error: 'Session not found.' });
  }

  // Fetch the question that was asked
  const qRow = await pool.query(
    'SELECT question, category FROM interview_exchanges WHERE id = $1',
    [questionId]
  );
  if (qRow.rows.length === 0) {
    return res.status(404).json({ error: 'Question not found.' });
  }

  const { question, category } = qRow.rows[0];
  const userAnswer = (answer || '').trim();

  try {
    // Evaluate the answer
    const evaluation = await evaluateAnswer(question, userAnswer, category, roleType);

    // Save the answer + evaluation
    await pool.query(
      `UPDATE interview_exchanges
       SET user_answer = $1, ai_evaluation = $2, answered_at = NOW()
       WHERE id = $3`,
      [userAnswer, JSON.stringify(evaluation), questionId]
    );

    // Decide: continue or finish (5 questions per session)
    const TOTAL_QUESTIONS = 5;
    const nextIndex = questionIndex + 1;
    const isDone = nextIndex >= TOTAL_QUESTIONS;

    let nextQuestion = null;
    let summary = null;

    if (!isDone) {
      nextQuestion = await generateQuestion(roleType, sessionId, nextIndex);
    } else {
      // Build summary from all exchanges in this session
      summary = await buildSessionSummary(sessionId);

      // Mark session as ended
      await pool.query(
        `UPDATE interview_sessions
         SET ended_at = NOW(),
             total_questions = $1,
             average_score = $2
         WHERE id = $3`,
        [TOTAL_QUESTIONS, summary.averageScore, sessionId]
      );
    }

    return res.json({ evaluation, nextQuestion, isDone, summary });
  } catch (err) {
    console.error('Interview answer error:', err);
    return res.status(500).json({ error: 'Failed to evaluate answer. Please try again.' });
  }
});

/**
 * GET /api/interview/history/:sessionId
 * Returns the full exchange history for a session.
 */
router.get('/history/:sessionId', sessionLimiter, async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = await pool.query(
      'SELECT * FROM interview_sessions WHERE id = $1',
      [sessionId]
    );
    if (session.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    const exchanges = await pool.query(
      `SELECT * FROM interview_exchanges
       WHERE session_id = $1
       ORDER BY question_index ASC`,
      [sessionId]
    );

    return res.json({
      session: session.rows[0],
      exchanges: exchanges.rows,
    });
  } catch (err) {
    console.error('History fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch session history.' });
  }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function generateQuestion(roleType, sessionId, questionIndex) {
  const categories = ROLE_CATEGORIES[roleType];
  // Cycle through categories so each session covers all topics
  const category = categories[questionIndex % categories.length];
  const roleLabel = ROLE_LABELS[roleType];

  const prompt = `
You are a strict but fair technical interviewer conducting a ${roleLabel} interview.
Generate ONE interview question for the category: ${category}.

The question should be:
- Appropriate for a fresher or junior developer (0-1 year experience)
- Clear and specific
- Answerable in 2-4 minutes verbally

Respond with ONLY this JSON structure, no other text:
{
  "question": "The interview question text.",
  "category": "${category}",
  "hint": "A subtle 1-sentence hint if the candidate is stuck (do not give away the answer).",
  "difficulty": "easy" | "medium" | "hard"
}
`.trim();

  const data = await askJSON(prompt);

  // Persist to DB
  const { rows } = await pool.query(
    `INSERT INTO interview_exchanges
       (session_id, question_index, category, question)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [sessionId, questionIndex, data.category || category, data.question]
  );

  return {
    id: rows[0].id,
    question: data.question,
    category: data.category || category,
    hint: data.hint,
    difficulty: data.difficulty,
    questionIndex,
  };
}

async function evaluateAnswer(question, userAnswer, category, roleType) {
  const roleLabel = ROLE_LABELS[roleType];

  // Handle empty / skipped answers gracefully
  if (!userAnswer || userAnswer.length < 5) {
    return {
      score: 0,
      verdict: 'No answer provided.',
      idealAnswer: 'Please attempt an answer before submitting.',
      missingPoints: ['Answer was skipped or too short.'],
      suggestions: ['Take time to think, then give a structured answer even if incomplete.'],
    };
  }

  const prompt = `
You are a senior technical interviewer for a ${roleLabel} position.

Question (${category}):
"${question}"

Candidate's answer:
"${userAnswer}"

Evaluate this answer honestly. Be fair but critical — this is a real interview.
Respond with ONLY this JSON structure, no other text:
{
  "score": <integer 1-10>,
  "verdict": "One sentence summary of the answer quality.",
  "idealAnswer": "The complete correct answer a strong candidate would give (3-6 sentences).",
  "missingPoints": ["Point they missed 1", "Point they missed 2"],
  "suggestions": ["How to improve suggestion 1", "How to improve suggestion 2"]
}

Scoring guide:
1-3: Incorrect or very incomplete
4-5: Partially correct, missing key concepts
6-7: Mostly correct, minor gaps
8-9: Strong answer with good depth
10: Perfect answer, nothing to add
`.trim();

  return await askJSON(prompt);
}

async function buildSessionSummary(sessionId) {
  const { rows } = await pool.query(
    `SELECT category, ai_evaluation
     FROM interview_exchanges
     WHERE session_id = $1 AND ai_evaluation IS NOT NULL
     ORDER BY question_index ASC`,
    [sessionId]
  );

  const scores = rows
    .map((r) => r.ai_evaluation?.score)
    .filter((s) => typeof s === 'number');

  const averageScore =
    scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : 0;

  // Identify weakest category
  const categoryScores = {};
  rows.forEach((r) => {
    const cat = r.category;
    const score = r.ai_evaluation?.score;
    if (cat && typeof score === 'number') {
      if (!categoryScores[cat]) categoryScores[cat] = [];
      categoryScores[cat].push(score);
    }
  });

  const categoryAverages = Object.entries(categoryScores).map(([cat, scrs]) => ({
    category: cat,
    average: Math.round((scrs.reduce((a, b) => a + b, 0) / scrs.length) * 10) / 10,
  }));

  const weakest = categoryAverages.sort((a, b) => a.average - b.average)[0];

  return {
    averageScore,
    categoryAverages,
    weakestCategory: weakest?.category || null,
    totalQuestions: rows.length,
    overallFeedback:
      averageScore >= 7
        ? 'Strong performance. Ready for a real interview.'
        : averageScore >= 5
        ? 'Decent foundation. Focus on the categories you struggled with.'
        : 'Needs significant preparation. Review fundamentals and practice more.',
  };
}

module.exports = router;

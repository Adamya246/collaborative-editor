const express = require('express');
const router = express.Router();
const { askJSON } = require('../services/gemini');
const pool = require('../db/pool');
const { aiLimiter } = require('../middleware/rateLimiter');

/**
 * POST /api/ai/explain
 * Body: { code: string, language?: string, roomId?: string }
 * Returns: { what, timeComplexity, spaceComplexity, optimizations, alternatives }
 */
router.post('/explain', aiLimiter, async (req, res) => {
  const { code, language = 'unknown', roomId } = req.body;

  if (!code || typeof code !== 'string' || code.trim().length === 0) {
    return res.status(400).json({ error: 'No code provided.' });
  }

  if (code.length > 8000) {
    return res.status(400).json({ error: 'Code is too long. Please select a smaller snippet (max ~8000 characters).' });
  }

  const prompt = `
You are an expert software engineer and technical interviewer.
Analyze the following ${language} code and respond with ONLY a valid JSON object — no markdown, no explanation outside the JSON.

Code:
\`\`\`${language}
${code.trim()}
\`\`\`

Return exactly this JSON structure:
{
  "what": "A clear 2-4 sentence explanation of what this code does.",
  "timeComplexity": {
    "value": "O(n) — or whatever it is",
    "explanation": "Why it is this complexity."
  },
  "spaceComplexity": {
    "value": "O(1) — or whatever it is",
    "explanation": "Why it is this complexity."
  },
  "optimizations": [
    "Optimization suggestion 1",
    "Optimization suggestion 2"
  ],
  "alternatives": [
    {
      "title": "Alternative approach name",
      "description": "Brief description of the alternative and when to prefer it."
    }
  ]
}

If there are no meaningful optimizations, return an empty array for optimizations.
If there are no meaningful alternatives, return an empty array for alternatives.
Return ONLY the JSON. No extra text.
`.trim();

  try {
    const explanation = await askJSON(prompt);

    // Persist to DB asynchronously — don't block the response
    pool.query(
      `INSERT INTO code_explanations (room_id, language, code_snippet, explanation)
       VALUES ($1, $2, $3, $4)`,
      [roomId || null, language, code.trim(), JSON.stringify(explanation)]
    ).catch((err) => console.error('DB insert error (non-fatal):', err));

    return res.json({ explanation });
  } catch (err) {
    console.error('Gemini explain error:', err);

    if (err.message?.includes('JSON')) {
      return res.status(502).json({ error: 'AI returned an unexpected format. Please try again.' });
    }
    if (err.status === 429) {
      return res.status(429).json({ error: 'AI rate limit reached. Please wait a moment.' });
    }

    return res.status(500).json({ error: 'Failed to explain code. Please try again.' });
  }
});

module.exports = router;

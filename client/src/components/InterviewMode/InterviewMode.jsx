import React, { useState } from 'react';
import './InterviewMode.css';

const ROLES = [
  { id: 'tcs_prime',  label: 'TCS Prime',          emoji: '🏆', desc: 'DSA, OOP, DBMS, OS' },
  { id: 'sde',        label: 'SDE',                 emoji: '⚙️', desc: 'DSA, System Design, OOP' },
  { id: 'frontend',   label: 'Frontend Developer',  emoji: '🎨', desc: 'JS, React, CSS, Performance' },
  { id: 'backend',    label: 'Backend Developer',   emoji: '🗄️', desc: 'Node.js, DBMS, APIs, Security' },
];

const TOTAL_QUESTIONS = 5;

/**
 * InterviewMode
 * Props:
 *   sessionId          — string or null
 *   currentQuestion    — { id, question, category, hint, difficulty, questionIndex } or null
 *   evaluation         — object or null
 *   summary            — object or null
 *   isDone             — boolean
 *   loading            — boolean
 *   error              — string or null
 *   onStart            — fn({ roleType, roomId })
 *   onSubmitAnswer     — fn(answerText)
 *   onAcknowledge      — fn() — dismiss evaluation and move to next question
 *   onReset            — fn()
 *   onClose            — fn()
 *   roomId             — string or null
 */
export default function InterviewMode({
  sessionId,
  currentQuestion,
  evaluation,
  summary,
  isDone,
  loading,
  error,
  onStart,
  onSubmitAnswer,
  onAcknowledge,
  onReset,
  onClose,
  roomId,
}) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);

  const handleStart = () => {
    if (!selectedRole) return;
    onStart({ roleType: selectedRole, roomId });
  };

  const handleSubmit = () => {
    if (!answer.trim() || loading) return;
    onSubmitAnswer(answer.trim());
    setAnswer('');
    setShowHint(false);
  };

  const handleReset = () => {
    setSelectedRole(null);
    setAnswer('');
    setShowHint(false);
    onReset();
  };

  const difficultyColor = { easy: '#a6e3a1', medium: '#f9e2af', hard: '#f38ba8' };

  return (
    <div className="interview-overlay" role="dialog" aria-modal="true" aria-label="Interview Mode">
      <div className="interview-modal">
        {/* Header */}
        <div className="interview-modal__header">
          <div className="interview-modal__title">
            <span>🎤</span> Interview Mode
          </div>
          <button className="interview-modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="interview-modal__body">
          {/* Error banner */}
          {error && (
            <div className="interview-error">⚠ {error}</div>
          )}

          {/* ── STEP 1: Role Picker ──────────────────────────────── */}
          {!sessionId && !loading && (
            <div className="interview-step">
              <p className="interview-step__subtitle">
                Choose a role. You'll get 5 questions covering different technical areas.
              </p>

              <div className="role-grid">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    className={`role-card ${selectedRole === r.id ? 'role-card--selected' : ''}`}
                    onClick={() => setSelectedRole(r.id)}
                  >
                    <span className="role-card__emoji">{r.emoji}</span>
                    <span className="role-card__label">{r.label}</span>
                    <span className="role-card__desc">{r.desc}</span>
                  </button>
                ))}
              </div>

              <button
                className="interview-btn interview-btn--primary"
                onClick={handleStart}
                disabled={!selectedRole}
              >
                Start Interview →
              </button>
            </div>
          )}

          {/* ── Loading (starting or evaluating) ─────────────────── */}
          {loading && (
            <div className="interview-loading">
              <div className="interview-spinner" />
              <p>{!currentQuestion ? 'Setting up your interview…' : 'Evaluating your answer…'}</p>
            </div>
          )}

          {/* ── STEP 2: Question ─────────────────────────────────── */}
          {!loading && sessionId && currentQuestion && !evaluation && !isDone && (
            <div className="interview-step">
              <div className="question-meta">
                <span className="question-meta__category">{currentQuestion.category}</span>
                <span
                  className="question-meta__difficulty"
                  style={{ color: difficultyColor[currentQuestion.difficulty] || '#cdd6f4' }}
                >
                  {currentQuestion.difficulty}
                </span>
                <span className="question-meta__progress">
                  {currentQuestion.questionIndex + 1} / {TOTAL_QUESTIONS}
                </span>
              </div>

              <div className="question-progress-bar">
                <div
                  className="question-progress-bar__fill"
                  style={{ width: `${((currentQuestion.questionIndex + 1) / TOTAL_QUESTIONS) * 100}%` }}
                />
              </div>

              <div className="question-box">
                <p className="question-box__text">{currentQuestion.question}</p>
              </div>

              {currentQuestion.hint && (
                <div className="question-hint">
                  {!showHint ? (
                    <button
                      className="question-hint__toggle"
                      onClick={() => setShowHint(true)}
                    >
                      💡 Show hint
                    </button>
                  ) : (
                    <p className="question-hint__text">💡 {currentQuestion.hint}</p>
                  )}
                </div>
              )}

              <textarea
                className="interview-textarea"
                placeholder="Type your answer here…"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={6}
                disabled={loading}
                autoFocus
              />

              <div className="interview-actions">
                <button
                  className="interview-btn interview-btn--secondary"
                  onClick={() => { setAnswer(''); onSubmitAnswer(''); }}
                  disabled={loading}
                >
                  Skip
                </button>
                <button
                  className="interview-btn interview-btn--primary"
                  onClick={handleSubmit}
                  disabled={!answer.trim() || loading}
                >
                  Submit Answer
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Evaluation ───────────────────────────────── */}
          {!loading && evaluation && !isDone && (
            <div className="interview-step">
              <div className="eval-score-row">
                <ScoreRing score={evaluation.score} />
                <div className="eval-verdict">
                  <p>{evaluation.verdict}</p>
                </div>
              </div>

              <EvalSection title="Ideal Answer" accent="green">
                <p>{evaluation.idealAnswer}</p>
              </EvalSection>

              {evaluation.missingPoints?.length > 0 && (
                <EvalSection title="What you missed" accent="red">
                  <ul className="eval-list">
                    {evaluation.missingPoints.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </EvalSection>
              )}

              {evaluation.suggestions?.length > 0 && (
                <EvalSection title="How to improve" accent="yellow">
                  <ul className="eval-list">
                    {evaluation.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </EvalSection>
              )}

              <button
                className="interview-btn interview-btn--primary"
                onClick={onAcknowledge}
                style={{ marginTop: 16 }}
              >
                Next Question →
              </button>
            </div>
          )}

          {/* ── STEP 4: Summary ──────────────────────────────────── */}
          {isDone && summary && (
            <div className="interview-step">
              <div className="summary-header">
                <ScoreRing score={summary.averageScore} large />
                <div>
                  <h3 className="summary-header__title">Interview Complete</h3>
                  <p className="summary-header__feedback">{summary.overallFeedback}</p>
                </div>
              </div>

              {summary.categoryAverages?.length > 0 && (
                <EvalSection title="Score by category" accent="blue">
                  <div className="category-scores">
                    {summary.categoryAverages.map((c) => (
                      <div key={c.category} className="category-score-row">
                        <span className="category-score-row__name">{c.category}</span>
                        <div className="category-score-row__bar-wrap">
                          <div
                            className="category-score-row__bar"
                            style={{
                              width: `${(c.average / 10) * 100}%`,
                              background: c.average >= 7 ? '#a6e3a1' : c.average >= 5 ? '#f9e2af' : '#f38ba8',
                            }}
                          />
                        </div>
                        <span className="category-score-row__num">{c.average}/10</span>
                      </div>
                    ))}
                  </div>
                </EvalSection>
              )}

              {summary.weakestCategory && (
                <div className="summary-tip">
                  Focus on: <strong>{summary.weakestCategory}</strong> — your lowest scoring area.
                </div>
              )}

              <button
                className="interview-btn interview-btn--primary"
                onClick={handleReset}
                style={{ marginTop: 16 }}
              >
                Start New Interview
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ScoreRing({ score, large }) {
  const r = large ? 36 : 28;
  const stroke = 4;
  const circumference = 2 * Math.PI * r;
  const progress = ((score || 0) / 10) * circumference;
  const color = score >= 7 ? '#a6e3a1' : score >= 5 ? '#f9e2af' : '#f38ba8';
  const size = (r + stroke) * 2;

  return (
    <div className={`score-ring ${large ? 'score-ring--large' : ''}`}>
      <svg width={size} height={size}>
        <circle
          cx={r + stroke}
          cy={r + stroke}
          r={r}
          fill="none"
          stroke="#313244"
          strokeWidth={stroke}
        />
        <circle
          cx={r + stroke}
          cy={r + stroke}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${r + stroke} ${r + stroke})`}
        />
      </svg>
      <span className="score-ring__label" style={{ color }}>
        {score}/10
      </span>
    </div>
  );
}

function EvalSection({ title, accent, children }) {
  const accentColors = {
    green: '#a6e3a1',
    red: '#f38ba8',
    yellow: '#f9e2af',
    blue: '#89b4fa',
  };
  return (
    <div className="eval-section">
      <h4
        className="eval-section__title"
        style={{ color: accentColors[accent] || '#cdd6f4' }}
      >
        {title}
      </h4>
      <div className="eval-section__body">{children}</div>
    </div>
  );
}

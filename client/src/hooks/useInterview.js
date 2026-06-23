import { useState, useCallback } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export function useInterview() {
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isDone, setIsDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startSession = useCallback(async ({ roleType, roomId }) => {
    setLoading(true);
    setError(null);
    setEvaluation(null);
    setSummary(null);
    setIsDone(false);

    try {
      const res = await fetch(`${API_BASE}/api/interview/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleType, roomId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start interview.');

      setSessionId(data.sessionId);
      setCurrentQuestion(data.question);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitAnswer = useCallback(
    async (answer) => {
      if (!sessionId || !currentQuestion) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE}/api/interview/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            questionId: currentQuestion.id,
            answer,
            roleType: currentQuestion.roleType,
            questionIndex: currentQuestion.questionIndex,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to evaluate answer.');

        setEvaluation(data.evaluation);

        if (data.isDone) {
          setIsDone(true);
          setSummary(data.summary);
          setCurrentQuestion(null);
        } else {
          // Next question available after user dismisses evaluation
          setCurrentQuestion((prev) => ({ ...data.nextQuestion, _prevQuestion: prev }));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [sessionId, currentQuestion]
  );

  const acknowledgeEvaluation = useCallback(() => {
    setEvaluation(null);
  }, []);

  const reset = useCallback(() => {
    setSessionId(null);
    setCurrentQuestion(null);
    setEvaluation(null);
    setSummary(null);
    setIsDone(false);
    setError(null);
  }, []);

  return {
    sessionId,
    currentQuestion,
    evaluation,
    summary,
    isDone,
    loading,
    error,
    startSession,
    submitAnswer,
    acknowledgeEvaluation,
    reset,
  };
}

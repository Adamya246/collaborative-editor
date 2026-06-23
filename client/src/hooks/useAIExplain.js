import { useState, useCallback } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export function useAIExplain() {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const explain = useCallback(async ({ code, language, roomId }) => {
    setLoading(true);
    setError(null);
    setExplanation(null);

    try {
      const res = await fetch(`${API_BASE}/api/ai/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: language || 'unknown', roomId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to explain code.');
      }

      setExplanation(data.explanation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setExplanation(null);
    setError(null);
  }, []);

  return { explanation, loading, error, explain, clear };
}

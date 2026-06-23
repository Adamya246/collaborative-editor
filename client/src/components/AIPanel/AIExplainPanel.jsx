import React from 'react';
import './AIExplainPanel.css';

/**
 * AIExplainPanel
 * Props:
 *   explanation  — object from API or null
 *   loading      — boolean
 *   error        — string or null
 *   onClose      — function
 */
export default function AIExplainPanel({ explanation, loading, error, onClose }) {
  return (
    <aside className="ai-panel" aria-label="Code explanation">
      <div className="ai-panel__header">
        <div className="ai-panel__title">
          <span className="ai-panel__icon">⚡</span>
          AI Code Analysis
        </div>
        <button className="ai-panel__close" onClick={onClose} aria-label="Close panel">
          ✕
        </button>
      </div>

      <div className="ai-panel__body">
        {loading && (
          <div className="ai-panel__loading">
            <div className="ai-panel__spinner" />
            <p>Analyzing code…</p>
          </div>
        )}

        {error && !loading && (
          <div className="ai-panel__error">
            <span>⚠</span> {error}
          </div>
        )}

        {!loading && !error && !explanation && (
          <div className="ai-panel__empty">
            Select some code in the editor, then click <strong>Explain Code</strong>.
          </div>
        )}

        {!loading && explanation && (
          <div className="ai-panel__content">
            <Section title="What it does">
              <p>{explanation.what}</p>
            </Section>

            <Section title="Time Complexity">
              <ComplexityBlock
                value={explanation.timeComplexity?.value}
                explanation={explanation.timeComplexity?.explanation}
              />
            </Section>

            <Section title="Space Complexity">
              <ComplexityBlock
                value={explanation.spaceComplexity?.value}
                explanation={explanation.spaceComplexity?.explanation}
              />
            </Section>

            {explanation.optimizations?.length > 0 && (
              <Section title="Optimizations">
                <ul className="ai-panel__list">
                  {explanation.optimizations.map((opt, i) => (
                    <li key={i}>{opt}</li>
                  ))}
                </ul>
              </Section>
            )}

            {explanation.alternatives?.length > 0 && (
              <Section title="Alternative Approaches">
                {explanation.alternatives.map((alt, i) => (
                  <div key={i} className="ai-panel__alt">
                    <strong>{alt.title}</strong>
                    <p>{alt.description}</p>
                  </div>
                ))}
              </Section>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

function Section({ title, children }) {
  return (
    <div className="ai-section">
      <h3 className="ai-section__title">{title}</h3>
      <div className="ai-section__body">{children}</div>
    </div>
  );
}

function ComplexityBlock({ value, explanation }) {
  return (
    <div className="ai-complexity">
      <span className="ai-complexity__badge">{value}</span>
      {explanation && <p className="ai-complexity__desc">{explanation}</p>}
    </div>
  );
}

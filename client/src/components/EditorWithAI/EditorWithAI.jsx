import React, { useState, useRef, useCallback } from 'react';
import { useAIExplain } from '../../hooks/useAIExplain';
import { useInterview } from '../../hooks/useInterview';
import AIExplainPanel from '../AIPanel/AIExplainPanel';
import InterviewMode from '../InterviewMode/InterviewMode';
import './EditorWithAI.css';

/**
 * EditorWithAI
 *
 * Drop-in wrapper around your existing Editor / Monaco setup.
 *
 * Usage — replace your current <Editor ... /> with:
 *   <EditorWithAI roomId={roomId} language={language}>
 *     {({ editorRef }) => (
 *       <YourExistingMonacoEditor ref={editorRef} ... />
 *     )}
 *   </EditorWithAI>
 *
 * OR if you're mounting Monaco imperatively, pass the editor instance
 * via the editorRef prop after mount.
 *
 * Props:
 *   children  — render prop: ({ editorRef }) => JSX
 *   roomId    — string (from your existing room logic)
 *   language  — string (from your existing language selector)
 */
export default function EditorWithAI({ children, roomId, language }) {
  const editorRef = useRef(null);

  // AI Explain state
  const { explanation, loading: explainLoading, error: explainError, explain, clear } = useAIExplain();
  const [panelOpen, setPanelOpen] = useState(false);

  // Interview state
  const [interviewOpen, setInterviewOpen] = useState(false);
  const interview = useInterview();

  // Called when user clicks "Explain Code"
  const handleExplainClick = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // Monaco API: get selected text
    const selection = editor.getSelection();
    const model = editor.getModel();
    if (!selection || !model) return;

    const selectedCode = model.getValueInRange(selection);
    if (!selectedCode || !selectedCode.trim()) {
      alert('Select some code in the editor first.');
      return;
    }

    setPanelOpen(true);
    explain({ code: selectedCode, language, roomId });
  }, [explain, language, roomId]);

  const handleClosePanel = useCallback(() => {
    setPanelOpen(false);
    clear();
  }, [clear]);

  // Interview controls
  const handleOpenInterview = () => setInterviewOpen(true);
  const handleCloseInterview = () => setInterviewOpen(false);

  return (
    <div className="editor-ai-root">
      {/* AI toolbar — sits above the editor */}
      <div className="editor-ai-toolbar">
        <button
          className="ai-toolbar-btn ai-toolbar-btn--explain"
          onClick={handleExplainClick}
          title="Select code in the editor, then click to explain it"
        >
          <span>⚡</span> Explain Code
        </button>

        <button
          className="ai-toolbar-btn ai-toolbar-btn--interview"
          onClick={handleOpenInterview}
          title="Start an AI-powered mock interview"
        >
          <span>🎤</span> Interview Me
        </button>
      </div>

      {/* Editor + optional side panel */}
      <div className="editor-ai-content">
        <div className="editor-ai-main">
          {/* Render the existing editor via render prop */}
          {children({ editorRef })}
        </div>

        {panelOpen && (
          <AIExplainPanel
            explanation={explanation}
            loading={explainLoading}
            error={explainError}
            onClose={handleClosePanel}
          />
        )}
      </div>

      {/* Interview modal */}
      {interviewOpen && (
        <InterviewMode
          sessionId={interview.sessionId}
          currentQuestion={interview.currentQuestion}
          evaluation={interview.evaluation}
          summary={interview.summary}
          isDone={interview.isDone}
          loading={interview.loading}
          error={interview.error}
          onStart={interview.startSession}
          onSubmitAnswer={interview.submitAnswer}
          onAcknowledge={interview.acknowledgeEvaluation}
          onReset={interview.reset}
          onClose={handleCloseInterview}
          roomId={roomId}
        />
      )}
    </div>
  );
}

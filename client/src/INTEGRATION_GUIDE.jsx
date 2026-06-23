/**
 * INTEGRATION EXAMPLE
 * ───────────────────
 * This file shows exactly how to wire EditorWithAI into your
 * existing Editor page / component. You do NOT need to copy this
 * file — use it as a reference to update your current Editor component.
 *
 * Your current Editor component probably looks something like this:
 *
 *   export default function EditorPage() {
 *     const editorRef = useRef(null);
 *     ...
 *     return (
 *       <div className="editor-page">
 *         <Navbar ... />
 *         <MonacoEditor
 *           onMount={(editor) => { editorRef.current = editor; }}
 *           ...
 *         />
 *       </div>
 *     );
 *   }
 *
 * CHANGE REQUIRED: Wrap just the Monaco editor section with <EditorWithAI>.
 * Everything else (Navbar, room logic, Socket.IO) stays exactly as-is.
 */

import React, { useRef } from 'react';
import Editor from '@monaco-editor/react'; // your existing Monaco import
import EditorWithAI from '../components/EditorWithAI/EditorWithAI';

// ── Minimal example ──────────────────────────────────────────────────────────

export default function EditorPage({ roomId, language }) {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Your existing Navbar / room controls go here — unchanged */}
      {/* <Navbar roomId={roomId} ... /> */}

      {/*
        Wrap just the Monaco editor area with EditorWithAI.
        Pass roomId and language from your existing state.
      */}
      <EditorWithAI roomId={roomId} language={language} style={{ flex: 1 }}>
        {({ editorRef }) => (
          <Editor
            height="100%"
            language={language || 'javascript'}
            theme="vs-dark"
            onMount={(editor) => {
              // This is the key line: give EditorWithAI access to the Monaco instance
              editorRef.current = editor;
            }}
            // Keep all your existing onChange / value / options props here
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
            }}
          />
        )}
      </EditorWithAI>

    </div>
  );
}

/*
 * SUMMARY OF CHANGES TO YOUR EXISTING CODE:
 * ──────────────────────────────────────────
 * 1. Import EditorWithAI at the top of your Editor page file.
 * 2. Wrap <Editor ... /> (the Monaco component) with <EditorWithAI roomId={...} language={...}>.
 * 3. Convert the Monaco editor to the render-prop pattern shown above.
 * 4. Make sure your existing onMount callback passes the editor to editorRef.current.
 *
 * That's it. No other file in your project needs to change.
 */

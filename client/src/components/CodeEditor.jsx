import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import EditorWithAI from './EditorWithAI/EditorWithAI';

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java',
  'cpp', 'c', 'html', 'css', 'sql', 'go', 'rust'
];

const headerStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '10px 20px', background: '#252526', borderBottom: '1px solid #3c3c3c'
};

export default function CodeEditor({ roomData }) {
  const { roomId, username } = roomData;
  const socketRef = useRef(null);

  const [code, setCode] = useState('// Loading...');
  const [language, setLanguage] = useState('javascript');
  const [users, setUsers] = useState([]);

  // Flag to prevent echo — when we receive a remote change,
  // we update state but DON'T re-emit it back to the server
  const isRemoteChange = useRef(false);

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    // Join the room
    socketRef.current.emit('join-room', { roomId, username });

    // Server sends us the current room state when we join
    socketRef.current.on('room-joined', ({ code, language, users }) => {
      setCode(code);
      setLanguage(language);
      setUsers(users);
    });

    // Another user typed — update our editor without re-emitting
    socketRef.current.on('code-update', ({ code }) => {
      isRemoteChange.current = true;
      setCode(code);
    });

    // Another user changed language
    socketRef.current.on('language-update', ({ language }) => {
      setLanguage(language);
    });

    socketRef.current.on('user-joined', ({ users }) => setUsers(users));
    socketRef.current.on('user-left', ({ users }) => setUsers(users));

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId, username]);

  const handleCodeChange = (value) => {
    // If change came from remote, skip emitting
    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }
    setCode(value);
    socketRef.current.emit('code-change', { roomId, code: value });
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    socketRef.current.emit('language-change', { roomId, language: lang });
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert(`Room ID "${roomId}" copied! Share with teammates.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#1e1e1e' }}>
      
      {/* ── Header Bar ── */}
      <div style={headerStyle}>
        
        {/* Room ID */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#888', fontSize: '13px' }}>Room:</span>
          <strong style={{ color: '#007acc', fontSize: '14px' }}>{roomId}</strong>
          <button
            onClick={copyRoomId}
            style={{ padding: '3px 10px', background: '#3c3c3c', color: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
          >
            Copy
          </button>
        </div>

        {/* Language Selector */}
        <select
          value={language}
          onChange={handleLanguageChange}
          style={{ padding: '6px 10px', background: '#1e1e1e', color: '#fff', border: '1px solid #555', borderRadius: '4px', fontSize: '13px' }}
        >
          {LANGUAGES.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>

        {/* Online Users */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ color: '#888', fontSize: '12px' }}>Online:</span>
          {users.map(u => (
            <span
              key={u.id}
              style={{
                background: u.username === username ? '#007acc' : '#444',
                padding: '3px 10px', borderRadius: '12px',
                color: '#fff', fontSize: '12px'
              }}
            >
              {u.username}{u.username === username ? ' (you)' : ''}
            </span>
          ))}
        </div>
      </div>

      {/* ── Monaco Editor wrapped with AI features ── */}
      <EditorWithAI roomId={roomId} language={language}>
        {({ editorRef }) => (
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            onMount={(editor) => {
              editorRef.current = editor;
            }}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              wordWrap: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              tabSize: 2,
            }}
          />
        )}
      </EditorWithAI>

    </div>
  );
}
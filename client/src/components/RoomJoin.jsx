import { useState } from 'react';

const styles = {
  container: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '100vh', gap: '16px'
  },
  title: { color: '#007acc', fontSize: '2rem', marginBottom: '8px' },
  input: {
    padding: '12px', width: '320px', borderRadius: '6px',
    border: '1px solid #444', background: '#2d2d2d',
    color: '#fff', fontSize: '14px', outline: 'none'
  },
  btnRow: { display: 'flex', gap: '12px', marginTop: '8px' },
  btnJoin: {
    padding: '10px 24px', background: '#007acc', color: '#fff',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
  },
  btnCreate: {
    padding: '10px 24px', background: '#28a745', color: '#fff',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
  },
  hint: { color: '#888', fontSize: '12px' }
};

export default function RoomJoin({ onJoin }) {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleJoin = () => {
    if (!username.trim()) return setError('Enter your name first');
    if (!roomId.trim()) return setError('Enter a Room ID to join');
    onJoin({ roomId: roomId.toUpperCase(), username });
  };

  const handleCreate = () => {
    if (!username.trim()) return setError('Enter your name first');
    // Generate a random 6-char room ID
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    onJoin({ roomId: newRoomId, username });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{'</> Code Together'}</h1>
      <p style={styles.hint}>Real-time collaborative code editor</p>

      <input
        style={styles.input}
        placeholder="Your name"
        value={username}
        onChange={e => { setUsername(e.target.value); setError(''); }}
      />
      <input
        style={styles.input}
        placeholder="Room ID (to join existing room)"
        value={roomId}
        onChange={e => { setRoomId(e.target.value.toUpperCase()); setError(''); }}
      />

      {error && <p style={{ color: '#ff4444', fontSize: '13px' }}>{error}</p>}

      <div style={styles.btnRow}>
        <button style={styles.btnJoin} onClick={handleJoin}>Join Room</button>
        <button style={styles.btnCreate} onClick={handleCreate}>Create New Room</button>
      </div>
    </div>
  );
}
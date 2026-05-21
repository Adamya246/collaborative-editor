import { useState } from 'react';
import RoomJoin from './components/RoomJoin';
import CodeEditor from './components/CodeEditor';
import './App.css';

function App() {
  const [roomData, setRoomData] = useState(null);

  return (
    <div style={{ height: '100vh', background: '#1e1e1e', color: '#fff', fontFamily: 'monospace' }}>
      {!roomData
        ? <RoomJoin onJoin={setRoomData} />
        : <CodeEditor roomData={roomData} />
      }
    </div>
  );
}

export default App;
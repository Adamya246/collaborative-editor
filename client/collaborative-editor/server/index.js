const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// In-memory room store
// Structure: { roomId: { code, language, users: [{id, username}] } }
const rooms = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // --- JOIN ROOM ---
  socket.on('join-room', ({ roomId, username }) => {
    socket.join(roomId);

    // Create room if it doesn't exist
    if (!rooms[roomId]) {
      rooms[roomId] = {
        code: '// Start coding here...',
        language: 'javascript',
        users: []
      };
    }

    // Add user to room
    rooms[roomId].users.push({ id: socket.id, username });

    // Send current room state to the joining user
    socket.emit('room-joined', {
      code: rooms[roomId].code,
      language: rooms[roomId].language,
      users: rooms[roomId].users
    });

    // Notify everyone else in the room
    socket.to(roomId).emit('user-joined', {
      username,
      users: rooms[roomId].users
    });

    // Store on socket for cleanup on disconnect
    socket.roomId = roomId;
    socket.username = username;
  });

  // --- CODE CHANGE ---
  // When one user types, broadcast to everyone else in the room
  socket.on('code-change', ({ roomId, code }) => {
    if (rooms[roomId]) {
      rooms[roomId].code = code; // persist latest code in memory
    }
    socket.to(roomId).emit('code-update', { code });
  });

  // --- LANGUAGE CHANGE ---
  socket.on('language-change', ({ roomId, language }) => {
    if (rooms[roomId]) {
      rooms[roomId].language = language;
    }
    socket.to(roomId).emit('language-update', { language });
  });

  // --- DISCONNECT ---
  socket.on('disconnect', () => {
    const { roomId, username } = socket;
    if (roomId && rooms[roomId]) {
      // Remove user from room
      rooms[roomId].users = rooms[roomId].users.filter(u => u.id !== socket.id);

      // Notify others
      socket.to(roomId).emit('user-left', {
        username,
        users: rooms[roomId].users
      });

      // Clean up empty rooms
      if (rooms[roomId].users.length === 0) {
        delete rooms[roomId];
        console.log(`Room ${roomId} deleted (empty)`);
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
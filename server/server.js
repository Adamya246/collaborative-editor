require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '50kb' }));

// ─── AI Routes ────────────────────────────────────────────────────────────────
const explainRouter = require('./routes/explain');
const interviewRouter = require('./routes/interview');
app.use('/api/ai', explainRouter);
app.use('/api/interview', interviewRouter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ─── In-memory room state ─────────────────────────────────────────────────────
// rooms[roomId] = { code, language, users: Map<socketId, username> }
const rooms = {};

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join-room', ({ roomId, username }) => {
    socket.join(roomId);

    // Initialize room if it doesn't exist
    if (!rooms[roomId]) {
      rooms[roomId] = {
        code: '// Start coding here...',
        language: 'javascript',
        users: new Map(),
      };
    }

    // Add this user
    rooms[roomId].users.set(socket.id, username);

    // Build users array for the frontend
    const usersArray = Array.from(rooms[roomId].users.entries()).map(
      ([id, name]) => ({ id, username: name })
    );

    // Send current room state to the joining user
    socket.emit('room-joined', {
      code: rooms[roomId].code,
      language: rooms[roomId].language,
      users: usersArray,
    });

    // Tell everyone else a new user joined
    socket.to(roomId).emit('user-joined', { users: usersArray });

    socket.on('code-change', ({ roomId, code }) => {
      if (rooms[roomId]) rooms[roomId].code = code;
      socket.to(roomId).emit('code-update', { code });
    });

    socket.on('language-change', ({ roomId, language }) => {
      if (rooms[roomId]) rooms[roomId].language = language;
      socket.to(roomId).emit('language-update', { language });
    });

    socket.on('disconnect', () => {
      if (rooms[roomId]) {
        rooms[roomId].users.delete(socket.id);
        if (rooms[roomId].users.size === 0) {
          delete rooms[roomId];
        } else {
          const remaining = Array.from(rooms[roomId].users.entries()).map(
            ([id, name]) => ({ id, username: name })
          );
          socket.to(roomId).emit('user-left', { users: remaining });
        }
      }
    });
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
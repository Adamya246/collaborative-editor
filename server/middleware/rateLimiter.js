const rateLimit = require('express-rate-limit');

// Strict limiter for AI endpoints — these hit the Gemini API
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute window
  max: 30,                   // max 10 AI requests per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please wait a moment before trying again.',
  },
});

// More lenient limiter for interview session management (not AI calls)
const sessionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests.',
  },
});

module.exports = { aiLimiter, sessionLimiter };

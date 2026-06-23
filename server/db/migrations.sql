-- Run this against your existing collab_editor database
-- It adds two new tables for AI features only. Nothing existing is changed.

-- Stores interview sessions
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id VARCHAR(255),                        -- links to your existing room, nullable
  role_type VARCHAR(100) NOT NULL,             -- 'tcs_prime' | 'sde' | 'frontend' | 'backend'
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  total_questions INTEGER DEFAULT 0,
  average_score NUMERIC(4,2)
);

-- Stores each question + answer exchange in an interview
CREATE TABLE IF NOT EXISTS interview_exchanges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  category VARCHAR(100) NOT NULL,             -- 'DBMS' | 'OOP' | 'DSA' | 'Projects'
  question TEXT NOT NULL,
  user_answer TEXT,
  ai_evaluation JSONB,                        -- { score, ideal_answer, missing_points, suggestions }
  asked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  answered_at TIMESTAMPTZ
);

-- Index for fast session lookups
CREATE INDEX IF NOT EXISTS idx_interview_exchanges_session 
  ON interview_exchanges(session_id);

-- Stores AI code explanation history (optional, for resume talking point)
CREATE TABLE IF NOT EXISTS code_explanations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id VARCHAR(255),
  language VARCHAR(50),
  code_snippet TEXT NOT NULL,
  explanation JSONB NOT NULL,               -- { what, time_complexity, space_complexity, optimizations, alternatives }
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  package_id TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000
);

-- Create checklist_items table
CREATE TABLE IF NOT EXISTS checklist_items (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('unchecked', 'checking', 'done', 'failed', 'need-rework')),
  evidence TEXT,
  severity TEXT CHECK (severity IS NULL OR severity IN ('critical', 'high', 'medium', 'low')),
  created_at BIGINT NOT NULL
);

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checklist_items_game_id ON checklist_items(game_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_game_section ON checklist_items(game_id, section_id);

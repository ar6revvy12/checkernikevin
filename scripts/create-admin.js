const bcrypt = require('bcryptjs');

// Configuration - UPDATE THESE VALUES
const ADMIN_EMAIL = 'admin@dijoker.com';
const ADMIN_PASSWORD = 'admin123'; // Change this to a secure password
const ADMIN_NAME = 'Super Admin';

async function createAdminSQL() {
  try {
    // Hash the password
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    
    console.log('\n=== ADMIN ACCOUNT SETUP ===\n');
    console.log('Step 1: Run this SQL in Supabase SQL Editor to create the tables:\n');
    console.log('------------------------------------------------------------');
    console.log(`
-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('admin', 'quality-assurance', 'backend', 'game-developer', 'team')),
  team TEXT NOT NULL DEFAULT 'Di Joker',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_team ON users(team);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('------------------------------------------------------------\n');
    
    console.log('Step 2: Run this SQL to create your admin account:\n');
    console.log('------------------------------------------------------------');
    console.log(`
INSERT INTO users (email, password_hash, name, user_type, team)
VALUES (
  '${ADMIN_EMAIL}',
  '${passwordHash}',
  '${ADMIN_NAME}',
  'admin',
  'Di Joker'
);
    `);
    console.log('------------------------------------------------------------\n');
    
    console.log('Credentials:');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log('\n⚠️  Remember to change the password after first login!\n');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdminSQL();

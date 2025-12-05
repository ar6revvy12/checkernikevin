-- Add dev_comment column to bugs table
-- Run this in your Supabase SQL editor

ALTER TABLE bugs ADD COLUMN IF NOT EXISTS dev_comment TEXT;

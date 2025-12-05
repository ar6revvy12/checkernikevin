-- Add 'not-tested' status to functional_tests table
-- Run this in your Supabase SQL editor

-- Drop the existing constraint
ALTER TABLE public.functional_tests DROP CONSTRAINT IF EXISTS functional_tests_status_check;

-- Add the new constraint with 'not-tested' included
ALTER TABLE public.functional_tests ADD CONSTRAINT functional_tests_status_check CHECK (
  status = ANY (ARRAY['running'::text, 'not-running'::text, 'not-tested'::text])
);

-- Update the default status to 'not-tested'
ALTER TABLE public.functional_tests ALTER COLUMN status SET DEFAULT 'not-tested';

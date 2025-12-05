-- Add 'not-tested' status to regression_tests table
-- Run this in your Supabase SQL editor

-- Drop the existing constraint
ALTER TABLE public.regression_tests DROP CONSTRAINT IF EXISTS regression_tests_status_check;

-- Add the new constraint with 'not-tested' included
ALTER TABLE public.regression_tests ADD CONSTRAINT regression_tests_status_check CHECK (
  status = ANY (ARRAY['pass'::text, 'fail'::text, 'not-tested'::text])
);

-- Update the default status to 'not-tested'
ALTER TABLE public.regression_tests ALTER COLUMN status SET DEFAULT 'not-tested';

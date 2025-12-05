-- Add dev_status column to bugs table for developer status tracking
-- Run this in Supabase SQL Editor

-- Add the dev_status column with default value 'pending'
ALTER TABLE public.bugs
ADD COLUMN IF NOT EXISTS dev_status text NOT NULL DEFAULT 'pending';

-- Add check constraint for valid dev_status values
ALTER TABLE public.bugs
ADD CONSTRAINT bugs_dev_status_check CHECK (
  dev_status = ANY (ARRAY['pending'::text, 'in-progress'::text, 'completed'::text, 'needs-info'::text])
);

-- Create index for dev_status for better query performance
CREATE INDEX IF NOT EXISTS idx_bugs_dev_status ON public.bugs USING btree (dev_status);

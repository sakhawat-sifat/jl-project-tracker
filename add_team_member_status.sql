-- Run this SQL in your Supabase SQL Editor to add status column to team_members

-- Add status column to team_members table
ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' 
CHECK (status IN ('active', 'inactive'));

-- Update existing team members to have 'active' status
UPDATE team_members SET status = 'active' WHERE status IS NULL;

-- Verify the column is added
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'team_members' 
ORDER BY ordinal_position;

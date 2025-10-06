-- Run this SQL in your Supabase SQL Editor to remove budget and logo columns

-- Drop budget column from projects table
ALTER TABLE projects DROP COLUMN IF EXISTS budget;

-- Drop logo column from projects table
ALTER TABLE projects DROP COLUMN IF EXISTS logo;

-- Verify the columns are removed
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'projects' 
ORDER BY ordinal_position;

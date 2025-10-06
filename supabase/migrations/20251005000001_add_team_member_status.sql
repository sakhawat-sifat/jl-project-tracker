/*
  # Add status column to team_members table
  
  This migration adds a status column to the team_members table
  to track whether a team member is active or inactive.
  
  Changes:
    - Add `status` column to team_members table with default value 'active'
    - Update existing team members to have 'active' status
*/

-- Add status column to team_members table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_members' AND column_name = 'status'
  ) THEN
    -- Add status column with default value 'active'
    ALTER TABLE team_members 
    ADD COLUMN status text DEFAULT 'active' 
    CHECK (status IN ('active', 'inactive'));
    
    -- Update existing team members to have 'active' status
    UPDATE team_members SET status = 'active' WHERE status IS NULL;
    
    RAISE NOTICE 'Status column added to team_members table successfully';
  ELSE
    RAISE NOTICE 'Status column already exists in team_members table';
  END IF;
END $$;

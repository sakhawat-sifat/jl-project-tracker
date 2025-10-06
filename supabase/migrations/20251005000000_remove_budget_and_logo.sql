/*
  # Remove budget and logo columns from projects table
  
  This migration removes the budget and logo columns from the projects table
  as they are no longer needed in the application.
  
  Changes:
    - Drop `budget` column from projects table
    - Drop `logo` column from projects table
*/

-- Drop budget column from projects table if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'budget'
  ) THEN
    ALTER TABLE projects DROP COLUMN budget;
    RAISE NOTICE 'Budget column dropped from projects table successfully';
  ELSE
    RAISE NOTICE 'Budget column does not exist in projects table';
  END IF;
END $$;

-- Drop logo column from projects table if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'logo'
  ) THEN
    ALTER TABLE projects DROP COLUMN logo;
    RAISE NOTICE 'Logo column dropped from projects table successfully';
  ELSE
    RAISE NOTICE 'Logo column does not exist in projects table';
  END IF;
END $$;

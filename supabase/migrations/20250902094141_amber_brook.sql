/*
  # Add logo column to projects table

  1. Changes
    - Add `logo` column to projects table to support project logos/icons
    - Set default value to ensure existing projects have a logo

  2. Notes
    - This column will store either emoji icons or URLs to uploaded images
    - Default value is a folder emoji for existing projects
*/

-- Add logo column to projects table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'logo'
  ) THEN
    ALTER TABLE projects ADD COLUMN logo text DEFAULT '📁';
    
    -- Update existing projects to have a default logo
    UPDATE projects SET logo = '📁' WHERE logo IS NULL;
    
    RAISE NOTICE 'Logo column added to projects table successfully';
  ELSE
    RAISE NOTICE 'Logo column already exists in projects table';
  END IF;
END $$;
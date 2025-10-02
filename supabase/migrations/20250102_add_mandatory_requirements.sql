-- Add mandatory_requirements JSONB column to application_profile table
ALTER TABLE application_profile 
ADD COLUMN IF NOT EXISTS mandatory_requirements JSONB;

-- Create an index on the mandatory_requirements column for better performance
CREATE INDEX IF NOT EXISTS idx_application_profile_mandatory_requirements 
ON application_profile USING GIN (mandatory_requirements);

-- Create a view to easily get mandatory requirements summary
CREATE OR REPLACE VIEW mandatory_requirements_summary AS
SELECT 
  ap.user_id,
  ap.mandatory_requirements,
  CASE 
    WHEN ap.mandatory_requirements IS NOT NULL THEN
      -- Calculate completion percentage
      ROUND(
        (
          SELECT COUNT(*)::float 
          FROM jsonb_each(ap.mandatory_requirements) as mr(key, value)
          WHERE (value->>'completed')::boolean = true
        ) * 100.0 / 
        (
          SELECT COUNT(*)::float 
          FROM jsonb_each(ap.mandatory_requirements)
        )
      )
    ELSE 0
  END as completion_percentage,
  ap.updated_at
FROM application_profile ap
WHERE ap.mandatory_requirements IS NOT NULL;
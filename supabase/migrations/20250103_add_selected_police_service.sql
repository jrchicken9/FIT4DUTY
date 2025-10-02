-- Add selected_police_service column to application_profile table
ALTER TABLE application_profile 
ADD COLUMN IF NOT EXISTS selected_police_service text;

-- Add comment for documentation
COMMENT ON COLUMN application_profile.selected_police_service IS 'The police service ID that the user has selected for their application';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_application_profile_selected_service 
ON application_profile (selected_police_service);

-- Add constraint to ensure valid service IDs
ALTER TABLE application_profile 
ADD CONSTRAINT check_valid_police_service 
CHECK (selected_police_service IN ('toronto', 'opp', 'peel', 'york', 'durham', 'hamilton', 'windsor', 'kingston', 'ottawa', 'london'));

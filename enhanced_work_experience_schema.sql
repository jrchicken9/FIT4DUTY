-- Enhanced Work Experience Schema for Police Recruitment Evaluation
-- This migration adds new columns to capture detailed work experience information

-- Add new columns to application_profile table for enhanced work experience evaluation
ALTER TABLE application_profile 
ADD COLUMN IF NOT EXISTS work_experience_enhanced JSONB DEFAULT '[]'::jsonb;

-- Create a function to calculate work experience score
CREATE OR REPLACE FUNCTION calculate_work_experience_score(work_data JSONB)
RETURNS INTEGER AS $$
DECLARE
    total_score INTEGER := 0;
    entry JSONB;
    role_score INTEGER := 0;
    duration_score INTEGER := 0;
    leadership_score INTEGER := 0;
    public_interaction_score INTEGER := 0;
    emergency_score INTEGER := 0;
    security_score INTEGER := 0;
    customer_service_score INTEGER := 0;
    technical_score INTEGER := 0;
    months_worked INTEGER;
    role_type TEXT;
    has_leadership BOOLEAN;
    public_interaction_level TEXT;
    emergency_exposure BOOLEAN;
    security_exposure BOOLEAN;
    customer_service_level TEXT;
    technical_skills TEXT[];
BEGIN
    -- Loop through each work experience entry
    FOR entry IN SELECT * FROM jsonb_array_elements(work_data)
    LOOP
        -- Reset scores for this entry
        role_score := 0;
        duration_score := 0;
        leadership_score := 0;
        public_interaction_score := 0;
        emergency_score := 0;
        security_score := 0;
        customer_service_score := 0;
        technical_score := 0;
        
        -- Extract data from entry
        months_worked := COALESCE((entry->>'months')::INTEGER, 0);
        role_type := COALESCE(entry->>'role_type', 'other');
        has_leadership := COALESCE((entry->>'has_leadership')::BOOLEAN, false);
        public_interaction_level := COALESCE(entry->>'public_interaction_level', 'none');
        emergency_exposure := COALESCE((entry->>'emergency_exposure')::BOOLEAN, false);
        security_exposure := COALESCE((entry->>'security_exposure')::BOOLEAN, false);
        customer_service_level := COALESCE(entry->>'customer_service_level', 'none');
        technical_skills := ARRAY(SELECT jsonb_array_elements_text(COALESCE(entry->'technical_skills', '[]'::jsonb)));
        
        -- Role Type Scoring (0-25 points)
        CASE role_type
            WHEN 'law_enforcement' THEN role_score := 25;
            WHEN 'military' THEN role_score := 23;
            WHEN 'security' THEN role_score := 20;
            WHEN 'emergency_services' THEN role_score := 18;
            WHEN 'corrections' THEN role_score := 17;
            WHEN 'social_services' THEN role_score := 15;
            WHEN 'healthcare' THEN role_score := 14;
            WHEN 'education' THEN role_score := 12;
            WHEN 'customer_service' THEN role_score := 10;
            WHEN 'retail' THEN role_score := 8;
            WHEN 'hospitality' THEN role_score := 8;
            WHEN 'office_admin' THEN role_score := 6;
            WHEN 'manual_labor' THEN role_score := 5;
            WHEN 'other' THEN role_score := 3;
            ELSE role_score := 3;
        END CASE;
        
        -- Duration Scoring (0-20 points)
        IF months_worked >= 60 THEN -- 5+ years
            duration_score := 20;
        ELSIF months_worked >= 36 THEN -- 3+ years
            duration_score := 16;
        ELSIF months_worked >= 24 THEN -- 2+ years
            duration_score := 12;
        ELSIF months_worked >= 12 THEN -- 1+ year
            duration_score := 8;
        ELSIF months_worked >= 6 THEN -- 6+ months
            duration_score := 4;
        ELSE
            duration_score := 2;
        END IF;
        
        -- Leadership Scoring (0-15 points)
        IF has_leadership THEN
            leadership_score := 15;
        END IF;
        
        -- Public Interaction Scoring (0-15 points)
        CASE public_interaction_level
            WHEN 'high' THEN public_interaction_score := 15;
            WHEN 'moderate' THEN public_interaction_score := 10;
            WHEN 'low' THEN public_interaction_score := 5;
            ELSE public_interaction_score := 0;
        END CASE;
        
        -- Emergency Exposure Scoring (0-10 points)
        IF emergency_exposure THEN
            emergency_score := 10;
        END IF;
        
        -- Security Exposure Scoring (0-10 points)
        IF security_exposure THEN
            security_score := 10;
        END IF;
        
        -- Customer Service Scoring (0-5 points)
        CASE customer_service_level
            WHEN 'high' THEN customer_service_score := 5;
            WHEN 'moderate' THEN customer_service_score := 3;
            WHEN 'low' THEN customer_service_score := 1;
            ELSE customer_service_score := 0;
        END CASE;
        
        -- Technical Skills Scoring (0-5 points)
        IF array_length(technical_skills, 1) >= 3 THEN
            technical_score := 5;
        ELSIF array_length(technical_skills, 1) >= 2 THEN
            technical_score := 3;
        ELSIF array_length(technical_skills, 1) >= 1 THEN
            technical_score := 1;
        END IF;
        
        -- Add this entry's score to total (capped at 100 points per entry)
        total_score := total_score + LEAST(role_score + duration_score + leadership_score + 
                                          public_interaction_score + emergency_score + 
                                          security_score + customer_service_score + technical_score, 100);
    END LOOP;
    
    -- Cap total score at 100
    RETURN LEAST(total_score, 100);
END;
$$ LANGUAGE plpgsql;

-- Create a function to determine work experience level
CREATE OR REPLACE FUNCTION get_work_experience_level(score INTEGER)
RETURNS TEXT AS $$
BEGIN
    IF score >= 85 THEN
        RETURN 'COMPETITIVE';
    ELSIF score >= 65 THEN
        RETURN 'EFFECTIVE';
    ELSIF score >= 40 THEN
        RETURN 'DEVELOPING';
    ELSE
        RETURN 'NEEDS_WORK';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_application_profile_work_enhanced 
ON application_profile USING GIN (work_experience_enhanced);

-- Add comments for documentation
COMMENT ON COLUMN application_profile.work_experience_enhanced IS 'Enhanced work experience data with detailed scoring information for police recruitment evaluation';
COMMENT ON FUNCTION calculate_work_experience_score(JSONB) IS 'Calculates work experience score based on role type, duration, leadership, public interaction, and other factors relevant to police recruitment';
COMMENT ON FUNCTION get_work_experience_level(INTEGER) IS 'Determines work experience level (COMPETITIVE/EFFECTIVE/DEVELOPING/NEEDS_WORK) based on calculated score';











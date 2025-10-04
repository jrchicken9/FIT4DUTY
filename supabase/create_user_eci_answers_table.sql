-- Create user_eci_answers table for ECI (Essential Competency Interview) answers
-- This table mirrors the structure of user_lfi_answers for consistency

CREATE TABLE IF NOT EXISTS public.user_eci_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_key TEXT NOT NULL,
    answer_text TEXT NOT NULL,
    is_draft BOOLEAN NOT NULL DEFAULT true,
    score INTEGER NOT NULL DEFAULT 0,
    label TEXT NOT NULL DEFAULT 'Draft',
    notes TEXT[] DEFAULT '{}',
    tips TEXT[] DEFAULT '{}',
    detected JSONB DEFAULT '{}',
    service_id TEXT DEFAULT 'tps',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_eci_answers_user_id ON public.user_eci_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_eci_answers_question_key ON public.user_eci_answers(question_key);
CREATE INDEX IF NOT EXISTS idx_user_eci_answers_created_at ON public.user_eci_answers(created_at);
CREATE INDEX IF NOT EXISTS idx_user_eci_answers_user_question ON public.user_eci_answers(user_id, question_key);

-- Enable Row Level Security
ALTER TABLE public.user_eci_answers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own ECI answers" ON public.user_eci_answers;
DROP POLICY IF EXISTS "Users can insert their own ECI answers" ON public.user_eci_answers;
DROP POLICY IF EXISTS "Users can update their own ECI answers" ON public.user_eci_answers;
DROP POLICY IF EXISTS "Users can delete their own ECI answers" ON public.user_eci_answers;

CREATE POLICY "Users can view their own ECI answers" ON public.user_eci_answers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ECI answers" ON public.user_eci_answers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ECI answers" ON public.user_eci_answers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ECI answers" ON public.user_eci_answers
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_user_eci_answers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_user_eci_answers_updated_at ON public.user_eci_answers;

CREATE TRIGGER trigger_update_user_eci_answers_updated_at
    BEFORE UPDATE ON public.user_eci_answers
    FOR EACH ROW
    EXECUTE FUNCTION update_user_eci_answers_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.user_eci_answers IS 'Stores user answers to ECI (Essential Competency Interview) practice questions';
COMMENT ON COLUMN public.user_eci_answers.question_key IS 'The competency key (e.g., communication, self_control, etc.)';
COMMENT ON COLUMN public.user_eci_answers.answer_text IS 'The user''s written answer to the practice question';
COMMENT ON COLUMN public.user_eci_answers.score IS 'Numeric score from 0-100 based on grading algorithm';
COMMENT ON COLUMN public.user_eci_answers.label IS 'Grade label: Competitive, Effective, Developing, Needs Work, or Draft';
COMMENT ON COLUMN public.user_eci_answers.notes IS 'Array of feedback notes from the grading system';
COMMENT ON COLUMN public.user_eci_answers.tips IS 'Array of improvement tips from the grading system';
COMMENT ON COLUMN public.user_eci_answers.detected IS 'JSON object with detected elements (STAR method, keywords, etc.)';
COMMENT ON COLUMN public.user_eci_answers.service_id IS 'Police service identifier (defaults to TPS)';

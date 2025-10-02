-- LFI (Local Focus Interview) Tables Migration
-- Create tables for user responses and notes for LFI preparation

-- Create lfi_responses table
CREATE TABLE IF NOT EXISTS public.lfi_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_key TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    practiced BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Ensure one response per user per question
    UNIQUE(user_id, category_key, question)
);

-- Create lfi_notes table
CREATE TABLE IF NOT EXISTS public.lfi_notes (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lfi_responses_user_id ON public.lfi_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_lfi_responses_category ON public.lfi_responses(category_key);
CREATE INDEX IF NOT EXISTS idx_lfi_responses_practiced ON public.lfi_responses(practiced);

-- Enable RLS on both tables
ALTER TABLE public.lfi_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lfi_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lfi_responses
-- Users can only access their own responses
CREATE POLICY "Users can view their own LFI responses" ON public.lfi_responses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own LFI responses" ON public.lfi_responses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own LFI responses" ON public.lfi_responses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own LFI responses" ON public.lfi_responses
    FOR DELETE USING (auth.uid() = user_id);

-- Admin policy for lfi_responses (admins can view all)
CREATE POLICY "Admins can view all LFI responses" ON public.lfi_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR role = 'super_admin')
        )
    );

-- RLS Policies for lfi_notes
-- Users can only access their own notes
CREATE POLICY "Users can view their own LFI notes" ON public.lfi_notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own LFI notes" ON public.lfi_notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own LFI notes" ON public.lfi_notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own LFI notes" ON public.lfi_notes
    FOR DELETE USING (auth.uid() = user_id);

-- Admin policy for lfi_notes (admins can view all)
CREATE POLICY "Admins can view all LFI notes" ON public.lfi_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR role = 'super_admin')
        )
    );

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to update updated_at automatically
CREATE TRIGGER update_lfi_responses_updated_at 
    BEFORE UPDATE ON public.lfi_responses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lfi_notes_updated_at 
    BEFORE UPDATE ON public.lfi_notes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


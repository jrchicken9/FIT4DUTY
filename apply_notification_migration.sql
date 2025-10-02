-- =====================================================================
-- QUICK FIX FOR MISSING EXPIRES_AT COLUMN
-- =====================================================================
-- Run this in your Supabase SQL Editor to fix the "column expires_at does not exist" error

-- Step 1: Add the missing expires_at column
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '48 hours');

-- Step 2: Update existing notifications to have expiration dates
UPDATE public.notifications 
SET expires_at = created_at + interval '48 hours' 
WHERE expires_at IS NULL;

-- Step 3: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON public.notifications(expires_at);

-- Step 4: Create the cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM public.notifications 
  WHERE expires_at < now();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Step 5: Create the get_user_notifications function
CREATE OR REPLACE FUNCTION public.get_user_notifications(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_include_expired BOOLEAN DEFAULT false
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  type TEXT,
  priority TEXT,
  title TEXT,
  message TEXT,
  data JSONB,
  is_read BOOLEAN,
  is_actionable BOOLEAN,
  action_url TEXT,
  action_text TEXT,
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clean up expired notifications first
  PERFORM public.cleanup_expired_notifications();
  
  -- Return notifications
  RETURN QUERY
  SELECT 
    n.id,
    n.user_id,
    n.type,
    n.priority,
    n.title,
    n.message,
    n.data,
    n.is_read,
    n.is_actionable,
    n.action_url,
    n.action_text,
    n.scheduled_for,
    n.sent_at,
    n.expires_at,
    n.created_at,
    n.updated_at
  FROM public.notifications n
  WHERE n.user_id = p_user_id
    AND (p_include_expired OR n.expires_at > now())
  ORDER BY n.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Step 6: Update the create_notification function to handle expires_at
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_priority TEXT DEFAULT 'medium',
  p_data JSONB DEFAULT '{}'::jsonb,
  p_is_actionable BOOLEAN DEFAULT false,
  p_action_url TEXT DEFAULT NULL,
  p_action_text TEXT DEFAULT NULL,
  p_scheduled_for TIMESTAMPTZ DEFAULT NULL,
  p_expires_after_hours INTEGER DEFAULT 48
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    priority,
    title,
    message,
    data,
    is_actionable,
    action_url,
    action_text,
    scheduled_for,
    expires_at
  ) VALUES (
    p_user_id,
    p_type,
    p_priority,
    p_title,
    p_message,
    p_data,
    p_is_actionable,
    p_action_url,
    p_action_text,
    p_scheduled_for,
    CASE 
      WHEN p_scheduled_for IS NOT NULL THEN p_scheduled_for + (p_expires_after_hours || ' hours')::interval
      ELSE now() + (p_expires_after_hours || ' hours')::interval
    END
  ) RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- Step 7: Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'notifications' AND column_name = 'expires_at';

-- Success message
SELECT 'Migration completed successfully! The expires_at column has been added to the notifications table.' as status;

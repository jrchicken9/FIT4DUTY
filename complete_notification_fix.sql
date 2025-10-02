-- =====================================================================
-- COMPLETE NOTIFICATION SYSTEM FIX
-- =====================================================================
-- This fixes both the expires_at column issue and the type mismatch error

-- Step 1: Ensure the expires_at column exists
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '48 hours');

-- Step 2: Update existing notifications to have expiration dates
UPDATE public.notifications 
SET expires_at = created_at + interval '48 hours' 
WHERE expires_at IS NULL;

-- Step 3: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON public.notifications(expires_at);

-- Step 4: Drop the problematic function
DROP FUNCTION IF EXISTS public.get_user_notifications(UUID, INTEGER, INTEGER, BOOLEAN);

-- Step 5: Create a simpler, more reliable function
CREATE OR REPLACE FUNCTION public.get_user_notifications_simple(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS SETOF public.notifications
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clean up expired notifications first
  DELETE FROM public.notifications WHERE expires_at < now();
  
  -- Return notifications
  RETURN QUERY
  SELECT n.*
  FROM public.notifications n
  WHERE n.user_id = p_user_id
  ORDER BY n.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Step 6: Update the create_notification function
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

-- Step 7: Create cleanup function
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

-- Step 8: Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;

-- Step 9: Test with a sample query
SELECT 
  'Testing direct query...' as test_status,
  COUNT(*) as total_notifications,
  COUNT(*) FILTER (WHERE expires_at > now()) as active_notifications
FROM public.notifications;

-- Step 10: Success message
SELECT 'Complete notification system fix applied successfully!' as status;

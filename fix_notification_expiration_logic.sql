-- =====================================================================
-- FIX NOTIFICATION EXPIRATION LOGIC
-- =====================================================================
-- This ensures notifications expire 48 hours from when they were received (sent_at)
-- rather than when they were created

-- Step 1: Update existing notifications to expire 48 hours from sent_at
-- If sent_at is NULL, use created_at as fallback
UPDATE public.notifications 
SET expires_at = COALESCE(sent_at, created_at) + interval '48 hours'
WHERE expires_at IS NULL OR expires_at > created_at + interval '48 hours';

-- Step 2: Update the create_notification function to use sent_at for expiration
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
  v_sent_at TIMESTAMPTZ;
BEGIN
  -- Set sent_at to current time when notification is created
  v_sent_at := now();
  
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
    sent_at,
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
    v_sent_at,
    CASE 
      WHEN p_scheduled_for IS NOT NULL THEN p_scheduled_for + (p_expires_after_hours || ' hours')::interval
      ELSE v_sent_at + (p_expires_after_hours || ' hours')::interval
    END
  ) RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- Step 3: Create a function to manually set sent_at for existing notifications
CREATE OR REPLACE FUNCTION public.update_notification_sent_at(
  p_notification_id UUID,
  p_user_id UUID,
  p_sent_at TIMESTAMPTZ DEFAULT now()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notifications 
  SET 
    sent_at = p_sent_at,
    expires_at = p_sent_at + interval '48 hours',
    updated_at = now()
  WHERE id = p_notification_id AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$;

-- Step 4: Update all existing notifications to have proper sent_at and expires_at
-- This ensures old notifications expire correctly
UPDATE public.notifications 
SET 
  sent_at = COALESCE(sent_at, created_at),
  expires_at = COALESCE(sent_at, created_at) + interval '48 hours'
WHERE sent_at IS NULL OR expires_at IS NULL;

-- Step 5: Verify the changes
SELECT 
  'Notification expiration logic updated successfully!' as status,
  COUNT(*) as total_notifications,
  COUNT(*) FILTER (WHERE expires_at > now()) as active_notifications,
  COUNT(*) FILTER (WHERE expires_at <= now()) as expired_notifications,
  COUNT(*) FILTER (WHERE sent_at IS NOT NULL) as notifications_with_sent_at
FROM public.notifications;

-- Step 6: Show sample of updated notifications
SELECT 
  id,
  title,
  created_at,
  sent_at,
  expires_at,
  CASE 
    WHEN expires_at > now() THEN 'Active'
    ELSE 'Expired'
  END as status
FROM public.notifications 
ORDER BY created_at DESC 
LIMIT 5;

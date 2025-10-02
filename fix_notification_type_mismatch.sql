-- =====================================================================
-- FIX NOTIFICATION TYPE MISMATCH ERROR
-- =====================================================================
-- This fixes the "Returned type notification_type does not match expected type text" error

-- First, let's check what the actual column types are
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;

-- Drop the existing function to recreate it with correct types
DROP FUNCTION IF EXISTS public.get_user_notifications(UUID, INTEGER, INTEGER, BOOLEAN);

-- Recreate the function with explicit type casting
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
  
  -- Return notifications with explicit type casting
  RETURN QUERY
  SELECT 
    n.id::UUID,
    n.user_id::UUID,
    n.type::TEXT,
    n.priority::TEXT,
    n.title::TEXT,
    n.message::TEXT,
    n.data::JSONB,
    n.is_read::BOOLEAN,
    n.is_actionable::BOOLEAN,
    n.action_url::TEXT,
    n.action_text::TEXT,
    n.scheduled_for::TIMESTAMPTZ,
    n.sent_at::TIMESTAMPTZ,
    n.expires_at::TIMESTAMPTZ,
    n.created_at::TIMESTAMPTZ,
    n.updated_at::TIMESTAMPTZ
  FROM public.notifications n
  WHERE n.user_id = p_user_id
    AND (p_include_expired OR n.expires_at > now())
  ORDER BY n.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Also update the create_notification function to ensure proper type handling
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
    p_type::TEXT,
    p_priority::TEXT,
    p_title::TEXT,
    p_message::TEXT,
    p_data::JSONB,
    p_is_actionable::BOOLEAN,
    p_action_url::TEXT,
    p_action_text::TEXT,
    p_scheduled_for::TIMESTAMPTZ,
    CASE 
      WHEN p_scheduled_for IS NOT NULL THEN p_scheduled_for + (p_expires_after_hours || ' hours')::interval
      ELSE now() + (p_expires_after_hours || ' hours')::interval
    END
  ) RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- Test the function to make sure it works
SELECT 'Function recreation completed. Testing...' as status;

-- Try to call the function (this will help identify any remaining issues)
-- SELECT * FROM public.get_user_notifications('00000000-0000-0000-0000-000000000000'::UUID, 1, 0, false);

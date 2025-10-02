-- =====================================================================
-- NOTIFICATIONS TABLE WITH AUTO-DISMISS FUNCTIONALITY
-- =====================================================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'practice_session_reminder',
    'booking_confirmation',
    'booking_cancelled',
    'waitlist_position',
    'session_full',
    'session_cancelled',
    'payment_required',
    'waiver_required',
    'general_announcement',
    'fitness_reminder',
    'test_reminder',
    'booking_pending',
    'booking_approved',
    'booking_rejected'
  )),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_actionable BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  action_text TEXT,
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '48 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON public.notifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'practice_session_reminder',
    'booking_confirmation',
    'booking_cancelled',
    'waitlist_position',
    'session_full',
    'session_cancelled',
    'payment_required',
    'waiver_required',
    'general_announcement',
    'fitness_reminder',
    'test_reminder',
    'booking_pending',
    'booking_approved',
    'booking_rejected'
  )),
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, type)
);

-- Create notification templates table
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN (
    'practice_session_reminder',
    'booking_confirmation',
    'booking_cancelled',
    'waitlist_position',
    'session_full',
    'session_cancelled',
    'payment_required',
    'waiver_required',
    'general_announcement',
    'fitness_reminder',
    'test_reminder',
    'booking_pending',
    'booking_approved',
    'booking_rejected'
  )),
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for preferences and templates
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON public.notification_templates(type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON public.notification_templates(is_active);

-- =====================================================================
-- FUNCTIONS FOR NOTIFICATION MANAGEMENT
-- =====================================================================

-- Function to create a notification
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

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(
  p_notification_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notifications 
  SET is_read = true, updated_at = now()
  WHERE id = p_notification_id AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.notifications 
  SET is_read = true, updated_at = now()
  WHERE user_id = p_user_id AND is_read = false;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Function to clean up expired notifications (auto-dismiss after 48 hours)
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

-- Function to get notifications with auto-cleanup
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

-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS on notification preferences table
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can manage their own notification preferences
CREATE POLICY "Users can manage own notification preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================================
-- SEED DATA
-- =====================================================================

-- Insert default notification templates
INSERT INTO public.notification_templates (type, title_template, message_template) VALUES
  ('booking_confirmation', 'Booking Confirmed', 'Your booking for {session_title} has been confirmed.'),
  ('booking_cancelled', 'Booking Cancelled', 'Your booking for {session_title} has been cancelled.'),
  ('practice_session_reminder', 'Session Reminder', 'Your practice session {session_title} starts in {time_until_start}.'),
  ('general_announcement', '{title}', '{message}'),
  ('fitness_reminder', 'Fitness Reminder', 'Time for your daily workout! Stay on track with your fitness goals.')
ON CONFLICT (type) DO NOTHING;

-- =====================================================================
-- SCHEDULED CLEANUP
-- =====================================================================

-- Create a scheduled job to clean up expired notifications (runs every hour)
-- Note: This requires pg_cron extension to be enabled
-- SELECT cron.schedule('cleanup-expired-notifications', '0 * * * *', 'SELECT public.cleanup_expired_notifications();');

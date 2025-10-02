-- Fix Booking Approval Workflow
-- This script ensures that bookings require admin approval after payment

-- Step 1: Drop and recreate the update_booking_payment function to NOT auto-confirm
DROP FUNCTION IF EXISTS update_booking_payment(UUID, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS update_booking_payment(UUID, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS update_booking_payment(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS update_booking_payment(UUID, TEXT);

-- Create the function that keeps bookings in pending status after payment
CREATE OR REPLACE FUNCTION update_booking_payment(
  booking_uuid UUID,
  payment_status TEXT,
  payment_method TEXT DEFAULT NULL,
  transaction_id TEXT DEFAULT NULL,
  receipt_url TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  booking_record RECORD;
BEGIN
  -- Update booking with payment information but keep status as pending
  UPDATE bookings
  SET 
    payment_status = payment_status,
    payment_method = payment_method,
    transaction_id = transaction_id,
    receipt_url = receipt_url,
    -- IMPORTANT: Keep status as pending even after successful payment
    -- Only admin approval should change status to confirmed
    status = CASE 
      WHEN payment_status = 'failed' THEN 'cancelled'
      ELSE status  -- Keep existing status (should be 'pending')
    END,
    updated_at = NOW()
  WHERE id = booking_uuid
  RETURNING * INTO booking_record;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'booking_id', booking_record.id,
    'status', booking_record.status,
    'payment_status', booking_record.payment_status,
    'message', CASE 
      WHEN payment_status = 'succeeded' THEN 'Payment successful. Booking submitted for admin approval.'
      WHEN payment_status = 'failed' THEN 'Payment failed. Booking cancelled.'
      ELSE 'Payment status updated.'
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Ensure admin approval functions exist and work correctly
DROP FUNCTION IF EXISTS approve_booking(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS reject_booking(UUID, UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS confirm_booking(UUID, UUID);

-- Create approve_booking function
CREATE OR REPLACE FUNCTION approve_booking(
    booking_uuid UUID,
    admin_uuid UUID,
    admin_notes_param TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    booking_record RECORD;
    user_email TEXT;
    session_title TEXT;
    session_date DATE;
BEGIN
    -- Update booking status to approved
    UPDATE bookings
    SET 
        status = 'approved',
        admin_reviewed_by = admin_uuid,
        admin_reviewed_at = NOW(),
        admin_notes = COALESCE(admin_notes_param, admin_notes),
        updated_at = NOW()
    WHERE id = booking_uuid
    AND status IN ('pending', 'submitted_for_approval')  -- Only approve pending bookings
    RETURNING * INTO booking_record;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking not found or not in pending status';
    END IF;
    
    -- Get user email and session details for notification
    SELECT u.email, ps.title, ps.session_date
    INTO user_email, session_title, session_date
    FROM auth.users u
    JOIN practice_sessions ps ON booking_record.session_id = ps.id
    WHERE u.id = booking_record.user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'booking_id', booking_record.id,
        'status', booking_record.status,
        'user_email', user_email,
        'session_title', session_title,
        'session_date', session_date,
        'message', 'Booking approved successfully'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create reject_booking function
CREATE OR REPLACE FUNCTION reject_booking(
    booking_uuid UUID,
    admin_uuid UUID,
    rejection_reason_param TEXT,
    admin_notes_param TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    booking_record RECORD;
    user_email TEXT;
    session_title TEXT;
BEGIN
    -- Update booking status to rejected
    UPDATE bookings
    SET 
        status = 'rejected',
        admin_reviewed_by = admin_uuid,
        admin_reviewed_at = NOW(),
        rejection_reason = rejection_reason_param,
        admin_notes = COALESCE(admin_notes_param, admin_notes),
        updated_at = NOW()
    WHERE id = booking_uuid
    AND status IN ('pending', 'submitted_for_approval', 'approved')  -- Can reject pending or approved bookings
    RETURNING * INTO booking_record;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking not found or not in valid status for rejection';
    END IF;
    
    -- Get user email and session details for notification
    SELECT u.email, ps.title
    INTO user_email, session_title
    FROM auth.users u
    JOIN practice_sessions ps ON booking_record.session_id = ps.id
    WHERE u.id = booking_record.user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'booking_id', booking_record.id,
        'status', booking_record.status,
        'user_email', user_email,
        'session_title', session_title,
        'rejection_reason', rejection_reason_param,
        'message', 'Booking rejected'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create confirm_booking function (final step after approval)
CREATE OR REPLACE FUNCTION confirm_booking(
    booking_uuid UUID,
    admin_uuid UUID
)
RETURNS JSONB AS $$
DECLARE
    booking_record RECORD;
    user_email TEXT;
    session_title TEXT;
    session_date DATE;
BEGIN
    -- Update booking status to confirmed (final status)
    UPDATE bookings
    SET 
        status = 'confirmed',
        admin_reviewed_by = admin_uuid,
        admin_reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = booking_uuid
    AND status = 'approved'  -- Only confirm approved bookings
    RETURNING * INTO booking_record;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking not found or not approved';
    END IF;
    
    -- Get user email and session details for notification
    SELECT u.email, ps.title, ps.session_date
    INTO user_email, session_title, session_date
    FROM auth.users u
    JOIN practice_sessions ps ON booking_record.session_id = ps.id
    WHERE u.id = booking_record.user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'booking_id', booking_record.id,
        'status', booking_record.status,
        'user_email', user_email,
        'session_title', session_title,
        'session_date', session_date,
        'message', 'Booking confirmed - user will receive notification'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Grant execute permissions
GRANT EXECUTE ON FUNCTION update_booking_payment(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION approve_booking(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_booking(UUID, UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION confirm_booking(UUID, UUID) TO authenticated;

-- Step 4: Update the admin pending bookings view
DROP VIEW IF EXISTS admin_pending_bookings;

CREATE OR REPLACE VIEW admin_pending_bookings AS
SELECT 
    b.id as booking_id,
    b.status as booking_status,
    b.created_at as booking_created,
    b.amount_cents,
    b.payment_status,
    b.payment_method,
    b.transaction_id,
    b.admin_reviewed_by,
    b.admin_reviewed_at,
    b.admin_notes,
    b.rejection_reason,
    
    -- User information
    u.email as user_email,
    p.full_name as user_full_name,
    p.phone as user_phone,
    
    -- Session information
    ps.title as session_title,
    ps.session_date,
    ps.start_time,
    ps.end_time,
    ps.test_type,
    
    -- Location information
    l.name as location_name,
    l.address as location_address,
    
    -- Waiver information
    b.waiver_signed,
    b.waiver_signed_name,
    b.waiver_signed_at,
    
    -- Emergency contact
    b.emergency_contact,
    b.emergency_phone,
    b.emergency_relationship,
    
    -- Medical information
    b.medical_conditions,
    b.medications,
    b.allergies,
    b.heart_condition,
    b.chest_pain,
    b.dizziness,
    b.bone_joint_problems,
    b.high_blood_pressure,
    b.diabetes,
    b.asthma,
    b.pregnancy,
    b.other_medical_issues
    
FROM bookings b
JOIN auth.users u ON b.user_id = u.id
LEFT JOIN profiles p ON b.user_id = p.id
JOIN practice_sessions ps ON b.session_id = ps.id
LEFT JOIN locations l ON ps.location_id = l.id
WHERE b.status IN ('pending', 'submitted_for_approval', 'approved')
ORDER BY b.created_at DESC;

-- Step 5: Add admin approval columns to bookings table if they don't exist
DO $$
BEGIN
    -- Add admin_reviewed_by if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bookings'
        AND column_name = 'admin_reviewed_by'
    ) THEN
        ALTER TABLE bookings ADD COLUMN admin_reviewed_by UUID REFERENCES auth.users(id);
    END IF;

    -- Add admin_reviewed_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bookings'
        AND column_name = 'admin_reviewed_at'
    ) THEN
        ALTER TABLE bookings ADD COLUMN admin_reviewed_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add admin_notes if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bookings'
        AND column_name = 'admin_notes'
    ) THEN
        ALTER TABLE bookings ADD COLUMN admin_notes TEXT;
    END IF;

    -- Add rejection_reason if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bookings'
        AND column_name = 'rejection_reason'
    ) THEN
        ALTER TABLE bookings ADD COLUMN rejection_reason TEXT;
    END IF;
END $$;

-- Step 6: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_admin_reviewed ON bookings(admin_reviewed_by, admin_reviewed_at);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);

-- Step 7: Test the functions
SELECT 'Booking approval workflow fixed!' as status;

-- Verify the functions exist
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN ('update_booking_payment', 'approve_booking', 'reject_booking', 'confirm_booking')
AND n.nspname = 'public'
ORDER BY p.proname;

-- Show current pending bookings
SELECT 
    booking_id,
    booking_status,
    session_title,
    user_email,
    payment_status,
    booking_created
FROM admin_pending_bookings
ORDER BY booking_created DESC;

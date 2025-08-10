-- Setup Super Admin User
-- Run this SQL in your Supabase SQL Editor after the user has signed up

-- Update the user with email 'ih.gaming009@gmail.com' to be a super admin
UPDATE public.profiles 
SET 
    role = 'super_admin',
    is_admin = true,
    admin_permissions = '["manage_users", "manage_content", "view_analytics", "manage_community", "manage_subscriptions", "system_admin"]'::jsonb,
    updated_at = NOW()
WHERE email = 'ih.gaming009@gmail.com';

-- Verify the update
SELECT id, email, full_name, role, is_admin, admin_permissions 
FROM public.profiles 
WHERE email = 'ih.gaming009@gmail.com';

-- If the user doesn't exist yet, you can create them manually:
-- (Only run this if the SELECT above returns no results)
/*
INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    is_admin, 
    admin_permissions,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(), -- This should be replaced with the actual auth.users.id if the user exists
    'ih.gaming009@gmail.com',
    'Super Admin',
    'super_admin',
    true,
    '["manage_users", "manage_content", "view_analytics", "manage_community", "manage_subscriptions", "system_admin"]'::jsonb,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    is_admin = EXCLUDED.is_admin,
    admin_permissions = EXCLUDED.admin_permissions,
    updated_at = NOW();
*/
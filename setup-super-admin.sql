-- Setup Super Admin User
-- Run this SQL in your Supabase SQL Editor

-- STEP 1: First, check if the user exists in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'ih.gaming009@gmail.com';

-- STEP 2: Check if profile exists
SELECT id, email, full_name, role, is_admin, admin_permissions 
FROM public.profiles 
WHERE email = 'ih.gaming009@gmail.com';

-- STEP 3: If the user exists in auth.users but not in profiles, create the profile
-- Replace 'USER_ID_FROM_STEP_1' with the actual ID from the auth.users query above
INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    is_admin, 
    admin_permissions,
    goal,
    experience_level,
    current_fitness_level,
    fitness_level,
    goals,
    created_at,
    updated_at
) 
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', 'Super Admin'),
    'super_admin',
    true,
    '["manage_users", "manage_content", "view_analytics", "manage_community", "manage_subscriptions", "system_admin"]'::jsonb,
    'System Administration',
    'advanced',
    'advanced',
    'advanced',
    '["System Administration"]'::jsonb,
    NOW(),
    NOW()
FROM auth.users au
WHERE au.email = 'ih.gaming009@gmail.com'
ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    is_admin = EXCLUDED.is_admin,
    admin_permissions = EXCLUDED.admin_permissions,
    updated_at = NOW();

-- STEP 4: If the profile already exists, just update it to super admin
UPDATE public.profiles 
SET 
    role = 'super_admin',
    is_admin = true,
    admin_permissions = '["manage_users", "manage_content", "view_analytics", "manage_community", "manage_subscriptions", "system_admin"]'::jsonb,
    updated_at = NOW()
WHERE email = 'ih.gaming009@gmail.com';

-- STEP 5: Verify the final result
SELECT 
    p.id, 
    p.email, 
    p.full_name, 
    p.role, 
    p.is_admin, 
    p.admin_permissions,
    au.email_confirmed_at,
    au.created_at as auth_created_at
FROM public.profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.email = 'ih.gaming009@gmail.com';

-- STEP 6: Create additional admin policies if needed
-- Allow super admins to view all profiles (for user management)
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
CREATE POLICY "Super admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles admin_profile 
            WHERE admin_profile.id = auth.uid() 
            AND admin_profile.role = 'super_admin'
        )
    );

-- Allow super admins to update any profile (for user management)
DROP POLICY IF EXISTS "Super admins can update any profile" ON public.profiles;
CREATE POLICY "Super admins can update any profile" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles admin_profile 
            WHERE admin_profile.id = auth.uid() 
            AND admin_profile.role = 'super_admin'
        )
    );

-- Allow super admins to delete any profile (for user management)
DROP POLICY IF EXISTS "Super admins can delete any profile" ON public.profiles;
CREATE POLICY "Super admins can delete any profile" ON public.profiles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles admin_profile 
            WHERE admin_profile.id = auth.uid() 
            AND admin_profile.role = 'super_admin'
        )
    );

-- STEP 7: Test the admin setup
-- This should return the super admin user if everything is set up correctly
SELECT 
    'Admin setup test' as test_name,
    CASE 
        WHEN COUNT(*) > 0 THEN 'SUCCESS: Super admin user found'
        ELSE 'ERROR: Super admin user not found'
    END as result
FROM public.profiles 
WHERE email = 'ih.gaming009@gmail.com' 
AND role = 'super_admin' 
AND is_admin = true;

-- INSTRUCTIONS:
-- 1. Run this entire script in your Supabase SQL Editor
-- 2. Make sure the user 'ih.gaming009@gmail.com' has signed up first
-- 3. Check the results of each step to ensure everything worked
-- 4. The final test should show 'SUCCESS: Super admin user found'
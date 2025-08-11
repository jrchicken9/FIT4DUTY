# Admin Setup Instructions

## Step 1: Run the SQL Setup

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project: `jgkgdfohqihwojbsplab`
3. Go to the SQL Editor
4. Copy and paste the entire contents of `supabase-complete-setup.sql`
5. Click "Run" to execute the SQL

## Step 2: Create Super Admin User

### Option A: Using the Node.js Script (Recommended)

1. Make sure you have Node.js installed
2. Install the Supabase client:
   ```bash
   npm install @supabase/supabase-js
   ```
3. Run the super admin script:
   ```bash
   node scripts/make-super-admin.js
   ```

### Option B: Manual Setup via Supabase Dashboard

1. Go to your Supabase dashboard
2. Navigate to Table Editor
3. Find the `profiles` table
4. Locate the user with email `ih.gaming009@gmail.com`
5. Edit the row and set:
   - `role`: `super_admin`
   - `is_admin`: `true`
   - `admin_permissions`: `["manage_users", "manage_content", "view_analytics", "manage_community", "manage_subscriptions", "system_admin"]`

## Step 3: Test Admin Access

1. Sign in to the app with `ih.gaming009@gmail.com`
2. You should be automatically redirected to `/admin/dashboard`
3. If you see an error page, check the browser console for error messages

## Troubleshooting

### If you get "infinite recursion detected in policy" error:
1. The SQL setup should have fixed this by removing circular references in RLS policies
2. If the error persists, re-run the SQL setup script

### If admin redirect doesn't work:
1. Check that the user profile has the correct role and permissions
2. Clear browser cache and try again
3. Check the browser console for JavaScript errors

### If you can't access admin features:
1. Verify the user has `role: 'super_admin'` and `is_admin: true`
2. Make sure the `admin_permissions` array includes all necessary permissions

## Environment Variables

Make sure your `.env` file has the correct Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://jgkgdfohqihwojbsplab.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impna2dkZm9ocWlod29qYnNwbGFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzOTA5ODYsImV4cCI6MjA2OTk2Njk4Nn0.1uIE9x0yg6TsxNKf0gTxRs4sZjb0e2RBfwm8-Joe_pE
```
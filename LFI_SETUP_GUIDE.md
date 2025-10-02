# LFI (Local Focus Interview) Setup Guide

## 🚨 Database Error Fix

You're seeing the error `"Could not find the table 'public.lfi_notes'"` because the LFI tables haven't been created yet.

## ✅ Quick Fix Options

### Option 1: Automatic Migration (Recommended)
```bash
cd /path/to/your/project
./scripts/run_lfi_migration.sh
```

### Option 2: Manual Migration via Supabase Dashboard
1. Go to your Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `supabase/migrations/20250120_lfi_tables.sql`
3. Click "Run" to execute the migration

### Option 3: Manual Migration via CLI
```bash
# Make sure you're in the project directory
cd /Users/ibrahimhaddad/Downloads/MAIN\ APP\ FOLDER

# Run the migration
supabase db reset --linked
```

## 🎯 What This Creates

The migration creates two tables:

### `lfi_responses`
- Stores user answers to practice questions
- Tracks which questions have been practiced
- One record per user per question

### `lfi_notes` 
- Stores personal notes for LFI preparation
- One record per user

Both tables have:
- ✅ Row Level Security (RLS) enabled
- ✅ User isolation (users only see their own data)
- ✅ Admin access for management
- ✅ Auto-updating timestamps

## 🔧 Verification

After running the migration, you can verify it worked by:

1. Going to Supabase Dashboard → Table Editor
2. You should see `lfi_responses` and `lfi_notes` tables
3. Try using the LFI screen - the error should be gone

## 📝 Optional: Seed Content

To load the default LFI content into the database:

```bash
# Run the content seeding script
psql -h your-supabase-host -U postgres -d postgres -f scripts/seed_lfi_content.sql
```

Or paste the contents of `scripts/seed_lfi_content.sql` into the Supabase SQL Editor.

## 🎉 Ready to Use

Once the migration is complete, the LFI screen will work perfectly with:
- ✅ Practice questions with auto-save
- ✅ Progress tracking
- ✅ Personal notes
- ✅ No more database errors

## 🆘 Still Having Issues?

If you're still seeing errors:

1. Check that your Supabase connection is working
2. Verify you have the `profiles` table (required dependency)
3. Make sure RLS policies are enabled
4. Check the browser console for more detailed error messages

The LFI screen has been built with graceful error handling, so it will still work even if tables are missing - it just won't save data until the migration is run.





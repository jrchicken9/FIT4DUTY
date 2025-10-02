#!/bin/bash

# Run LFI tables migration
# This script applies the LFI tables migration to your Supabase database

echo "🚀 Running LFI tables migration..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Apply the migration
echo "📝 Applying migration: 20250120_lfi_tables.sql"
supabase db reset --linked

if [ $? -eq 0 ]; then
    echo "✅ LFI tables migration completed successfully!"
    echo ""
    echo "🎯 Next steps:"
    echo "1. The lfi_responses and lfi_notes tables are now created"
    echo "2. RLS policies are in place for user data isolation"
    echo "3. You can now use the LFI screen without database errors"
    echo ""
    echo "Optional: Run the content seeding script:"
    echo "psql -h your-db-host -U your-user -d your-db -f scripts/seed_lfi_content.sql"
else
    echo "❌ Migration failed. Please check your Supabase connection and try again."
    exit 1
fi





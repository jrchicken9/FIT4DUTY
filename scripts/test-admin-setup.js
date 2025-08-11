// Test script to verify admin setup
// Run with: node scripts/test-admin-setup.js

const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const supabaseUrl = 'https://jgkgdfohqihwojbsplab.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impna2dkZm9ocWlod29qYnNwbGFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzOTA5ODYsImV4cCI6MjA2OTk2Njk4Nn0.1uIE9x0yg6TsxNKf0gTxRs4sZjb0e2RBfwm8-Joe_pE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminSetup() {
  console.log('🔍 Testing Admin Setup');
  console.log('=====================');
  
  try {
    // Test 1: Check if profiles table exists
    console.log('1. Testing profiles table...');
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role, is_admin, admin_permissions')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError.message);
      if (profilesError.code === '42P01') {
        console.log('💡 Solution: Run the SQL setup script in your Supabase dashboard');
      }
      return;
    }
    console.log('✅ Profiles table exists');
    
    // Test 2: Check for super admin user
    console.log('2. Checking for super admin user...');
    const { data: adminUser, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'ih.gaming009@gmail.com')
      .single();
    
    if (adminError) {
      if (adminError.code === 'PGRST116') {
        console.log('❌ Super admin user not found');
        console.log('💡 Solution: Create an account with ih.gaming009@gmail.com first, then run the make-super-admin script');
      } else {
        console.error('❌ Error checking admin user:', adminError.message);
      }
      return;
    }
    
    console.log('✅ Super admin user found:', adminUser.email);
    console.log('   Role:', adminUser.role);
    console.log('   Is Admin:', adminUser.is_admin);
    console.log('   Permissions:', adminUser.admin_permissions);
    
    // Test 3: Verify admin permissions
    if (adminUser.role === 'super_admin' && adminUser.is_admin === true) {
      console.log('✅ Admin permissions are correctly set');
    } else {
      console.log('❌ Admin permissions need to be updated');
      console.log('💡 Solution: Run the make-super-admin script');
    }
    
    // Test 4: Check other required tables
    console.log('3. Checking other required tables...');
    const tables = ['practice_tests', 'workouts', 'fitness_tests', 'community_posts'];
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('id').limit(1);
        if (error && error.code === '42P01') {
          console.log(`❌ Table '${table}' does not exist`);
        } else {
          console.log(`✅ Table '${table}' exists`);
        }
      } catch (err) {
        console.log(`❌ Error checking table '${table}':`, err.message);
      }
    }
    
    console.log('\n🎉 Admin setup test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminSetup();
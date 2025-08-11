// Secure script to make the first super admin
// Run this script ONCE after creating your first user account

const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials (updated to match current environment)
const supabaseUrl = 'https://jgkgdfohqihwojbsplab.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impna2dkZm9ocWlod29qYnNwbGFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzOTA5ODYsImV4cCI6MjA2OTk2Njk4Nn0.1uIE9x0yg6TsxNKf0gTxRs4sZjb0e2RBfwm8-Joe_pE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function makeSuperAdmin(email) {
  try {
    console.log(`Making ${email} a super admin...`);
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        role: 'super_admin',
        is_admin: true,
        admin_permissions: [
          'manage_users',
          'manage_content', 
          'view_analytics',
          'manage_community',
          'manage_subscriptions',
          'system_admin'
        ],
        updated_at: new Date().toISOString(),
      })
      .eq('email', email)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return false;
    }

    console.log('✅ Success! User is now a super admin.');
    console.log('User details:', {
      id: data.id,
      email: data.email,
      role: data.role,
      is_admin: data.is_admin
    });
    
    return true;
  } catch (error) {
    console.error('Exception:', error);
    return false;
  }
}

// Usage: Replace 'ih.gaming009@gmail.com' with the email you want to make super admin
const email = 'ih.gaming009@gmail.com';

console.log('🔐 Making Super Admin Script');
console.log('============================');
console.log(`Target email: ${email}`);
console.log('');

makeSuperAdmin(email)
  .then(success => {
    if (success) {
      console.log('');
      console.log('🎉 Script completed successfully!');
      console.log('You can now log in with this account and access admin features.');
    } else {
      console.log('');
      console.log('❌ Script failed. Please check the error messages above.');
    }
  })
  .catch(error => {
    console.error('Script error:', error);
  });

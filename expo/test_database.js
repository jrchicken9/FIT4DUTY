// Simple database test script
// Run this in your browser console or Node.js to test your Supabase connection

const SUPABASE_URL = 'https://hdhephqdfgbt...'; // Your Supabase URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIs...'; // Your Supabase anon key

// Test function
async function testDatabase() {
  console.log('Testing Supabase database connection...');
  
  try {
    // Test basic connection
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Profiles table exists and is accessible');
      console.log('Sample data:', data);
    } else {
      const error = await response.text();
      console.log('❌ Profiles table error:', error);
      
      if (error.includes('relation "profiles" does not exist')) {
        console.log('🔧 The profiles table does not exist in your database');
        console.log('You need to run the database setup script in your Supabase dashboard');
      }
    }
  } catch (error) {
    console.error('❌ Database connection error:', error);
  }
}

// Run the test
testDatabase();

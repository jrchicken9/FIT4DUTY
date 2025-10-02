const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// Sample PREP practice test sessions
const prepSessions = [
  {
    test_type: 'prep',
    title: 'Weekend PREP Test Practice Session',
    description: 'Comprehensive PREP test practice including all components: shuttle run, push-ups, sit-ups, and plank hold.',
    location_id: '550e8400-e29b-41d4-a716-446655440000', // You'll need to replace with actual location ID
    session_date: '2025-01-15',
    start_time: '09:00',
    end_time: '12:00',
    capacity: 25,
    price_cents: 15000, // $150.00
    currency: 'USD',
    status: 'scheduled',
    requirements: ['Bring water bottle', 'Wear athletic clothing', 'Arrive 15 minutes early'],
    equipment_provided: ['Cones for shuttle run', 'Mats for floor exercises', 'Timers'],
  },
  {
    test_type: 'prep',
    title: 'Evening PREP Test Prep',
    description: 'Evening session focused on PREP test preparation with individual coaching.',
    location_id: '550e8400-e29b-41d4-a716-446655440000', // You'll need to replace with actual location ID
    session_date: '2025-01-18',
    start_time: '18:00',
    end_time: '21:00',
    capacity: 15,
    price_cents: 20000, // $200.00
    currency: 'USD',
    status: 'scheduled',
    requirements: ['Bring water bottle', 'Wear athletic clothing', 'Previous fitness test results if available'],
    equipment_provided: ['Cones for shuttle run', 'Mats for floor exercises', 'Timers', 'Heart rate monitors'],
  },
  {
    test_type: 'prep',
    title: 'PREP Test Bootcamp',
    description: 'Intensive 3-hour PREP test bootcamp with multiple practice rounds and technique coaching.',
    location_id: '550e8400-e29b-41d4-a716-446655440000', // You'll need to replace with actual location ID
    session_date: '2025-01-25',
    start_time: '08:00',
    end_time: '11:00',
    capacity: 30,
    price_cents: 25000, // $250.00
    currency: 'USD',
    status: 'scheduled',
    requirements: ['Bring water bottle', 'Wear athletic clothing', 'Bring snacks', 'Arrive 30 minutes early'],
    equipment_provided: ['Cones for shuttle run', 'Mats for floor exercises', 'Timers', 'Heart rate monitors', 'Snacks'],
  },
];

async function addPrepSessions() {
  try {
    console.log('🚀 Adding PREP practice test sessions...');

    // First, let's check if we have any locations
    const { data: locations, error: locationError } = await supabase
      .from('locations')
      .select('id, name')
      .limit(1);

    if (locationError) {
      console.error('❌ Error fetching locations:', locationError);
      return;
    }

    if (!locations || locations.length === 0) {
      console.log('⚠️ No locations found. Creating a default location first...');
      
      // Create a default location
      const { data: newLocation, error: createLocationError } = await supabase
        .from('locations')
        .insert({
          name: 'Police Training Center',
          address: '123 Training Street',
          city: 'Toronto',
          province: 'ON',
          postal_code: 'M5V 3A8',
          capacity: 50,
          facilities: ['Gym', 'Track', 'Equipment'],
          is_active: true,
        })
        .select('id')
        .single();

      if (createLocationError) {
        console.error('❌ Error creating default location:', createLocationError);
        return;
      }

      console.log('✅ Created default location:', newLocation.id);
      
      // Update sessions with the new location ID
      prepSessions.forEach(session => {
        session.location_id = newLocation.id;
      });
    } else {
      console.log('✅ Found existing location:', locations[0].name);
      // Use the first available location
      prepSessions.forEach(session => {
        session.location_id = locations[0].id;
      });
    }

    // Add the PREP sessions
    let createdCount = 0;
    for (const session of prepSessions) {
      const { data, error } = await supabase
        .from('practice_sessions')
        .insert(session)
        .select();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`⏭️ Session "${session.title}" already exists, skipping...`);
        } else {
          console.error(`❌ Error creating session "${session.title}":`, error);
        }
      } else {
        console.log(`✅ Created session: ${session.title} (${session.test_type.toUpperCase()})`);
        createdCount++;
      }
    }

    console.log('\n🎉 PREP sessions addition completed!');
    console.log(`📊 Summary:`);
    console.log(`- Sessions created: ${createdCount}`);
    console.log(`- Sessions skipped: ${prepSessions.length - createdCount}`);

    // Show all PREP sessions
    const { data: allPrepSessions, error: fetchError } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('test_type', 'prep')
      .eq('status', 'scheduled');

    if (!fetchError && allPrepSessions) {
      console.log(`\n📋 Current PREP sessions in database: ${allPrepSessions.length}`);
      allPrepSessions.forEach(session => {
        console.log(`  - ${session.title} (${session.session_date})`);
      });
    }

  } catch (error) {
    console.error('❌ Error adding PREP sessions:', error);
  }
}

// Run the script
addPrepSessions();


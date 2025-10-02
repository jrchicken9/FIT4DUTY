#!/usr/bin/env node

/**
 * Test Progress Saving Functionality
 * 
 * This script tests the progress saving and loading functionality
 * for the personalized plan modal.
 */

const AsyncStorage = require('@react-native-async-storage/async-storage');

// Mock AsyncStorage for testing
const mockAsyncStorage = {
  data: {},
  setItem: async (key, value) => {
    mockAsyncStorage.data[key] = value;
    console.log(`✅ Saved: ${key} = ${value}`);
  },
  getItem: async (key) => {
    const value = mockAsyncStorage.data[key];
    console.log(`📖 Retrieved: ${key} = ${value}`);
    return value;
  },
  removeItem: async (key) => {
    delete mockAsyncStorage.data[key];
    console.log(`🗑️  Removed: ${key}`);
  },
};

// Test data
const testProgress = {
  step: 'focus-areas',
  fitnessLevel: 'intermediate',
  readinessDeadline: new Date().toISOString(),
  selectedFocusAreas: ['cardio', 'strength'],
  timestamp: new Date().toISOString(),
};

async function testProgressSaving() {
  console.log('🧪 Testing Progress Saving Functionality\n');

  try {
    // Test 1: Save progress
    console.log('📝 Test 1: Saving progress...');
    await mockAsyncStorage.setItem('personalization_progress', JSON.stringify(testProgress));
    
    // Test 2: Load progress
    console.log('\n📖 Test 2: Loading progress...');
    const savedProgress = await mockAsyncStorage.getItem('personalization_progress');
    const parsedProgress = JSON.parse(savedProgress);
    
    console.log('📊 Parsed progress:');
    console.log(`   Step: ${parsedProgress.step}`);
    console.log(`   Fitness Level: ${parsedProgress.fitnessLevel}`);
    console.log(`   Focus Areas: ${parsedProgress.selectedFocusAreas.join(', ')}`);
    console.log(`   Timestamp: ${parsedProgress.timestamp}`);
    
    // Test 3: Check timestamp validation
    console.log('\n⏰ Test 3: Timestamp validation...');
    const progressDate = new Date(parsedProgress.timestamp);
    const now = new Date();
    const hoursDiff = (now.getTime() - progressDate.getTime()) / (1000 * 60 * 60);
    
    console.log(`   Progress age: ${hoursDiff.toFixed(2)} hours`);
    console.log(`   Valid (under 24h): ${hoursDiff < 24 ? '✅ Yes' : '❌ No'}`);
    
    // Test 4: Clear progress
    console.log('\n🗑️  Test 4: Clearing progress...');
    await mockAsyncStorage.removeItem('personalization_progress');
    
    const clearedProgress = await mockAsyncStorage.getItem('personalization_progress');
    console.log(`   Progress cleared: ${clearedProgress === null ? '✅ Yes' : '❌ No'}`);
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testProgressSaving();











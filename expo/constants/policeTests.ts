import { PoliceTest } from './workouts';

const policeTests: PoliceTest[] = [
  {
    id: "prep-circuit",
    title: "PREP Circuit Test",
    description: "Complete Physical Readiness Evaluation for Police (PREP) - Official test circuit",
    type: "PREP_CIRCUIT",
    duration: 45,
    level: "intermediate",
    passingScore: 70,
    maxScore: 100,
    unit: "points",
    imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=1000",
    components: [
      {
        id: "prep-shuttle",
        name: "20m Shuttle Run (Beep Test)",
        description: "Progressive shuttle run test to measure aerobic fitness",
        duration: 20,
        instructions: [
          "Run between two lines 20 meters apart",
          "Keep pace with the audio beeps",
          "Touch the line with your foot at each turn",
          "Continue until you can no longer keep pace"
        ],
        scoringCriteria: [
          "Level 1-3: Below average fitness",
          "Level 4-6: Average fitness",
          "Level 7-9: Good fitness",
          "Level 10+: Excellent fitness"
        ]
      },
      {
        id: "prep-pushpull",
        name: "Push/Pull Machine",
        description: "Simulate the push/pull machine used in the PREP test",
        targetReps: 5,
        instructions: [
          "Position yourself at the push/pull machine",
          "Complete 5 push motions with maximum force",
          "Complete 5 pull motions with maximum force",
          "Maintain proper form throughout"
        ],
        scoringCriteria: [
          "Minimum force required for each rep",
          "Form and technique evaluation",
          "Consistency across all repetitions"
        ]
      },
      {
        id: "prep-obstacle",
        name: "Obstacle Course",
        description: "Navigate through a series of obstacles simulating police scenarios",
        targetTime: 180,
        instructions: [
          "Complete all obstacles in sequence",
          "Maintain control and accuracy",
          "Follow safety protocols",
          "Finish within time limit"
        ],
        scoringCriteria: [
          "Completion time",
          "Accuracy and form",
          "Safety compliance",
          "Overall technique"
        ]
      }
    ]
  },
  {
    id: "pin-test",
    title: "PIN Fitness Test",
    description: "Police Instructor Network (PIN) comprehensive fitness assessment",
    type: "PIN",
    duration: 60,
    level: "intermediate",
    passingScore: 75,
    maxScore: 100,
    unit: "points",
    imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=1000",
    components: [
      {
        id: "pin-pushups",
        name: "Push-ups Test",
        description: "Maximum push-ups in 1 minute",
        duration: 1,
        instructions: [
          "Start in proper push-up position",
          "Lower chest to within 2 inches of ground",
          "Fully extend arms at the top",
          "Complete as many as possible in 1 minute"
        ],
        scoringCriteria: [
          "Men 18-29: 29+ excellent, 22-28 good, 17-21 average",
          "Women 18-29: 21+ excellent, 15-20 good, 10-14 average",
          "Proper form required for each rep"
        ]
      },
      {
        id: "pin-sitreach",
        name: "Sit and Reach Flexibility",
        description: "Measure lower back and hamstring flexibility",
        instructions: [
          "Sit with legs extended straight",
          "Reach forward as far as possible",
          "Hold position for 2 seconds",
          "Measure distance reached"
        ],
        scoringCriteria: [
          "Excellent: 15+ inches beyond toes",
          "Good: 10-14 inches beyond toes",
          "Average: 5-9 inches beyond toes",
          "Below average: Less than 5 inches"
        ]
      },
      {
        id: "pin-mile",
        name: "1.5 Mile Run",
        description: "Cardiovascular endurance test - 1.5 mile run for time",
        targetDistance: 1.5,
        instructions: [
          "Complete 1.5 miles as quickly as possible",
          "Maintain steady pace",
          "No walking allowed",
          "Record finish time"
        ],
        scoringCriteria: [
          "Men 18-29: <12:00 excellent, 12:00-14:00 good",
          "Women 18-29: <14:00 excellent, 14:00-16:30 good",
          "Times adjusted by age group"
        ]
      },
      {
        id: "pin-core",
        name: "Core Endurance Test",
        description: "Plank hold for maximum time",
        instructions: [
          "Start in proper plank position",
          "Maintain straight line from head to heels",
          "Hold position as long as possible",
          "Stop when form breaks down"
        ],
        scoringCriteria: [
          "Excellent: 2+ minutes",
          "Good: 1-2 minutes",
          "Average: 30 seconds - 1 minute",
          "Below average: Less than 30 seconds"
        ]
      },
      {
        id: "pin-backext",
        name: "Back Extension Test",
        description: "Lower back strength and endurance assessment",
        instructions: [
          "Lie face down on back extension bench",
          "Extend back to neutral position",
          "Hold for specified time",
          "Maintain proper form throughout"
        ],
        scoringCriteria: [
          "Excellent: 60+ seconds",
          "Good: 45-59 seconds",
          "Average: 30-44 seconds",
          "Below average: Less than 30 seconds"
        ]
      }
    ]
  },
  {
    id: "shuttle-run-solo",
    title: "20m Shuttle Run Test",
    description: "Standalone beep test for cardiovascular fitness assessment",
    type: "SHUTTLE_RUN",
    duration: 20,
    level: "beginner",
    passingScore: 5.4,
    maxScore: 15.0,
    unit: "level",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000",
    components: [
      {
        id: "shuttle-main",
        name: "Progressive Shuttle Run",
        description: "Multi-stage fitness test with increasing intensity",
        instructions: [
          "Run between two lines 20 meters apart",
          "Start at walking pace, increase with beeps",
          "Touch the line with your foot at each turn",
          "Continue until you can no longer keep pace",
          "Record the level and shuttle number reached"
        ],
        scoringCriteria: [
          "Level 1-3: Poor cardiovascular fitness",
          "Level 4-6: Below average fitness",
          "Level 7-9: Average fitness",
          "Level 10-12: Good fitness",
          "Level 13+: Excellent fitness"
        ]
      }
    ]
  },
  {
    id: "push-ups-test",
    title: "Push-ups Fitness Test",
    description: "Standard push-up test for upper body strength assessment",
    type: "PUSH_UPS",
    duration: 2,
    level: "beginner",
    passingScore: 15,
    maxScore: 50,
    unit: "reps",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000",
    components: [
      {
        id: "pushup-main",
        name: "Maximum Push-ups",
        description: "Complete as many proper push-ups as possible in 1 minute",
        duration: 1,
        instructions: [
          "Start in proper push-up position",
          "Lower chest to within 2 inches of ground",
          "Fully extend arms at the top",
          "Maintain straight body line throughout",
          "Complete as many as possible in 1 minute"
        ],
        scoringCriteria: [
          "Men 18-29: 29+ excellent, 22-28 good, 17-21 average, <17 below average",
          "Men 30-39: 24+ excellent, 17-23 good, 13-16 average, <13 below average",
          "Women 18-29: 21+ excellent, 15-20 good, 10-14 average, <10 below average",
          "Women 30-39: 20+ excellent, 11-19 good, 8-10 average, <8 below average"
        ]
      }
    ]
  }
];

export default policeTests;
export { policeTests };
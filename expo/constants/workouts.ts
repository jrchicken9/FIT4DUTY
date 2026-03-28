export type Exercise = {
  id: string;
  name: string;
  description: string;
  sets: number;
  reps: number | string;
  restTime: number; // in seconds
  imageUrl?: string;
  videoUrl?: string;
  tips?: string[];
  targetMuscles: string[];
};

export type Workout = {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  level: "beginner" | "intermediate" | "advanced";
  category: "Strength" | "Cardio" | "Endurance" | "Core" | "Full Body";
  exercises: Exercise[];
  imageUrl?: string;
  isPremium?: boolean;
};

export type PoliceTest = {
  id: string;
  title: string;
  description: string;
  type: "PREP_CIRCUIT" | "PIN" | "SHUTTLE_RUN" | "PUSH_UPS" | "SIT_REACH" | "MILE_RUN" | "CORE_ENDURANCE" | "BACK_EXTENSION";
  duration: number; // in minutes
  level: "beginner" | "intermediate" | "advanced";
  components: TestComponent[];
  passingScore?: number;
  maxScore?: number;
  unit?: string;
  imageUrl?: string;
  isPremium?: boolean;
};

export type TestComponent = {
  id: string;
  name: string;
  description: string;
  duration?: number;
  targetReps?: number;
  targetTime?: number;
  targetDistance?: number;
  instructions: string[];
  scoringCriteria: string[];
};

// Priority Police Tests converted to workout format for compatibility
const workouts: Workout[] = [
  {
    id: "prep-circuit-workout",
    title: "PREP Circuit Test",
    description: "Complete Physical Readiness Evaluation for Police (PREP) - Official test circuit",
    duration: 45,
    level: "intermediate",
    category: "Full Body",
    imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=1000",
    exercises: [
      {
        id: "prep-shuttle-ex",
        name: "20m Shuttle Run (Beep Test)",
        description: "Progressive shuttle run test to measure aerobic fitness",
        sets: 1,
        reps: "Until exhaustion",
        restTime: 0,
        imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=1000",
        tips: [
          "Run between two lines 20 meters apart",
          "Keep pace with the audio beeps",
          "Touch the line with your foot at each turn",
          "Continue until you can no longer keep pace"
        ],
        targetMuscles: ["Cardiovascular", "Legs", "Core"],
      },
      {
        id: "prep-pushpull-ex",
        name: "Push/Pull Machine",
        description: "Simulate the push/pull machine used in the PREP test",
        sets: 1,
        reps: "5 push + 5 pull",
        restTime: 120,
        imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=1000",
        tips: [
          "Position yourself at the push/pull machine",
          "Complete 5 push motions with maximum force",
          "Complete 5 pull motions with maximum force",
          "Maintain proper form throughout"
        ],
        targetMuscles: ["Chest", "Back", "Shoulders", "Arms"],
      },
      {
        id: "prep-obstacle-ex",
        name: "Obstacle Course",
        description: "Navigate through a series of obstacles simulating police scenarios",
        sets: 1,
        reps: "Complete course",
        restTime: 0,
        imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=1000",
        tips: [
          "Complete all obstacles in sequence",
          "Maintain control and accuracy",
          "Follow safety protocols",
          "Finish within time limit"
        ],
        targetMuscles: ["Full Body", "Agility", "Coordination"],
      },
    ],
  },
  {
    id: "pin-test-workout",
    title: "PIN Fitness Test",
    description: "Police Instructor Network (PIN) comprehensive fitness assessment",
    duration: 60,
    level: "intermediate",
    category: "Full Body",
    imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=1000",
    exercises: [
      {
        id: "pin-pushups-ex",
        name: "Push-ups Test",
        description: "Maximum push-ups in 1 minute",
        sets: 1,
        reps: "Maximum in 1 minute",
        restTime: 300,
        imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=1000",
        tips: [
          "Start in proper push-up position",
          "Lower chest to within 2 inches of ground",
          "Fully extend arms at the top",
          "Complete as many as possible in 1 minute"
        ],
        targetMuscles: ["Chest", "Shoulders", "Triceps", "Core"],
      },
      {
        id: "pin-sitreach-ex",
        name: "Sit and Reach Flexibility",
        description: "Measure lower back and hamstring flexibility",
        sets: 3,
        reps: "Hold 2 seconds",
        restTime: 60,
        imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=1000",
        tips: [
          "Sit with legs extended straight",
          "Reach forward as far as possible",
          "Hold position for 2 seconds",
          "Measure distance reached"
        ],
        targetMuscles: ["Hamstrings", "Lower Back", "Flexibility"],
      },
      {
        id: "pin-mile-ex",
        name: "1.5 Mile Run",
        description: "Cardiovascular endurance test - 1.5 mile run for time",
        sets: 1,
        reps: "1.5 miles",
        restTime: 300,
        imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=1000",
        tips: [
          "Complete 1.5 miles as quickly as possible",
          "Maintain steady pace",
          "No walking allowed",
          "Record finish time"
        ],
        targetMuscles: ["Cardiovascular", "Legs", "Endurance"],
      },
      {
        id: "pin-core-ex",
        name: "Core Endurance Test",
        description: "Plank hold for maximum time",
        sets: 1,
        reps: "Hold to failure",
        restTime: 180,
        imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=1000",
        tips: [
          "Start in proper plank position",
          "Maintain straight line from head to heels",
          "Hold position as long as possible",
          "Stop when form breaks down"
        ],
        targetMuscles: ["Core", "Shoulders", "Back"],
      },
      {
        id: "pin-backext-ex",
        name: "Back Extension Test",
        description: "Lower back strength and endurance assessment",
        sets: 1,
        reps: "Hold to failure",
        restTime: 0,
        imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=1000",
        tips: [
          "Lie face down on back extension bench",
          "Extend back to neutral position",
          "Hold for specified time",
          "Maintain proper form throughout"
        ],
        targetMuscles: ["Lower Back", "Glutes", "Core"],
      },
    ],
  },
  {
    id: "shuttle-run-workout",
    title: "20m Shuttle Run Test",
    description: "Standalone beep test for cardiovascular fitness assessment",
    duration: 20,
    level: "beginner",
    category: "Cardio",
    imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=1000",
    exercises: [
      {
        id: "shuttle-main-ex",
        name: "Progressive Shuttle Run",
        description: "Multi-stage fitness test with increasing intensity",
        sets: 1,
        reps: "Until exhaustion",
        restTime: 0,
        imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=1000",
        tips: [
          "Run between two lines 20 meters apart",
          "Start at walking pace, increase with beeps",
          "Touch the line with your foot at each turn",
          "Continue until you can no longer keep pace",
          "Record the level and shuttle number reached"
        ],
        targetMuscles: ["Cardiovascular", "Legs", "Agility"],
      },
    ],
  },
];

export default workouts;
import { Exercise } from './types';

export const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Workout', path: '/workout' },
  { name: 'Plan', path: '/plan' },
  { name: 'Diet', path: '/diet' },
  { name: 'Progress', path: '/progress' },
  { name: 'Settings', path: '/settings' },
];

export const MOCK_EXERCISES: Exercise[] = [
  { name: 'Push-ups', reps: 15 },
  { name: 'Squats', reps: 20 },
  // FIX: Added required `reps` property to conform to the `Exercise` type.
  { name: 'Plank', reps: 0, duration: 60 },
  // FIX: Added required `reps` property to conform to the `Exercise` type.
  { name: 'Jumping Jacks', reps: 0, duration: 45 },
  { name: 'Lunges', reps: 12 },
];

export const MOCK_PROGRESS_DATA = [
  { week: 'Week 1', reps: 350 },
  { week: 'Week 2', reps: 420 },
  { week: 'Week 3', reps: 480 },
  { week: 'Week 4', reps: 550 },
  { week: 'Week 5', reps: 610 },
  { week: 'Week 6', reps: 680 },
];

export const MOTIVATIONAL_QUOTES = [
    "The only bad workout is the one that didn't happen.",
    "Believe you can and you're halfway there.",
    "Success isn't always about greatness. It's about consistency.",
    "Strive for progress, not perfection.",
    "Your body can stand almost anything. It’s your mind that you have to convince.",
];

export interface Exercise {
  name: string;
  reps: number;
  duration?: number; // in seconds
}

export interface DailyPlan {
  day: string;
  exercises: string;
}

export interface WorkoutPlan {
  week: DailyPlan[];
}

export type FitnessGoal = 'strength' | 'weight_loss' | 'cardio' | 'flexibility';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

// New types for Diet Plan Generator
export interface Meal {
  meal_type: string; // e.g., 'Breakfast', 'Lunch', 'Snack'
  description: string;
  calories: number;
}

export type DietGoal = 'weight_loss' | 'muscle_gain' | 'maintenance';

export interface DietaryPreferences {
  goal: DietGoal;
  preferences: string; // e.g., 'vegetarian, no nuts'
}

import { GoogleGenAI, Type } from "@google/genai";
import { FitnessGoal, ExperienceLevel, DailyPlan, DietaryPreferences, Meal } from '../types';

interface PlanRequest {
  goal: FitnessGoal;
  level: ExperienceLevel;
  daysPerWeek: number;
  hoursPerDay: number;
}

const planSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      day: {
        type: Type.STRING,
        description: "The day of the week for the workout (e.g., 'Day 1', 'Day 2').",
      },
      exercises: {
        type: Type.STRING,
        description: "A comma-separated string of exercises for that day (e.g., 'Push-ups, Squats, Plank').",
      },
    },
    required: ["day", "exercises"],
  },
};

const dietSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        meal_type: {
          type: Type.STRING,
          description: "The type of meal (e.g., 'Breakfast', 'Lunch', 'Dinner', 'Snack').",
        },
        description: {
          type: Type.STRING,
          description: "A brief description of the meal.",
        },
        calories: {
            type: Type.INTEGER,
            description: "An estimated calorie count for the meal.",
        }
      },
      required: ["meal_type", "description", "calories"],
    },
};

const getAiInstance = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using mock data.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateWorkoutPlan = async (request: PlanRequest): Promise<DailyPlan[]> => {
  const ai = getAiInstance();
  if (!ai) {
    return [
      { day: 'Day 1', exercises: 'Push-ups, Squats, Plank' },
      { day: 'Day 2', exercises: 'Rest' },
      { day: 'Day 3', exercises: 'Jumping Jacks, Lunges, Crunches' },
      { day: 'Day 4', exercises: 'Rest' },
      { day: 'Day 5', exercises: 'Burpees, High Knees, Leg Raises' },
    ];
  }

  const prompt = `
    Create a personalized workout plan for a user with the following details:
    - Fitness Goal: ${request.goal}
    - Experience Level: ${request.level}
    - Availability: ${request.daysPerWeek} days per week, ${request.hoursPerDay} hour(s) per day.

    Generate a plan for one week. The output should be a clean list of daily exercises.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: planSchema,
      },
    });

    const jsonText = response.text.trim();
    const plan = JSON.parse(jsonText) as DailyPlan[];
    return plan;
  } catch (error) {
    console.error("Error generating workout plan with Gemini:", error);
    throw new Error("Failed to generate workout plan. Please try again.");
  }
};

export const generateHomePageSubheading = async (): Promise<string> => {
    const ai = getAiInstance();
    if (!ai) return "Your journey to a healthier you starts now.";

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Generate a short, motivational, and encouraging subheading for a fitness app's hero section. Max 15 words.",
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating subheading:", error);
        return "Your journey to a healthier you starts now.";
    }
};

export const generateExerciseFeedback = async (exerciseName: string): Promise<string> => {
    const ai = getAiInstance();
    if (!ai) return "Focus on your breathing and maintain control.";

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Give me one, short, actionable tip for improving my form on ${exerciseName}. Max 10 words.`,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating feedback:", error);
        return "Focus on your breathing and maintain control.";
    }
};

export const generateMotivationalQuote = async (): Promise<string> => {
    const ai = getAiInstance();
    if (!ai) return "The only bad workout is the one that didn't happen.";
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Generate an inspiring and motivational quote about fitness and perseverance.",
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating quote:", error);
        return "The only bad workout is the one that didn't happen.";
    }
};

export const analyzeProgress = async (data: { week: string; reps: number }[]): Promise<string> => {
    const ai = getAiInstance();
    if (!ai) return "Your progress is looking great! Keep up the consistent effort and you'll continue to see amazing results. Stay focused!";

    const dataString = data.map(d => `${d.week}: ${d.reps} reps`).join(', ');
    const prompt = `
        A user has provided their weekly workout progress data: ${dataString}.
        Analyze this progress and provide a short, encouraging, and insightful summary.
        Mention the trend (e.g., steady increase) and offer some motivation to keep going. Be positive and brief.
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error analyzing progress:", error);
        return "Could not analyze progress, but keep up the great work!";
    }
};

export const generateDietPlan = async (request: DietaryPreferences): Promise<Meal[]> => {
    const ai = getAiInstance();
    if (!ai) {
      return [
        { meal_type: 'Breakfast', description: 'Oatmeal with berries and a sprinkle of nuts.', calories: 350 },
        { meal_type: 'Lunch', description: 'Grilled chicken salad with mixed greens and a light vinaigrette.', calories: 450 },
        { meal_type: 'Dinner', description: 'Baked salmon with roasted sweet potatoes and broccoli.', calories: 550 },
        { meal_type: 'Snack', description: 'Greek yogurt with a teaspoon of honey.', calories: 150 },
      ];
    }
  
    const prompt = `
      Create a one-day sample diet plan for a user with the following details:
      - Goal: ${request.goal}
      - Dietary Preferences/Restrictions: ${request.preferences}
  
      Generate a plan with breakfast, lunch, dinner, and one snack. For each meal, provide a brief description and an estimated calorie count.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: dietSchema,
        },
      });
  
      const jsonText = response.text.trim();
      const plan = JSON.parse(jsonText) as Meal[];
      return plan;
    } catch (error) {
      console.error("Error generating diet plan with Gemini:", error);
      throw new Error("Failed to generate diet plan. Please try again.");
    }
  };
  

export interface PoseAnalysisResult {
  feedback: string | null;
  isRepCounted: boolean;
}

// A list of mock feedback messages for different exercises
const mockFeedback: Record<string, string[]> = {
  'Push-ups': [
    'Keep your back straight.',
    'Lower your chest to the floor.',
    'Elbows should be closer to your body.',
    'Core engaged!',
    'Good form!',
  ],
  'Squats': [
    'Keep your chest up.',
    'Go deeper, thighs parallel to the ground.',
    'Don\'t let your knees go past your toes.',
    'Weight on your heels.',
    'Excellent depth!',
  ],
  'Lunges': [
    'Keep your front knee at a 90-degree angle.',
    'Don\'t let your back knee touch the ground.',
    'Maintain an upright torso.',
    'Solid stance!',
  ],
  'default': [
    'Maintain a steady pace.',
    'Control your breathing.',
    'Great work!',
  ],
};

let lastFeedbackTime = 0;
const FEEDBACK_COOLDOWN = 4000; // 4 seconds

let lastRepTime = 0;
const REP_COOLDOWN = 2000; // 2 seconds

/**
 * Mocks a pose estimation service.
 * In a real application, this would analyze a video frame using a library
 * like TensorFlow.js PoseNet or MediaPipe.
 * @param videoElement The HTML video element with the user's feed.
 * @param exerciseName The name of the current exercise.
 * @returns A promise resolving to a PoseAnalysisResult.
 */
export const analyzePose = async (
  videoElement: HTMLVideoElement,
  exerciseName: string
): Promise<PoseAnalysisResult> => {
  // Simulate async processing time (e.g. inference time)
  await new Promise(resolve => setTimeout(resolve, 150));

  const now = Date.now();
  const result: PoseAnalysisResult = {
    feedback: null,
    isRepCounted: false,
  };
  
  // Simulate providing corrective feedback occasionally
  if (now - lastFeedbackTime > FEEDBACK_COOLDOWN && Math.random() < 0.3) { // 30% chance to give feedback if cooldown passed
    const feedbackOptions = mockFeedback[exerciseName] || mockFeedback['default'];
    const randomIndex = Math.floor(Math.random() * feedbackOptions.length);
    result.feedback = feedbackOptions[randomIndex];
    lastFeedbackTime = now;
  }

  // Simulate counting a rep
  // A higher chance means reps are counted faster.
  if (now - lastRepTime > REP_COOLDOWN && Math.random() < 0.2) { 
    result.isRepCounted = true;
    lastRepTime = now;
  }
  
  return result;
};

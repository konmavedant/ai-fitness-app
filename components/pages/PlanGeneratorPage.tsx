
import React, { useState } from 'react';
import { generateWorkoutPlan } from '../../services/geminiService';
import { FitnessGoal, ExperienceLevel, DailyPlan } from '../../types';

const PlanGeneratorPage: React.FC = () => {
  const [goal, setGoal] = useState<FitnessGoal>('strength');
  const [level, setLevel] = useState<ExperienceLevel>('beginner');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(3);
  const [hoursPerDay, setHoursPerDay] = useState<number>(1);
  const [plan, setPlan] = useState<DailyPlan[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPlan(null);
    try {
      const generatedPlan = await generateWorkoutPlan({ goal, level, daysPerWeek, hoursPerDay });
      setPlan(generatedPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Create Your Plan</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Tell us about your goals, and our AI will generate a personalized weekly workout plan.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="goal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fitness Goal</label>
                <select id="goal" value={goal} onChange={(e) => setGoal(e.target.value as FitnessGoal)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-primary focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm rounded-md">
                  <option value="strength">Strength Training</option>
                  <option value="weight_loss">Weight Loss</option>
                  <option value="cardio">Cardio</option>
                  <option value="flexibility">Flexibility</option>
                </select>
              </div>

              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Experience Level</label>
                <select id="level" value={level} onChange={(e) => setLevel(e.target.value as ExperienceLevel)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-primary focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm rounded-md">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
               <div>
                <label htmlFor="days" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Days per week: {daysPerWeek}</label>
                <input type="range" id="days" min="1" max="7" value={daysPerWeek} onChange={(e) => setDaysPerWeek(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/>
              </div>

              <div>
                <label htmlFor="hours" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hours per day: {hoursPerDay}</label>
                <input type="range" id="hours" min="1" max="3" value={hoursPerDay} onChange={(e) => setHoursPerDay(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/>
              </div>
            </div>

            <div className="mt-8">
              <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
                {isLoading ? 'Generating...' : 'Generate Plan'}
              </button>
            </div>
          </form>
        </div>

        {/* Plan Display Section */}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl p-8">
          <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Your Weekly Plan</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">Powered by LLM recommendations</p>
          {isLoading && (
             <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-blue"></div>
             </div>
          )}
          {error && <div className="text-accent-red bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</div>}
          {plan && (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-dark-primary">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Day</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Exercises</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                       {plan.map((item, index) => (
                         <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.day}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.exercises}</td>
                         </tr>
                       ))}
                    </tbody>
                </table>
            </div>
          )}
          {!isLoading && !plan && !error && (
            <div className="text-center text-gray-500 dark:text-gray-400 p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                Your generated plan will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanGeneratorPage;

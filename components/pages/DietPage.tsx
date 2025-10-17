import React, { useState } from 'react';
import { generateDietPlan } from '../../services/geminiService';
import { DietGoal, Meal } from '../../types';
import { FoodIcon, SparklesIcon } from '../icons/Icons';

const DietPage: React.FC = () => {
  const [goal, setGoal] = useState<DietGoal>('weight_loss');
  const [preferences, setPreferences] = useState<string>('');
  const [plan, setPlan] = useState<Meal[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPlan(null);
    try {
      const generatedPlan = await generateDietPlan({ goal, preferences });
      setPlan(generatedPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalCalories = plan?.reduce((sum, meal) => sum + meal.calories, 0) || 0;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">AI Diet Planner</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Describe your dietary goals and let AI create a sample daily plan for you.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="goal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Primary Goal</label>
                <select id="goal" value={goal} onChange={(e) => setGoal(e.target.value as DietGoal)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-primary focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm rounded-md">
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label htmlFor="preferences" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preferences & Restrictions</label>
                <textarea
                  id="preferences"
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-primary border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                  placeholder="e.g., vegetarian, gluten-free, no nuts"
                />
              </div>
            </div>

            <div className="mt-8">
              <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
                <SparklesIcon className="h-5 w-5"/>
                {isLoading ? 'Generating Diet...' : 'Generate Diet Plan'}
              </button>
            </div>
          </form>
        </div>

        {/* Plan Display Section */}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl p-8">
          <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Your Sample Daily Plan</h3>
          {isLoading && (
             <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-blue"></div>
             </div>
          )}
          {error && <div className="text-accent-red bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</div>}
          {plan && (
            <div className="space-y-4">
              {plan.map((meal, index) => (
                <div key={index} className="bg-gray-50 dark:bg-dark-primary p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-lg text-accent-blue">{meal.meal_type}</h4>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{meal.calories} kcal</span>
                  </div>
                  <p className="mt-1 text-gray-700 dark:text-gray-400">{meal.description}</p>
                </div>
              ))}
              <div className="text-right font-bold text-lg pt-4 border-t border-gray-200 dark:border-gray-700">
                Total Estimated Calories: <span className="text-accent-blue">{totalCalories} kcal</span>
              </div>
            </div>
          )}
          {!isLoading && !plan && !error && (
            <div className="text-center text-gray-500 dark:text-gray-400 p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-full flex flex-col justify-center items-center">
                <FoodIcon className="h-12 w-12 text-gray-400 mb-4" />
                <p>Your generated diet plan will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DietPage;

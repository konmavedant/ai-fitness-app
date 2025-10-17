import React, { useState, useEffect } from 'react';
import { MOCK_PROGRESS_DATA } from '../../constants';
import { generateMotivationalQuote, analyzeProgress } from '../../services/geminiService';
import StatCard from '../StatCard';
import ProgressChart from '../ProgressChart';
import { RefreshIcon, SparklesIcon } from '../icons/Icons';

const ProgressPage: React.FC = () => {
    const [quote, setQuote] = useState({ text: '', isLoading: true });
    const [analysis, setAnalysis] = useState({ text: '', isLoading: false, hasAnalyzed: false });

    const fetchQuote = async () => {
        setQuote({ text: '...', isLoading: true });
        const newQuote = await generateMotivationalQuote();
        setQuote({ text: newQuote, isLoading: false });
    };

    const handleAnalysis = async () => {
        setAnalysis({ text: '', isLoading: true, hasAnalyzed: true });
        const result = await analyzeProgress(MOCK_PROGRESS_DATA);
        setAnalysis({ text: result, isLoading: false, hasAnalyzed: true });
    };
    
    useEffect(() => {
        fetchQuote();
    }, []);

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Your Progress</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Track your journey, celebrate milestones, and stay motivated.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Workouts Completed" value="42" unit="" />
                <StatCard title="Total Reps" value="12,850" unit="reps" />
                <StatCard title="Calories Burned" value="8,230" unit="kcal" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-lg shadow-xl p-6">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Weekly Reps Progress</h2>
                    <div className="h-80">
                        <ProgressChart data={MOCK_PROGRESS_DATA} />
                    </div>
                </div>
                <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl p-6 flex flex-col">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">AI Insights</h2>
                    {analysis.hasAnalyzed ? (
                        <div className="flex-grow">
                            {analysis.isLoading ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue"></div>
                                </div>
                            ) : (
                                <p className="text-gray-600 dark:text-gray-300">{analysis.text}</p>
                            )}
                        </div>
                    ) : (
                         <div className="flex-grow flex flex-col justify-center items-center text-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                            <SparklesIcon className="h-10 w-10 text-gray-400 mb-2"/>
                            <p className="text-gray-500 dark:text-gray-400">Get AI-powered analysis of your progress chart.</p>
                        </div>
                    )}
                    <button onClick={handleAnalysis} disabled={analysis.isLoading} className="w-full mt-4 flex justify-center items-center gap-2 bg-accent-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500">
                        <SparklesIcon className="h-5 w-5"/> {analysis.hasAnalyzed ? 'Re-analyze' : 'Analyze My Progress'}
                    </button>
                </div>
            </div>

            <div className="bg-accent-blue/10 dark:bg-blue-900/20 border-l-4 border-accent-blue p-6 rounded-r-lg shadow-md flex items-center justify-between">
                <p className="text-lg italic text-blue-800 dark:text-blue-200 pr-4">{quote.isLoading ? 'Generating inspiration...' : `"${quote.text}"`}</p>
                <button onClick={fetchQuote} disabled={quote.isLoading} aria-label="Get new quote" className="flex-shrink-0 p-2 rounded-full hover:bg-accent-blue/20 transition-colors">
                    <RefreshIcon className={`h-6 w-6 text-accent-blue ${quote.isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>
        </div>
    );
};

export default ProgressPage;

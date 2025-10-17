import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './components/pages/HomePage';
import WorkoutPage from './components/pages/WorkoutPage';
import PlanGeneratorPage from './components/pages/PlanGeneratorPage';
import DietPage from './components/pages/DietPage';
import ProgressPage from './components/pages/ProgressPage';
import SettingsPage from './components/pages/SettingsPage';

const AppContent: React.FC = () => {
    const location = useLocation();
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 500); // Animation duration
        return () => clearTimeout(timer);
    }, [location]);

    return (
        <main className={`flex-grow transition-opacity duration-500 ease-in-out ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/workout" element={<WorkoutPage />} />
                <Route path="/plan" element={<PlanGeneratorPage />} />
                <Route path="/diet" element={<DietPage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Routes>
        </main>
    );
}

const App: React.FC = () => {
    useEffect(() => {
        if (localStorage.getItem('theme') === 'dark' || 
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    return (
        <HashRouter>
            <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-dark-bg text-gray-800 dark:text-gray-200 font-sans">
                <Navbar />
                <AppContent />
            </div>
        </HashRouter>
    );
};

export default App;

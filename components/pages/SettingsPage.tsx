
import React, { useState, useEffect } from 'react';

const SettingsToggle: React.FC<{ label: string; enabled: boolean; onToggle: () => void }> = ({ label, enabled, onToggle }) => (
    <div className="flex items-center justify-between py-4">
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
      <button
        onClick={onToggle}
        className={`${enabled ? 'bg-accent-blue' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        aria-checked={enabled}
        role="switch"
      >
        <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
      </button>
    </div>
);

const SettingsPage: React.FC = () => {
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [webcamEnabled, setWebcamEnabled] = useState(true);

    // Profile State with LocalStorage Persistence
    const [name, setName] = useState(() => localStorage.getItem('userName') || 'Alex Doe');
    const [weight, setWeight] = useState(() => localStorage.getItem('userWeight') || '75');
    const [height, setHeight] = useState(() => localStorage.getItem('userHeight') || '180');
    const [showSaveMessage, setShowSaveMessage] = useState(false);

    useEffect(() => {
        setIsDarkTheme(document.documentElement.classList.contains('dark'));

        // Load other settings if they exist
        const storedNotifs = localStorage.getItem('notificationsEnabled');
        if (storedNotifs !== null) setNotificationsEnabled(JSON.parse(storedNotifs));
        
        const storedWebcam = localStorage.getItem('webcamEnabled');
        if (storedWebcam !== null) setWebcamEnabled(JSON.parse(storedWebcam));
    }, []);

    // Persist profile changes immediately (Real-time update)
    useEffect(() => { localStorage.setItem('userName', name); }, [name]);
    useEffect(() => { localStorage.setItem('userWeight', weight); }, [weight]);
    useEffect(() => { localStorage.setItem('userHeight', height); }, [height]);

    // Persist toggle changes
    useEffect(() => { localStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabled)); }, [notificationsEnabled]);
    useEffect(() => { localStorage.setItem('webcamEnabled', JSON.stringify(webcamEnabled)); }, [webcamEnabled]);

    const handleThemeToggle = () => {
        if (isDarkTheme) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        setIsDarkTheme(!isDarkTheme);
    };
    
    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        // Since we update in real-time via useEffect, this button provides visual confirmation
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 3000);
    };
    
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">Settings</h1>

            {/* Profile Section */}
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl p-8 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Profile</h2>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Hello, <span className="font-bold text-accent-blue transition-all duration-300">{name || 'User'}</span>
                    </div>
                </div>
                <form className="space-y-4" onSubmit={handleProfileUpdate}>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                        <input 
                            type="text" 
                            id="name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-primary border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Weight (kg)</label>
                            <input 
                                type="number" 
                                id="weight" 
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-primary border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="height" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Height (cm)</label>
                            <input 
                                type="number" 
                                id="height" 
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-primary border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                            />
                        </div>
                    </div>
                     <div className="pt-4">
                        <button type="submit" className="w-full bg-accent-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex justify-center items-center">
                            {showSaveMessage ? (
                                <span className="flex items-center gap-2 animate-fade-in">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Saved Successfully
                                </span>
                            ) : 'Update Profile'}
                        </button>
                    </div>
                </form>
            </div>

            {/* App Settings Section */}
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">App Settings</h2>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    <SettingsToggle label="Dark Theme" enabled={isDarkTheme} onToggle={handleThemeToggle} />
                    <SettingsToggle label="Enable Webcam" enabled={webcamEnabled} onToggle={() => setWebcamEnabled(p => !p)} />
                    <SettingsToggle label="Push Notifications" enabled={notificationsEnabled} onToggle={() => setNotificationsEnabled(p => !p)} />
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;

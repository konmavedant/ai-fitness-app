
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

    useEffect(() => {
        setIsDarkTheme(document.documentElement.classList.contains('dark'));
    }, []);

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
    
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">Settings</h1>

            {/* Profile Section */}
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">User Profile</h2>
                <form className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                        <input type="text" id="name" defaultValue="Alex Doe" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-primary border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Weight (kg)</label>
                            <input type="number" id="weight" defaultValue="75" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-primary border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"/>
                        </div>
                        <div>
                            <label htmlFor="height" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Height (cm)</label>
                            <input type="number" id="height" defaultValue="180" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-primary border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"/>
                        </div>
                    </div>
                     <div className="pt-4">
                        <button type="submit" className="w-full bg-accent-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            Update Profile
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

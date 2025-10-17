
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  unit: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, unit }) => {
  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg p-6 transform hover:-translate-y-1 transition-transform duration-300">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
      <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
        {value} <span className="text-lg font-normal text-gray-500 dark:text-gray-400">{unit}</span>
      </p>
    </div>
  );
};

export default StatCard;

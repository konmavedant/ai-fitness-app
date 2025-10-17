
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProgressChartProps {
  data: { week: string; reps: number }[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const axisColor = isDarkMode ? '#9ca3af' : '#6b7280';
  const gridColor = isDarkMode ? '#4a5568' : '#e5e7eb';
  const tooltipBg = isDarkMode ? 'rgba(45, 55, 72, 0.8)' : 'rgba(255, 255, 255, 0.8)';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="week" stroke={axisColor} />
        <YAxis stroke={axisColor} />
        <Tooltip 
          contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${gridColor}`, borderRadius: '0.5rem' }} 
          labelStyle={{ color: isDarkMode ? '#f9fafb' : '#1f2937' }}
        />
        <Legend wrapperStyle={{ color: axisColor }} />
        <Line type="monotone" dataKey="reps" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProgressChart;

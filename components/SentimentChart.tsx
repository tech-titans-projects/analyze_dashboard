
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { SentimentResult } from '../types';
import { Sentiment } from '../types';

interface SentimentChartProps {
  results: SentimentResult[];
}

const COLORS = {
  [Sentiment.Positive]: '#22c55e', // green-500
  [Sentiment.Negative]: '#ef4444', // red-500
  [Sentiment.Neutral]: '#6b7280',  // gray-500
};

export const SentimentChart: React.FC<SentimentChartProps> = ({ results }) => {
  const sentimentCounts = results.reduce((acc, result) => {
    acc[result.sentiment] = (acc[result.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<Sentiment, number>);

  const data = Object.entries(sentimentCounts).map(([name, value]) => ({
    name: name as Sentiment,
    value,
  }));

  if (data.length === 0) {
    return <div className="text-center text-gray-500">No data to display.</div>;
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
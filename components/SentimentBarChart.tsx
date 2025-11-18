
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { SentimentResult } from '../types';
import { Sentiment } from '../types';

interface SentimentBarChartProps {
  results: SentimentResult[];
}

const COLORS = {
  [Sentiment.Positive]: '#22c55e', // green-500
  [Sentiment.Negative]: '#ef4444', // red-500
  [Sentiment.Neutral]: '#6b7280',  // gray-500
};

export const SentimentBarChart: React.FC<SentimentBarChartProps> = ({ results }) => {
  const sentimentCounts = results.reduce((acc, result) => {
    acc[result.sentiment] = (acc[result.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<Sentiment, number>);

  const data = Object.entries(sentimentCounts).map(([name, value]) => ({
    name: name as Sentiment,
    count: value,
  }));

  if (data.length === 0) {
    return <div className="text-center text-gray-500">No data to display.</div>;
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} width={30} />
          <Tooltip
            cursor={{ fill: 'rgba(206, 206, 206, 0.2)' }}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
             {data.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
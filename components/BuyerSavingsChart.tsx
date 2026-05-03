import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'Market Price', value: 10000 },
  { name: 'Best Offer', value: 8700 },
];

export const BuyerSavingsChart: React.FC = () => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brand-slate p-4 rounded-xl shadow-xl border-none">
          <p className="text-white font-bold">{payload[0].name}</p>
          <p className="text-brand-primary font-medium">value : {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-72 w-full bg-white p-6 rounded-2xl shadow-saas">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }} 
          style={{ outline: 'none' }}
          tabIndex={-1}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
            dy={10}
          />
          <YAxis hide />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            content={<CustomTooltip />}
          />
          <Bar 
            dataKey="value" 
            barSize={60} 
            radius={[8, 8, 8, 8]}
            isAnimationActive={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? '#e2e8f0' : '#FACC15'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
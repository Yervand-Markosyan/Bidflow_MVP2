import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Month 1', buyers: 3 },
  { month: 'Month 3', buyers: 18 },
  { month: 'Month 6', buyers: 45 },
];

export const SupplierGrowthChart: React.FC = () => {
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
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
            dy={10}
          />
          <YAxis hide />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ 
              backgroundColor: '#0f172a', 
              borderRadius: '12px', 
              border: 'none', 
              color: '#fff',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }} 
          />
          <Bar 
            dataKey="buyers" 
            fill="#FACC15" 
            barSize={40} 
            radius={[8, 8, 8, 8]} 
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
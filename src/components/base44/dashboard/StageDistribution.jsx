import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const STAGE_COLORS = {
  "Scanning": "#3b82f6",
  "Digitization": "#f59e0b",
  "Checking": "#a855f7",
  "Uploading": "#10b981",
  "Completed": "#64748b",
};

export default function StageDistributionChart({ books }) {
  const stageCounts = {};
  books.forEach(book => {
    const stage = book.status === "Completed" ? "Completed" : book.current_stage;
    stageCounts[stage] = (stageCounts[stage] || 0) + 1;
  });

  const data = Object.entries(stageCounts).map(([name, value]) => ({ name, value }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        No data yet
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <div className="w-40 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={65}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={STAGE_COLORS[entry.name] || "#94a3b8"} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {data.map(item => (
          <div key={item.name} className="flex items-center gap-2 text-sm">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STAGE_COLORS[item.name] || "#94a3b8" }} />
            <span className="text-slate-600">{item.name}</span>
            <span className="font-semibold text-slate-800 ml-auto">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
'use client';

import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';

const generateData = () => {
  return Array.from({ length: 15 }, (_, i) => ({
    name: `Page ${i}`,
    uv: Math.random() * (i + 1) * 300 + 200,
  }));
};

interface SmallAreaChartProps {
  isPositive?: boolean;
}

export default function SmallAreaChart({ isPositive = true }: SmallAreaChartProps) {
  const [data] = React.useState(generateData());
  const color = isPositive ? 'hsl(var(--chart-1))' : '#ef4444';
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`colorUv-${isPositive}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="uv"
          stroke={color}
          strokeWidth={2}
          fillOpacity={1}
          fill={`url(#colorUv-${isPositive})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

import React from 'react';

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  height?: number;
  showValues?: boolean;
}

export function BarChart({ data, height = 200, showValues = true }: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={item.label} className="flex items-center space-x-3">
          <div className="w-32 text-sm font-medium text-gray-700 truncate">
            {item.label}
          </div>
          <div className="flex-1 flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  item.color || 'bg-spiritual-blue'
                }`}
                style={{
                  width: `${maxValue > 0 ? Math.max(5, (item.value / maxValue) * 100) : 0}%`
                }}
              />
            </div>
            {showValues && (
              <div className="w-12 text-sm text-gray-600 text-right">
                {item.value}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

interface DonutChartProps {
  data: BarChartData[];
  size?: number;
  centerText?: string;
}

export function DonutChart({ data, size = 120, centerText }: DonutChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        No data available
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  
  let cumulativePercentage = 0;
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercentage / 100) * circumference);
    
    cumulativePercentage += percentage;
    
    return {
      ...item,
      percentage,
      strokeDasharray,
      strokeDashoffset,
      color: item.color || `hsl(${(index * 360) / data.length}, 70%, 50%)`
    };
  });

  return (
    <div className="flex items-center space-x-4">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {segments.map((segment, index) => (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth="8"
              strokeDasharray={segment.strokeDasharray}
              strokeDashoffset={segment.strokeDashoffset}
              className="transition-all duration-500"
            />
          ))}
        </svg>
        {centerText && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{centerText}</div>
            </div>
          </div>
        )}
      </div>
      <div className="space-y-2">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-sm text-gray-600">
              {segment.label}: {segment.value} ({Math.round(segment.percentage)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
}

export function MetricCard({ title, value, subtitle, icon, trend }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-2 text-xs ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <span className="font-medium">
                {trend.isPositive ? '+' : ''}{trend.value}
              </span>
              <span className="ml-1">{trend.label}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
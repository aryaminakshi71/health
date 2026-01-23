/**
 * Vital Signs Chart Component
 */

import { useMemo } from 'react';

export interface VitalSignsData {
  date: string;
  temperature?: number;
  heartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  oxygenSaturation?: number;
}

export interface VitalSignsChartProps {
  data: VitalSignsData[];
  metric: 'temperature' | 'heartRate' | 'bloodPressure' | 'oxygenSaturation';
}

export function VitalSignsChart({ data, metric }: VitalSignsChartProps) {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      date: new Date(d.date).toLocaleDateString(),
      value: metric === 'bloodPressure' 
        ? `${d.bloodPressureSystolic}/${d.bloodPressureDiastolic}`
        : d[metric],
    }));
  }, [data, metric]);

  const maxValue = useMemo(() => {
    if (metric === 'bloodPressure') return 200;
    if (metric === 'temperature') return 42;
    if (metric === 'heartRate') return 150;
    if (metric === 'oxygenSaturation') return 100;
    return 100;
  }, [metric]);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4 capitalize">
        {metric.replace(/([A-Z])/g, ' $1').trim()} Trend
      </h3>
      <div className="h-64 flex items-end justify-between gap-2">
        {chartData.map((point, index) => {
          const height = typeof point.value === 'number' 
            ? (point.value / maxValue) * 100 
            : 50;
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                style={{ height: `${height}%` }}
                title={`${point.date}: ${point.value}`}
              />
              <span className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left">
                {point.date.split('/')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

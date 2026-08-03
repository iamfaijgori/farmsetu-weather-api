import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface TimelineChartProps {
  selectedRegions: string[];
  timeRange: string; 
  selectedCondition: string; 
  hasDataLoaded: boolean;
}

const ALL_PARAMETERS = [
  { id: 'tmax', label: 'Max Temp', color: '#ef4444' },
  { id: 'tmin', label: 'Min Temp', color: '#3b82f6' },
  { id: 'tmean', label: 'Mean Temp', color: '#8b5cf6' },
  { id: 'sun', label: 'Sunshine', color: '#f59e0b' },
  { id: 'rain', label: 'Rainfall', color: '#10b981' },
];

const REGION_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];

export const TimelineChart: React.FC<TimelineChartProps> = ({
  selectedRegions,
  timeRange,
  selectedCondition,
  hasDataLoaded
}) => {
  const [activeParams, setActiveParams] = useState<string[]>(['tmean', 'rain', 'sun']);
  
  const isMultiRegion = selectedRegions.length > 1;

  // 1. Dynamic Mock Data Generator to support any combination before backend connection
  const generateMockData = () => {
    if (!hasDataLoaded) return [];

    const labels = timeRange === 'monthly' ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      : timeRange === 'seasonal' ? ['Win', 'Spr', 'Sum', 'Aut', 'Ann']
      : ['2020', '2021', '2022', '2023', '2024'];

    return labels.map((time, i) => {
      const dataPoint: any = { time };
      if (isMultiRegion) {
        // Multi-Region logic: Create a data point for each region
        selectedRegions.forEach((reg, rIdx) => {
          const base = selectedCondition === 'rain' ? 80 : selectedCondition === 'sun' ? 120 : 12;
          dataPoint[reg] = Number((base + Math.sin(i) * 5 + (rIdx * 2)).toFixed(1));
        });
      } else {
        // Single Region logic
        dataPoint.tmax = Number((15 + Math.sin(i)*8).toFixed(1));
        dataPoint.tmin = Number((5 + Math.sin(i)*6).toFixed(1));
        dataPoint.tmean = Number((10 + Math.sin(i)*7).toFixed(1));
        dataPoint.sun = Number((100 + Math.sin(i)*50).toFixed(0));
        dataPoint.rain = Number((60 + Math.cos(i)*20).toFixed(0));
      }
      return dataPoint;
    });
  };

  const chartData = generateMockData();

  // 2. Determine which lines to draw
  const linesToRender = isMultiRegion
    ? selectedRegions.map((reg, idx) => ({ id: reg, label: reg, color: REGION_COLORS[idx % REGION_COLORS.length] }))
    : selectedCondition !== 'all'
      ? ALL_PARAMETERS.filter((p) => p.id === selectedCondition)
      : ALL_PARAMETERS.filter((p) => activeParams.includes(p.id));

  // 3. UI Labels
  const viewBadgeLabel = !hasDataLoaded ? 'Awaiting Data' : timeRange === 'monthly' ? 'Monthly View' : timeRange === 'seasonal' ? 'Seasonal View' : 'Yearly View';
  const regionLabel = selectedRegions.length === 0 ? 'None' : selectedRegions.length > 3 ? `${selectedRegions.length} Regions` : selectedRegions.join(', ');

  const toggleParam = (id: string) => {
    if (activeParams.includes(id)) {
      if (activeParams.length > 1) setActiveParams(activeParams.filter((p) => p !== id));
    } else {
      setActiveParams([...activeParams, id]);
    }
  };

  return (
    <section className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Timeline Overview</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Region: {regionLabel}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
              {viewBadgeLabel}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {!hasDataLoaded ? 'Select parameters and click Load Data.' : isMultiRegion ? `Comparing ${selectedCondition} across selected regions.` : 'Trends across weather parameters.'}
          </p>
        </div>

        {/* Legend: Only show interactive condition toggles if Single Region & All Conditions */}
        {!isMultiRegion && selectedCondition === 'all' && hasDataLoaded && (
          <div className="flex flex-wrap items-center gap-3">
            {ALL_PARAMETERS.map((param) => {
              const isActive = activeParams.includes(param.id);
              return (
                <button key={param.id} onClick={() => toggleParam(param.id)} className={`flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-lg transition-all ${isActive ? 'bg-slate-50 text-slate-800 shadow-2xs' : 'opacity-40 hover:opacity-75 text-slate-500'}`}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: param.color }} />
                  <span>{param.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="w-full h-80 sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
            
            {hasDataLoaded && linesToRender.map((line) => (
              <Line key={line.id} type="monotone" dataKey={line.id} name={line.label} stroke={line.color} strokeWidth={2.5} dot={{ r: 3, fill: line.color, strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
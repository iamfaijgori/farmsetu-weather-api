import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TimelineChartProps {
  data: any[];
  selectedRegions: string[];
  timeRange: string; // <-- ALIGNED: using timeRange instead of duration
  selectedCondition: string[];
  hasDataLoaded: boolean;
}

export const TimelineChart: React.FC<TimelineChartProps> = ({ data, selectedRegions, timeRange, hasDataLoaded }) => {
  
  if (!hasDataLoaded || !data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm mt-6 border border-slate-200 min-h-[400px] flex items-center justify-center">
        <p className="text-slate-400 font-medium">Load data to view timeline trends.</p>
      </div>
    );
  }

  // 1. Chart Data Processor
  const generateChartData = () => {
    const targetRegion = selectedRegions[0];
    const regionData = data.filter(d => d.region === targetRegion);

    if (['1y', '5y', '10y', 'all'].includes(timeRange)) {
      // For multi-year views, only plot the Annual ('Ann') summary rows
      return regionData
        .filter(d => d.period === 'Ann')
        .sort((a, b) => a.year - b.year)
        .map(d => ({
          name: d.year.toString(),
          tmax: d.tmax !== null ? d.tmax : undefined,
          tmean: d.tmean !== null ? d.tmean : undefined,
          tmin: d.tmin !== null ? d.tmin : undefined,
          rain: d.rain !== null ? d.rain : undefined,
          sun: d.sun !== null ? d.sun : undefined
        }));
    } else if (timeRange === 'monthly') {
      // For monthly views, plot Jan to Dec
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return regionData
        .filter(d => months.includes(d.period))
        .sort((a, b) => months.indexOf(a.period) - months.indexOf(b.period))
        .map(d => ({
          name: d.period,
          tmax: d.tmax !== null ? d.tmax : undefined,
          tmean: d.tmean !== null ? d.tmean : undefined,
          tmin: d.tmin !== null ? d.tmin : undefined,
          rain: d.rain !== null ? d.rain : undefined,
          sun: d.sun !== null ? d.sun : undefined
        }));
    } else if (timeRange === 'seasonal') {
      // For seasonal views, plot Win, Spr, Sum, Aut
      const seasons = ['Win', 'Spr', 'Sum', 'Aut'];
      return regionData
        .filter(d => seasons.includes(d.period))
        .sort((a, b) => seasons.indexOf(a.period) - seasons.indexOf(b.period))
        .map(d => ({
          name: d.period,
          tmax: d.tmax !== null ? d.tmax : undefined,
          tmean: d.tmean !== null ? d.tmean : undefined,
          tmin: d.tmin !== null ? d.tmin : undefined,
          rain: d.rain !== null ? d.rain : undefined,
          sun: d.sun !== null ? d.sun : undefined
        }));
    }
    return [];
  };

  const chartData = generateChartData();
  const primaryRegion = selectedRegions[0] || 'Unknown';

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm mt-6 border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Timeline Overview</h3>
          <span className="bg-blue-50 text-blue-600 py-1 px-3 rounded-lg text-xs font-semibold border border-blue-100">
            Region: {primaryRegion}
          </span>
        </div>
        <p className="text-xs text-slate-400">Trends across weather parameters.</p>
      </div>
      
      <div className="h-[350px] w-full">
        {chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
            Insufficient data points to plot timeline.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickMargin={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}`} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '13px' }} itemStyle={{ fontWeight: 600 }} />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} iconType="circle" />
              
              <Line type="monotone" dataKey="tmax" name="Max Temp" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} connectNulls />
              <Line type="monotone" dataKey="tmean" name="Mean Temp" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2 }} connectNulls />
              <Line type="monotone" dataKey="tmin" name="Min Temp" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2 }} connectNulls />
              <Line type="monotone" dataKey="rain" name="Rainfall" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2 }} connectNulls />
              <Line type="monotone" dataKey="sun" name="Sunshine" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
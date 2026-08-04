import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TimelineChartProps {
  data: any[];
  selectedRegions: string[];
  timeRange: string;
  selectedCondition: string[];
  hasDataLoaded: boolean;
}

// Fixed color maps for conditions so they always look consistent
const CONDITION_CONFIG: Record<string, { name: string; color: string }> = {
  tmax: { name: 'Max Temp', color: '#ef4444' },
  tmean: { name: 'Mean Temp', color: '#8b5cf6' },
  tmin: { name: 'Min Temp', color: '#3b82f6' },
  rain: { name: 'Rainfall', color: '#10b981' },
  sun: { name: 'Sunshine', color: '#f59e0b' }
};

// A distinct 20-color palette for when multiple regions are selected
const REGION_COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', 
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
  '#dc2626', '#2563eb', '#059669', '#d97706', '#7c3aed',
  '#db2777', '#0d9488', '#ea580c', '#0891b2', '#65a30d'
];

export const TimelineChart: React.FC<TimelineChartProps> = ({ data, selectedRegions, timeRange, selectedCondition, hasDataLoaded }) => {
  
  if (!hasDataLoaded || !data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm mt-6 border border-slate-200 min-h-[400px] flex items-center justify-center">
        <p className="text-slate-400 font-medium">Load data to view timeline trends.</p>
      </div>
    );
  }

  const isMultiRegion = selectedRegions.length > 1;
  const primaryRegion = selectedRegions[0] || 'UK';
  
  // In multi-region mode, we lock onto the first selected condition
  const activeMetric = selectedCondition[0] || 'tmax'; 
  
  // In single-region mode, we plot all selected conditions (fallback to all 5 if empty)
  const activeConditions = selectedCondition.length > 0 ? selectedCondition : ['tmax', 'tmean', 'tmin', 'rain', 'sun'];

  // 1. Determine X-Axis periods dynamically based on duration dropdown
  const getXAxisItems = () => {
    if (['1y', '5y', '10y', 'all'].includes(timeRange)) {
        // Extract exact years from data to prevent blank future years
        return Array.from(new Set(data.filter(d => d.period === 'Ann').map(d => d.year))).sort((a, b) => a - b);
    }
    if (timeRange === 'monthly') return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (timeRange === 'seasonal') return ['Win', 'Spr', 'Sum', 'Aut'];
    return [];
  };

  const xAxisItems = getXAxisItems();

  // 2. THE OPTIMIZATION: Create Hash Map for instant charting (O(1) Time Complexity)
  const dataMap = new Map();
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    dataMap.set(`${d.year}-${d.region}-${d.period}`, d);
  }

  // 3. Pivot the Data for Recharts using the Map
  const chartData = xAxisItems.map(item => {
    const row: any = { name: item.toString() };
    
    if (isMultiRegion) {
      // MULTI-REGION: Create a data point for every selected region
      selectedRegions.forEach(region => {
        const targetYear = ['1y', '5y', '10y', 'all'].includes(timeRange) ? item : (data[0]?.year || new Date().getFullYear());
        const targetPeriod = ['1y', '5y', '10y', 'all'].includes(timeRange) ? 'Ann' : item;
        
        // Instant map lookup instead of slow Array.find()
        const record = dataMap.get(`${targetYear}-${region}-${targetPeriod}`);
        row[region] = record && record[activeMetric] !== null && record[activeMetric] !== undefined ? record[activeMetric] : null;
      });
    } else {
      // SINGLE-REGION: Create a data point for every selected condition
      activeConditions.forEach(cond => {
        const targetYear = ['1y', '5y', '10y', 'all'].includes(timeRange) ? item : (data[0]?.year || new Date().getFullYear());
        const targetPeriod = ['1y', '5y', '10y', 'all'].includes(timeRange) ? 'Ann' : item;
        
        // Instant map lookup instead of slow Array.find()
        const record = dataMap.get(`${targetYear}-${primaryRegion}-${targetPeriod}`);
        row[cond] = record && record[cond] !== null && record[cond] !== undefined ? record[cond] : null;
      });
    }
    return row;
  });

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm mt-6 border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Timeline Overview</h3>
          
          {/* Dynamic Header Badge based on Pivot Mode */}
          {isMultiRegion ? (
            <span className="bg-purple-50 text-purple-600 py-1 px-3 rounded-lg text-xs font-semibold border border-purple-100">
              Comparing: {CONDITION_CONFIG[activeMetric]?.name || activeMetric}
            </span>
          ) : (
            <span className="bg-blue-50 text-blue-600 py-1 px-3 rounded-lg text-xs font-semibold border border-blue-100">
              Region: {primaryRegion}
            </span>
          )}
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
              
              {/* Dynamic Lines based on Pivot Mode */}
              {isMultiRegion ? (
                selectedRegions.map((region, idx) => (
                  <Line 
                    key={region}
                    type="monotone" 
                    dataKey={region} 
                    name={region} 
                    stroke={REGION_COLORS[idx % REGION_COLORS.length]} 
                    strokeWidth={2.5} 
                    dot={{ r: 4, strokeWidth: 2 }} 
                    activeDot={{ r: 6 }} 
                    connectNulls 
                  />
                ))
              ) : (
                activeConditions.map((cond) => {
                  const config = CONDITION_CONFIG[cond];
                  return (
                    <Line 
                      key={cond}
                      type="monotone" 
                      dataKey={cond} 
                      name={config?.name || cond} 
                      stroke={config?.color || '#000'} 
                      strokeWidth={2.5} 
                      dot={{ r: 4, strokeWidth: 2 }} 
                      activeDot={{ r: 6 }} 
                      connectNulls 
                    />
                  );
                })
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
import React from 'react';

interface HeatmapProps {
  data: any[];
  selectedRegions: string[];
  timeRange: string;
  selectedCondition: string[];
  hasDataLoaded: boolean;
}

const formatCondition = (c: string) => ({
  tmin: 'Min Temp', tmax: 'Max Temp', tmean: 'Mean Temp', sun: 'Sunshine', rain: 'Rainfall'
}[c] || c);

const getColorClass = (type: string, value: number | string | null) => {
  if (value === null || value === '-' || value === undefined) return 'bg-slate-50 text-slate-300';
  const val = Number(value);
  
  if (type.includes('Temp')) {
    if (val <= 5) return 'bg-[#e9d5ff] text-[#6b21a8]'; 
    if (val <= 10) return 'bg-[#d8b4fe] text-[#581c87]'; 
    if (val <= 15) return 'bg-[#c084fc] text-white'; 
    if (val <= 20) return 'bg-[#a855f7] text-white'; 
    if (val <= 25) return 'bg-[#9333ea] text-white'; 
    return 'bg-[#7e22ce] text-white'; 
  }
  if (type === 'Sunshine') {
    if (val <= 50) return 'bg-[#fef08a] text-[#854d0e]'; 
    if (val <= 100) return 'bg-[#fde047] text-[#713f12]'; 
    if (val <= 150) return 'bg-[#facc15] text-white'; 
    if (val <= 200) return 'bg-[#eab308] text-white'; 
    return 'bg-[#ca8a04] text-white'; 
  }
  if (type === 'Rainfall') {
    if (val <= 40) return 'bg-[#bfdbfe] text-[#1e3a8a]'; 
    if (val <= 80) return 'bg-[#93c5fd] text-[#1e3a8a]'; 
    if (val <= 120) return 'bg-[#60a5fa] text-white'; 
    if (val <= 160) return 'bg-[#3b82f6] text-white'; 
    return 'bg-[#2563eb] text-white'; 
  }
  return 'bg-slate-100 text-slate-700';
};

export const Heatmap: React.FC<HeatmapProps> = ({ data, selectedRegions, timeRange, selectedCondition, hasDataLoaded }) => {
  
  if (!hasDataLoaded || !data || data.length === 0) {
    return null;
  }

  const isMultiRegion = selectedRegions.length > 1;
  const primaryRegion = selectedRegions[0] || 'UK';
  const activeMetric = selectedCondition[0] || 'tmax';
  const activeMetricName = formatCondition(activeMetric);
  
  const periods = timeRange === 'seasonal' 
    ? ['Win', 'Spr', 'Sum', 'Aut', 'Ann'] 
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // FIXED LOGIC: Extract the exact year from the payload without checking the current date
  const displayYear = Math.max(...data.map(d => d.year));
  const currentYearData = data.filter(d => d.year === displayYear);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm mt-6 border border-slate-200 overflow-x-auto">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Distribution Heatmap</h3>
        <p className="text-xs text-slate-500 mt-1">
          {isMultiRegion ? (
            <>Comparing <strong className="text-blue-600">{activeMetricName.toUpperCase()}</strong> across multiple regions for <strong>{displayYear}</strong>.</>
          ) : (
            <>Comparing multiple conditions for <strong className="text-blue-600">{primaryRegion}</strong> in <strong>{displayYear}</strong>.</>
          )}
        </p>
      </div>

      <div className="min-w-[800px]">
        {/* Header Row */}
        <div className="flex mb-2">
          <div className="w-32 flex-shrink-0"></div>
          {periods.map(period => (
            <div key={period} className="flex-1 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              {period}
            </div>
          ))}
        </div>

        {isMultiRegion ? (
          // MULTI-REGION PIVOT
          selectedRegions.map(region => (
            <div key={region} className="flex mb-2 items-center">
              <div className="w-32 flex-shrink-0 text-sm font-medium text-slate-600 truncate pr-2" title={region}>
                {region}
              </div>
              {periods.map(period => {
                const record = currentYearData.find(d => d.period === period && d.region === region);
                const value = record && record[activeMetric] !== null && record[activeMetric] !== undefined ? record[activeMetric] : '-';
                const colorClass = getColorClass(activeMetricName, value);
                
                return (
                  <div key={`${region}-${period}`} className="flex-1 px-1">
                    <div className={`h-10 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${colorClass}`}>
                      {value}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          // SINGLE-REGION PIVOT
          selectedCondition.map(cond => {
            const condName = formatCondition(cond);
            return (
              <div key={cond} className="flex mb-2 items-center">
                <div className="w-32 flex-shrink-0 text-sm font-medium text-slate-600 truncate pr-2" title={condName}>
                  {condName}
                </div>
                {periods.map(period => {
                  const record = currentYearData.find(d => d.period === period && d.region === primaryRegion);
                  const value = record && record[cond] !== null && record[cond] !== undefined ? record[cond] : '-';
                  const colorClass = getColorClass(condName, value);
                  
                  return (
                    <div key={`${cond}-${period}`} className="flex-1 px-1">
                      <div className={`h-10 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${colorClass}`}>
                        {value}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>

      {/* Threshold Legend */}
      <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-400 w-32">TEMPERATURE (°C):</span>
          <div className="flex gap-2 text-xs font-medium">
            <span className="bg-[#e9d5ff] text-[#6b21a8] px-3 py-1 rounded-full">≤ 5</span>
            <span className="bg-[#d8b4fe] text-[#581c87] px-3 py-1 rounded-full">6-10</span>
            <span className="bg-[#c084fc] text-white px-3 py-1 rounded-full">11-15</span>
            <span className="bg-[#a855f7] text-white px-3 py-1 rounded-full">16-20</span>
            <span className="bg-[#9333ea] text-white px-3 py-1 rounded-full">21-25</span>
            <span className="bg-[#7e22ce] text-white px-3 py-1 rounded-full">≥ 26</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-400 w-32">SUNSHINE (HRS):</span>
          <div className="flex gap-2 text-xs font-medium">
            <span className="bg-[#fef08a] text-[#854d0e] px-3 py-1 rounded-full">≤ 50</span>
            <span className="bg-[#fde047] text-[#713f12] px-3 py-1 rounded-full">51-100</span>
            <span className="bg-[#facc15] text-white px-3 py-1 rounded-full">101-150</span>
            <span className="bg-[#eab308] text-white px-3 py-1 rounded-full">151-200</span>
            <span className="bg-[#ca8a04] text-white px-3 py-1 rounded-full">≥ 201</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-400 w-32">RAINFALL (MM):</span>
          <div className="flex gap-2 text-xs font-medium">
            <span className="bg-[#bfdbfe] text-[#1e3a8a] px-3 py-1 rounded-full">≤ 40</span>
            <span className="bg-[#93c5fd] text-[#1e3a8a] px-3 py-1 rounded-full">41-80</span>
            <span className="bg-[#60a5fa] text-white px-3 py-1 rounded-full">81-120</span>
            <span className="bg-[#3b82f6] text-white px-3 py-1 rounded-full">121-160</span>
            <span className="bg-[#2563eb] text-white px-3 py-1 rounded-full">≥ 161</span>
          </div>
        </div>
      </div>
    </div>
  );
};
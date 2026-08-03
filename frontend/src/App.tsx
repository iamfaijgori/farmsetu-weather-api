import { useState } from 'react';
import { Header } from './components/Header';
import { StatCards } from './components/StatCards';
import { TimelineChart } from './components/TimelineChart';

export default function App() {
  // 1. DRAFT STATE (Controlled by Header dropdowns)
  const [draftRegions, setDraftRegions] = useState<string[]>([]);
  const [draftTime, setDraftTime] = useState<string>('');
  const [draftCondition, setDraftCondition] = useState<string>('all');

  // 2. ACTIVE STATE (Passed to Cards & Chart ONLY after clicking Load Data)
  const [activeRegions, setActiveRegions] = useState<string[]>([]);
  const [activeTime, setActiveTime] = useState<string>('');
  const [activeCondition, setActiveCondition] = useState<string>('all');
  
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadData = () => {
    setIsLoading(true);
    
    // Push draft state to active state
    setActiveRegions(draftRegions);
    setActiveTime(draftTime);
    setActiveCondition(draftCondition);

    // Simulate API fetch delay
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  const handleClear = () => {
    // 1. Wipe the dropdown selections (Draft State)
    setDraftRegions([]);
    setDraftTime('');
    setDraftCondition('all');
    
    // 2. Wipe the Dashboard Canvas (Active State)
    setActiveRegions([]);
    setActiveTime('');
    setActiveCondition('all');
  };

  // Determine if data has been loaded yet
  const hasDataLoaded = activeRegions.length > 0 && activeTime !== '';

  // KPI Data (0 if not loaded, mock data if loaded)
  const kpiData = hasDataLoaded 
    ? { minTemp: -1.2, maxTemp: 34.0, meanTemp: 14.2, sunshineHours: 6.4, totalRainfall: 845 }
    : { minTemp: 0, maxTemp: 0, meanTemp: 0, sunshineHours: 0, totalRainfall: 0 };

  return (
    <div className="w-full min-h-screen bg-[#f3f6f9] text-slate-800 p-4 sm:p-6 lg:p-8">
      <Header
        selectedRegions={draftRegions}
        onRegionChange={setDraftRegions}
        selectedTimeRange={draftTime}
        onTimeRangeChange={setDraftTime}
        selectedCondition={draftCondition}
        onConditionChange={setDraftCondition}
        onLoadData={handleLoadData}
        onClear={handleClear}
      />

      <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
        <StatCards data={kpiData} />

        <TimelineChart
          selectedRegions={activeRegions}
          timeRange={activeTime}
          selectedCondition={activeCondition}
          hasDataLoaded={hasDataLoaded}
        />
      </div>

      <div className="w-full border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-400 font-medium mt-6">
        Next Section: Temperature Distribution Heatmap
      </div>
    </div>
  );
}
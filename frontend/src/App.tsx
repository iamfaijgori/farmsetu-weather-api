import { useState } from 'react';
import { Header } from './components/Header';
import { StatCards } from './components/StatCards';
import { TimelineChart } from './components/TimelineChart';
import { Heatmap } from './components/Heatmap';

export default function App() {
  const [draftRegions, setDraftRegions] = useState<string[]>(['UK']);
  const [draftTime, setDraftTime] = useState<string>('');
  
  // 1. Condition states are now arrays! Default is empty.
  const [draftCondition, setDraftCondition] = useState<string[]>([]);
  const [activeRegions, setActiveRegions] = useState<string[]>([]);
  const [activeTime, setActiveTime] = useState<string>('');
  const [activeCondition, setActiveCondition] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadData = () => {
    setIsLoading(true);
    setActiveRegions(draftRegions);
    setActiveTime(draftTime);
    setActiveCondition(draftCondition);
    setTimeout(() => setIsLoading(false), 600);
  };

  const handleClear = () => {
    setDraftRegions([]);
    setDraftTime('');
    setDraftCondition([]); // Reset to empty array
    setActiveRegions([]);
    setActiveTime('');
    setActiveCondition([]);
  };

  // Ensure ALL THREE fields are populated before rendering data
  const hasDataLoaded = activeRegions.length > 0 && activeTime !== '' && activeCondition.length > 0;

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

        <Heatmap 
          selectedRegions={activeRegions}
          timeRange={activeTime}
          selectedCondition={activeCondition}
          hasDataLoaded={hasDataLoaded}
        />
      </div>
    </div>
  );
}
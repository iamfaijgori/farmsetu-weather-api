import { useState } from 'react';
import { Header } from './components/Header';
import { StatCards } from './components/StatCards';
import { TimelineChart } from './components/TimelineChart';
import { Heatmap } from './components/Heatmap';
import { DataTable } from './components/DataTable';
import { fetchWeatherData } from './services/weatherService';
export default function App() {
  const [draftRegions, setDraftRegions] = useState<string[]>(['UK']);
  const [draftTime, setDraftTime] = useState<string>('');
  const [draftYear, setDraftYear] = useState<string>('2026'); // Updated to 2026
  const [draftCondition, setDraftCondition] = useState<string[]>([]);
  const [backendData, setBackendData] = useState<any[]>([]);
  const [activeRegions, setActiveRegions] = useState<string[]>([]);
  const [activeTime, setActiveTime] = useState<string>('');
  const [activeYear, setActiveYear] = useState<string>('2026'); // Updated to 2026
  const [activeCondition, setActiveCondition] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadData = async () => {
  setIsLoading(true);
  
  setActiveRegions(draftRegions);
  setActiveTime(draftTime);
  setActiveYear(draftYear);
  setActiveCondition(draftCondition);

  try {
    // Fetch the real data from Django
    const data = await fetchWeatherData(draftRegions, draftTime, draftYear);
    setBackendData(data);
  } catch (error) {
    console.error("Failed to load data:", error);
    setBackendData([]);
  } finally {
    setIsLoading(false);
  }
  };

  const handleClear = () => {
    setDraftRegions([]);
    setDraftTime('');
    setDraftYear('2026'); // Updated to 2026
    setDraftCondition([]);
    setActiveRegions([]);
    setActiveTime('');
    setActiveYear('2026'); // Updated to 2026
    setActiveCondition([]);
  };

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
        selectedYear={draftYear}
        onYearChange={setDraftYear}
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

        <DataTable 
          data={backendData} 
          selectedRegions={activeRegions}
          timeRange={activeTime}
          selectedYear={activeYear}
          selectedCondition={activeCondition}
          hasDataLoaded={hasDataLoaded}
        />
      </div>
    </div>
  );
}
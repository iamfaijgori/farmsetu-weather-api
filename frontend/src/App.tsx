import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatCards } from './components/StatCards';
import { TimelineChart } from './components/TimelineChart';
import { Heatmap } from './components/Heatmap';
import { DataTable } from './components/DataTable';
import { fetchWeatherData } from './services/weatherService';

export default function App() {
  // 1. FIXED: Set the Draft States to your desired defaults
  const [draftRegions, setDraftRegions] = useState<string[]>(['UK']);
  const [draftTime, setDraftTime] = useState<string>('monthly');
  const [draftYear, setDraftYear] = useState<string>('2026');
  const [draftCondition, setDraftCondition] = useState<string[]>(['tmin']);
  
  const [backendData, setBackendData] = useState<any[]>([]);
  
  // 2. FIXED: Set the Active States to match the defaults so the UI knows what to render immediately
  const [activeRegions, setActiveRegions] = useState<string[]>(['UK']);
  const [activeTime, setActiveTime] = useState<string>('monthly');
  const [activeYear, setActiveYear] = useState<string>('2026');
  const [activeCondition, setActiveCondition] = useState<string[]>(['tmin']);
  
  const [isLoading, setIsLoading] = useState(false);

  // 3. FIXED: Add a useEffect hook to automatically load the default data on first page load
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchWeatherData(['UK'], 'monthly', '2026');
        setBackendData(data);
      } catch (error) {
        console.error("Failed to load initial data:", error);
        setBackendData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []); // The empty array ensures this only runs once when the app starts

  const handleLoadData = async () => {
    setIsLoading(true);
    
    setActiveRegions(draftRegions);
    setActiveTime(draftTime);
    setActiveYear(draftYear);
    setActiveCondition(draftCondition);

    try {
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
    setDraftYear('2026');
    setDraftCondition([]);
    setActiveRegions([]);
    setActiveTime('');
    setActiveYear('2026');
    setActiveCondition([]);
    setBackendData([]); 
  };

  const hasDataLoaded = activeRegions.length > 0 && activeTime !== '' && activeCondition.length > 0;

  const calculateKPIs = (data: any[]) => {
    if (!data || data.length === 0) return { minTemp: 0, maxTemp: 0, meanTemp: 0, sunshineHours: 0, totalRainfall: 0 };

    const validTmin = data.filter(d => d.tmin !== null).map(d => d.tmin);
    const validTmax = data.filter(d => d.tmax !== null).map(d => d.tmax);
    const validTmean = data.filter(d => d.tmean !== null).map(d => d.tmean);
    const validSun = data.filter(d => d.sun !== null).map(d => d.sun);
    const validRain = data.filter(d => d.rain !== null).map(d => d.rain);

    return {
      minTemp: validTmin.length ? Math.min(...validTmin) : 0,
      maxTemp: validTmax.length ? Math.max(...validTmax) : 0,
      meanTemp: validTmean.length ? Number((validTmean.reduce((a, b) => a + b, 0) / validTmean.length).toFixed(1)) : 0,
      sunshineHours: validSun.length ? Number(validSun.reduce((a, b) => a + b, 0).toFixed(1)) : 0,
      totalRainfall: validRain.length ? Number(validRain.reduce((a, b) => a + b, 0).toFixed(1)) : 0,
    };
  };

  const kpiData = hasDataLoaded 
    ? calculateKPIs(backendData)
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
          data={backendData} 
          selectedRegions={activeRegions}
          timeRange={activeTime}
          selectedCondition={activeCondition}
          hasDataLoaded={hasDataLoaded}
        />

        <Heatmap 
          data={backendData} 
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
import React, { useState, useRef, useEffect } from 'react';

// Props definition to allow passing backend options dynamically
interface HeaderProps {
  availableRegions?: string[];
  selectedRegions?: string[];
  onRegionChange?: (regions: string[]) => void;
  selectedTimeRange?: string;
  onTimeRangeChange?: (range: string) => void;
  selectedCondition?: string;
  onConditionChange?: (condition: string) => void;
}

const DEFAULT_REGIONS = [
  'England', 'Wales', 'Scotland', 'Northern Ireland',
  'England N', 'England S', 'Scotland N', 'Scotland S',
  'East Anglia', 'UK'
];

const TIME_RANGES = [
  { label: 'Last 1 month', value: '1m' },
  { label: 'Last 3 months', value: '3m' },
  { label: 'Last 6 months', value: '6m' },
  { label: 'Last 1 year', value: '1y' },
  { label: 'Last 2 years', value: '2y' },
  { label: 'Last 3 years', value: '3y' },
  { label: 'Last 4 years', value: '4y' },
  { label: 'Last 5 years', value: '5y' },
  { label: 'More than 5 years', value: 'all' },
];

const CONDITIONS = [
  { label: 'All Conditions', value: 'all' },
  { label: 'Min Temperature', value: 'tmin' },
  { label: 'Max Temperature', value: 'tmax' },
  { label: 'Mean Temperature', value: 'tmean' },
  { label: 'Sunshine Hours', value: 'sun' },
  { label: 'Total Rainfall', value: 'rain' },
];

export const Header: React.FC<HeaderProps> = ({
  availableRegions = DEFAULT_REGIONS,
  selectedRegions = DEFAULT_REGIONS,
  onRegionChange,
  selectedTimeRange = '6m',
  onTimeRangeChange,
  selectedCondition = 'all',
  onConditionChange,
}) => {
  // Dropdown open states
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [isConditionOpen, setIsConditionOpen] = useState(false);

  // Internal state tracking
  const [activeRegions, setActiveRegions] = useState<string[]>(selectedRegions);
  const [activeTime, setActiveTime] = useState<string>(selectedTimeRange);
  const [activeCondition, setActiveCondition] = useState<string>(selectedCondition);

  // Close dropdowns when clicking outside
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsRegionOpen(false);
        setIsTimeOpen(false);
        setIsConditionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Multi-Select Region Toggle
  const toggleRegion = (region: string) => {
    let updated: string[];
    if (activeRegions.includes(region)) {
      updated = activeRegions.filter((r) => r !== region);
    } else {
      updated = [...activeRegions, region];
    }
    setActiveRegions(updated);
    if (onRegionChange) onRegionChange(updated);
  };

  const toggleSelectAllRegions = () => {
    const updated = activeRegions.length === availableRegions.length ? [] : [...availableRegions];
    setActiveRegions(updated);
    if (onRegionChange) onRegionChange(updated);
  };

  // Region button text formatter
  const getRegionButtonLabel = () => {
    if (activeRegions.length === 0) return 'No Regions';
    if (activeRegions.length === availableRegions.length) return 'All Regions';
    if (activeRegions.length === 1) return activeRegions[0];
    return `${activeRegions.length} Regions`;
  };

  // Time range label lookup
  const currentRangeObj = TIME_RANGES.find((t) => t.value === activeTime) || TIME_RANGES[2];

  // Condition label lookup
  const currentConditionObj = CONDITIONS.find((c) => c.value === activeCondition) || CONDITIONS[0];

  return (
    <header
      ref={headerRef}
      className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4"
    >
      {/* Brand Title */}
      <h1 className="text-[20px] font-bold text-[#1e293b] tracking-tight whitespace-nowrap">
        Weather Monitoring System
      </h1>

      {/* Control Dropdowns */}
      <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto">
        
        {/* 1. All Regions Multi-Select Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsRegionOpen(!isRegionOpen);
              setIsTimeOpen(false);
              setIsConditionOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-medium text-slate-700 shadow-xs transition-colors"
          >
            <span>{getRegionButtonLabel()}</span>
            <svg
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isRegionOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isRegionOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 max-h-64 overflow-y-auto">
              <label className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-slate-50 rounded-lg cursor-pointer border-b border-slate-100 mb-1">
                <input
                  type="checkbox"
                  checked={activeRegions.length === availableRegions.length}
                  onChange={toggleSelectAllRegions}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Select All</span>
              </label>
              {availableRegions.map((region) => (
                <label
                  key={region}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={activeRegions.includes(region)}
                    onChange={() => toggleRegion(region)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>{region}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 2. Single-Select Time Range Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsTimeOpen(!isTimeOpen);
              setIsRegionOpen(false);
              setIsConditionOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-medium text-slate-700 shadow-xs transition-colors"
          >
            <span>{currentRangeObj.label}</span>
            <svg
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isTimeOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isTimeOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1">
              {TIME_RANGES.map((range) => (
                <button
                  key={range.value}
                  onClick={() => {
                    setActiveTime(range.value);
                    if (onTimeRangeChange) onTimeRangeChange(range.value);
                    setIsTimeOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                    activeTime === range.value
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Blue Conditions Button with Single Selection */}
        <div className="relative">
          <button
            onClick={() => {
              setIsConditionOpen(!isConditionOpen);
              setIsRegionOpen(false);
              setIsTimeOpen(false);
            }}
            className="flex items-center gap-2 px-5 py-2 bg-[#2b82fb] hover:bg-blue-600 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
          >
            {/* Filter Slider SVG Icon matching Figma */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>{currentConditionObj.value === 'all' ? 'Conditions' : currentConditionObj.label}</span>
          </button>

          {isConditionOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1">
              {CONDITIONS.map((cond) => (
                <button
                  key={cond.value}
                  onClick={() => {
                    setActiveCondition(cond.value);
                    if (onConditionChange) onConditionChange(cond.value);
                    setIsConditionOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                    activeCondition === cond.value
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cond.label}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
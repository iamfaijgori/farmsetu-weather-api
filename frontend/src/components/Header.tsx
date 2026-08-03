import React, { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  availableRegions?: string[];
  selectedRegions?: string[];
  onRegionChange?: (regions: string[]) => void;
  selectedTimeRange?: string;
  onTimeRangeChange?: (range: string) => void;
  selectedYear?: string;
  onYearChange?: (year: string) => void;
  selectedCondition?: string[];
  onConditionChange?: (conditions: string[]) => void;
  onLoadData?: () => void;
  onClear?: () => void;
}

const DEFAULT_REGIONS = ['UK', 'England', 'Wales', 'Scotland', 'Northern Ireland', 'England and Wales', 'England N', 'England S', 'Scotland N', 'Scotland E', 'Scotland W', 'England E and NE', 'England NW and N Wales', 'Midlands', 'East Anglia', 'England SW and S Wales', 'England SE and Central S'];

const TIME_RANGES = [
  { label: 'Select Duration', value: '' },
  { label: 'Monthly View', value: 'monthly' },
  { label: 'Seasonal View', value: 'seasonal' },
  { label: 'Previous Calendar Year', value: '1y' },
  { label: 'Last 5 Calendar Years', value: '5y' },
  { label: 'Last 10 Calendar Years', value: '10y' },
  { label: 'All Historic Years', value: 'all' },
];

const CONDITIONS = [
  { label: 'Min Temperature', value: 'tmin' },
  { label: 'Max Temperature', value: 'tmax' },
  { label: 'Mean Temperature', value: 'tmean' },
  { label: 'Sunshine Hours', value: 'sun' },
  { label: 'Total Rainfall', value: 'rain' },
];

// Generate years from 2026 down to 1884
const YEARS = Array.from({ length: 2026 - 1884 + 1 }, (_, i) => (2026 - i).toString());

export const Header: React.FC<HeaderProps> = ({
  availableRegions = DEFAULT_REGIONS,
  selectedRegions = ['UK'],
  onRegionChange,
  selectedTimeRange = '',
  onTimeRangeChange,
  selectedYear = '2026', // Updated default to 2026
  onYearChange,
  selectedCondition = [],
  onConditionChange,
  onLoadData,
  onClear,
}) => {
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isConditionOpen, setIsConditionOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsRegionOpen(false); setIsTimeOpen(false); setIsYearOpen(false); setIsConditionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleRegion = (region: string) => {
    let updated = selectedRegions.includes(region) ? selectedRegions.filter(r => r !== region) : [...selectedRegions, region];
    if (updated.length > 1 && selectedCondition.length > 1 && onConditionChange) onConditionChange([selectedCondition[0]]);
    if (onRegionChange) onRegionChange(updated);
  };

  const toggleCondition = (condValue: string) => {
    if (selectedRegions.length > 1 && onConditionChange) {
      onConditionChange([condValue]);
    } else if (onConditionChange) {
      let updated = selectedCondition.includes(condValue) ? selectedCondition.filter(c => c !== condValue) : [...selectedCondition, condValue];
      onConditionChange(updated);
    }
  };

  const currentRangeObj = TIME_RANGES.find(t => t.value === selectedTimeRange) || TIME_RANGES[0];
  const requiresYear = selectedTimeRange === 'monthly' || selectedTimeRange === 'seasonal';

  return (
    <header 
      ref={headerRef} 
      className="w-full bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm px-6 py-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-50"
    >
      <h1 className="text-[20px] font-bold text-[#1e293b] tracking-tight whitespace-nowrap">Weather Monitoring System</h1>

      <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto">
        
        {/* Regions Dropdown */}
        <div className="relative">
          <button onClick={() => { setIsRegionOpen(!isRegionOpen); setIsTimeOpen(false); setIsYearOpen(false); setIsConditionOpen(false); }} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-medium text-slate-700 shadow-xs transition-colors">
            <span className={selectedRegions.length === 0 ? 'text-slate-400' : 'text-slate-700'}>{selectedRegions.length === 0 ? 'Select Region' : selectedRegions.length === 1 ? selectedRegions[0] : `${selectedRegions.length} Regions`}</span>
            <svg className={`w-4 h-4 text-slate-400 transition-transform ${isRegionOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {isRegionOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 max-h-64 overflow-y-auto">
              {availableRegions.map((region) => (
                <label key={region} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer">
                  <input type="checkbox" checked={selectedRegions.includes(region)} onChange={() => toggleRegion(region)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                  <span>{region}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Time Dropdown */}
        <div className="relative">
          <button onClick={() => { setIsTimeOpen(!isTimeOpen); setIsRegionOpen(false); setIsYearOpen(false); setIsConditionOpen(false); }} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-medium text-slate-700 shadow-xs transition-colors">
            <span className={selectedTimeRange === '' ? 'text-slate-400' : 'text-slate-700'}>{currentRangeObj.label}</span>
            <svg className={`w-4 h-4 text-slate-400 transition-transform ${isTimeOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {isTimeOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1 max-h-60 overflow-y-auto">
              {TIME_RANGES.map((range) => (
                <button key={range.value} onClick={() => { if (onTimeRangeChange) onTimeRangeChange(range.value); setIsTimeOpen(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${selectedTimeRange === range.value ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}>{range.label}</button>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Year Dropdown */}
        {requiresYear && (
          <div className="relative">
            <button onClick={() => { setIsYearOpen(!isYearOpen); setIsRegionOpen(false); setIsTimeOpen(false); setIsConditionOpen(false); }} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-medium text-slate-700 shadow-xs transition-colors">
              <span>{selectedYear}</span>
              <svg className={`w-4 h-4 text-slate-400 transition-transform ${isYearOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isYearOpen && (
              <div className="absolute right-0 mt-2 w-28 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1 max-h-60 overflow-y-auto">
                {YEARS.map((yr) => (
                  <button key={yr} onClick={() => { if (onYearChange) onYearChange(yr); setIsYearOpen(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${selectedYear === yr ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}>{yr}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Condition Checkbox Dropdown */}
        <div className="relative">
          <button onClick={() => { setIsConditionOpen(!isConditionOpen); setIsRegionOpen(false); setIsTimeOpen(false); setIsYearOpen(false); }} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-medium shadow-xs transition-colors">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            <span className={selectedCondition.length === 0 ? 'text-slate-400' : 'text-slate-700'}>{selectedCondition.length === 0 ? 'Select Condition' : selectedCondition.length === 1 ? CONDITIONS.find(c => c.value === selectedCondition[0])?.label : `${selectedCondition.length} Conditions`}</span>
          </button>
          {isConditionOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 max-h-64 overflow-y-auto">
              {CONDITIONS.map((cond) => (
                <label key={cond.value} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer">
                  <input type="checkbox" checked={selectedCondition.includes(cond.value)} onChange={() => toggleCondition(cond.value)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                  <span>{cond.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-2">
          <button onClick={onClear} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-colors">Clear</button>
          <button 
            onClick={onLoadData}
            disabled={selectedTimeRange === '' || selectedRegions.length === 0 || selectedCondition.length === 0}
            className="flex items-center gap-2 px-5 py-2 bg-[#2b82fb] hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
          >
            Load Data
          </button>
        </div>
      </div>
    </header>
  );
};
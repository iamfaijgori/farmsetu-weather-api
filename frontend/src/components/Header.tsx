import React, { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  availableRegions?: string[];
  selectedRegions?: string[];
  onRegionChange?: (regions: string[]) => void;
  selectedTimeRange?: string;
  onTimeRangeChange?: (range: string) => void;
  selectedCondition?: string[]; // Now an array
  onConditionChange?: (conditions: string[]) => void;
  onLoadData?: () => void;
  onClear?: () => void;
}

const DEFAULT_REGIONS = ['UK', 'England', 'Wales', 'Scotland', 'Northern Ireland', 'England and Wales', 'England N', 'England S', 'Scotland N', 'Scotland E', 'Scotland W', 'England E and NE', 'England NW and N Wales', 'Midlands', 'East Anglia', 'England SW and S Wales', 'England SE and Central S'];

const TIME_RANGES = [
  { label: 'Select Duration', value: '' },
  { label: 'Monthly View (Jan - Dec)', value: 'monthly' },
  { label: 'Seasonal View (Win, Spr, Sum, Aut, Ann)', value: 'seasonal' },
  { label: 'Yearly: Last 1 Year', value: '1y' },
  { label: 'Yearly: Last 5 Years', value: '5y' },
  { label: 'Yearly: Last 10 Years', value: '10y' },
  { label: 'All Historic Years', value: 'all' },
];

const CONDITIONS = [
  { label: 'Min Temperature', value: 'tmin' },
  { label: 'Max Temperature', value: 'tmax' },
  { label: 'Mean Temperature', value: 'tmean' },
  { label: 'Sunshine Hours', value: 'sun' },
  { label: 'Total Rainfall', value: 'rain' },
];

export const Header: React.FC<HeaderProps> = ({
  availableRegions = DEFAULT_REGIONS,
  selectedRegions = ['UK'],
  onRegionChange,
  selectedTimeRange = '',
  onTimeRangeChange,
  selectedCondition = [],
  onConditionChange,
  onLoadData,
  onClear,
}) => {
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [isConditionOpen, setIsConditionOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsRegionOpen(false); setIsTimeOpen(false); setIsConditionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleRegion = (region: string) => {
    let updated = selectedRegions.includes(region) ? selectedRegions.filter(r => r !== region) : [...selectedRegions, region];
    
    // RESTRICTION: If jumping from 1 to multiple regions, force condition down to 1 item
    if (updated.length > 1 && selectedCondition.length > 1) {
      if (onConditionChange) onConditionChange([selectedCondition[0]]);
    }
    if (onRegionChange) onRegionChange(updated);
  };

  const toggleCondition = (condValue: string) => {
    if (selectedRegions.length > 1) {
      // If multiple regions active, force SINGLE condition selection
      if (onConditionChange) onConditionChange([condValue]);
    } else {
      // If single region active, allow MULTIPLE condition selections
      let updated = selectedCondition.includes(condValue) ? selectedCondition.filter(c => c !== condValue) : [...selectedCondition, condValue];
      if (onConditionChange) onConditionChange(updated);
    }
  };

  const getRegionLabel = () => {
    if (selectedRegions.length === 0) return 'Select Region';
    if (selectedRegions.length === 1) return selectedRegions[0];
    return `${selectedRegions.length} Regions`;
  };

  const getConditionLabel = () => {
    if (selectedCondition.length === 0) return 'Select Condition';
    if (selectedCondition.length === CONDITIONS.length) return 'All Conditions';
    if (selectedCondition.length === 1) return CONDITIONS.find(c => c.value === selectedCondition[0])?.label || 'Condition';
    return `${selectedCondition.length} Conditions`;
  };

  const currentRangeObj = TIME_RANGES.find(t => t.value === selectedTimeRange) || TIME_RANGES[0];

  return (
    <header ref={headerRef} className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <h1 className="text-[20px] font-bold text-[#1e293b] tracking-tight whitespace-nowrap">Weather Monitoring System</h1>

      <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto">
        
        {/* Regions Dropdown */}
        <div className="relative">
          <button onClick={() => { setIsRegionOpen(!isRegionOpen); setIsTimeOpen(false); setIsConditionOpen(false); }} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-medium text-slate-700 shadow-xs transition-colors">
            <span className={selectedRegions.length === 0 ? 'text-slate-400' : 'text-slate-700'}>{getRegionLabel()}</span>
            <svg className={`w-4 h-4 text-slate-400 transition-transform ${isRegionOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {isRegionOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 max-h-64 overflow-y-auto">
              <label className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-slate-50 rounded-lg cursor-pointer border-b border-slate-100 mb-1">
                <input type="checkbox" checked={selectedRegions.length === availableRegions.length} onChange={() => onRegionChange && onRegionChange(selectedRegions.length === availableRegions.length ? [] : [...availableRegions])} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                <span>Select All</span>
              </label>
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
          <button onClick={() => { setIsTimeOpen(!isTimeOpen); setIsRegionOpen(false); setIsConditionOpen(false); }} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-medium text-slate-700 shadow-xs transition-colors">
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

        {/* Condition Checkbox Dropdown */}
        <div className="relative">
          <button onClick={() => { setIsConditionOpen(!isConditionOpen); setIsRegionOpen(false); setIsTimeOpen(false); }} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-medium shadow-xs transition-colors">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            <span className={selectedCondition.length === 0 ? 'text-slate-400' : 'text-slate-700'}>{getConditionLabel()}</span>
          </button>
          {isConditionOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 max-h-64 overflow-y-auto">
              {selectedRegions.length <= 1 && (
                <label className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-slate-50 rounded-lg cursor-pointer border-b border-slate-100 mb-1">
                  <input type="checkbox" checked={selectedCondition.length === CONDITIONS.length} onChange={() => onConditionChange && onConditionChange(selectedCondition.length === CONDITIONS.length ? [] : CONDITIONS.map(c => c.value))} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                  <span>Select All Conditions</span>
                </label>
              )}
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
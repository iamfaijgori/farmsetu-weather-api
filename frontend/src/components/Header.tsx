import React, { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  selectedRegions: string[];
  onRegionChange: (regions: string[]) => void;
  selectedTimeRange: string;
  onTimeRangeChange: (time: string) => void;
  selectedYear: string;
  onYearChange: (year: string) => void;
  selectedCondition: string[];
  onConditionChange: (conditions: string[]) => void;
  onLoadData: () => void;
  onClear: () => void;
}

const REGIONS = [
  'UK', 'England', 'Wales', 'Scotland', 'Northern Ireland',
  'England and Wales', 'England N', 'England S', 'Scotland N', 'Scotland E',
  'Scotland W', 'England E and NE', 'England NW and N Wales', 'Midlands',
  'East Anglia', 'England SW and S Wales', 'England SE and Central S'
];

const CONDITIONS = [
  { id: 'tmin', label: 'Min Temperature' },
  { id: 'tmax', label: 'Max Temperature' },
  { id: 'tmean', label: 'Mean Temperature' },
  { id: 'sun', label: 'Sunshine Hours' },
  { id: 'rain', label: 'Total Rainfall' }
];

const TIME_RANGES = [
  { id: 'monthly', label: 'Monthly View' },
  { id: 'seasonal', label: 'Seasonal View' },
  { id: '1y', label: 'Previous Calendar Year' },
  { id: '5y', label: 'Last 5 Calendar Years' },
  { id: '10y', label: 'Last 10 Calendar Years' },
  { id: 'all', label: 'All Historic Years' }
];

export const Header: React.FC<HeaderProps> = ({
  selectedRegions, onRegionChange,
  selectedTimeRange, onTimeRangeChange,
  selectedYear, onYearChange,
  selectedCondition, onConditionChange,
  onLoadData, onClear
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1883 }, (_, i) => (currentYear - i).toString());
  const isMultiYear = ['1y', '5y', '10y', 'all'].includes(selectedTimeRange);

  const getRegionLabel = () => {
    if (selectedRegions.length === 0) return 'Select Region';
    if (selectedRegions.length === REGIONS.length) return 'All Regions';
    if (selectedRegions.length === 1) return selectedRegions[0];
    return `${selectedRegions.length} Regions`;
  };

  const getConditionLabel = () => {
    if (selectedCondition.length === 0) return 'Select Condition';
    if (selectedCondition.length === CONDITIONS.length) return 'All Conditions';
    if (selectedCondition.length === 1) return CONDITIONS.find(c => c.id === selectedCondition[0])?.label || '';
    return `${selectedCondition.length} Conditions`;
  };

  // 🔥 THE FIX: Rule Enforcement Handlers
  const handleRegionSelect = (region: string, checked: boolean) => {
    const newRegions = checked ? [...selectedRegions, region] : selectedRegions.filter(r => r !== region);
    onRegionChange(newRegions);
    if (newRegions.length > 1 && selectedCondition.length > 1) {
      onConditionChange([selectedCondition[0]]);
    }
  };

  const handleSelectAllRegions = (checked: boolean) => {
    if (checked) {
      onRegionChange([...REGIONS]);
      if (selectedCondition.length > 1) onConditionChange([selectedCondition[0]]);
    } else {
      onRegionChange([]);
    }
  };

  const handleConditionSelect = (condId: string, checked: boolean) => {
    const newConds = checked ? [...selectedCondition, condId] : selectedCondition.filter(c => c !== condId);
    onConditionChange(newConds);
    if (newConds.length > 1 && selectedRegions.length > 1) {
      onRegionChange([selectedRegions[0]]);
    }
  };

  const handleSelectAllConditions = (checked: boolean) => {
    if (checked) {
      onConditionChange(CONDITIONS.map(c => c.id));
      if (selectedRegions.length > 1) onRegionChange([selectedRegions[0]]);
    } else {
      onConditionChange([]);
    }
  };

  return (
    <div ref={headerRef} className="w-full bg-white rounded-2xl p-4 sm:p-5 flex flex-col xl:flex-row items-center justify-between shadow-sm border border-slate-200 mb-6 gap-4 z-50 relative">
      <div className="flex-shrink-0">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Weather Monitoring System</h1>
      </div>

      <div className="flex flex-wrap items-center justify-center xl:justify-end gap-3 w-full">
        {/* REGION DROPDOWN */}
        <div className="relative">
          <button 
            onClick={() => setOpenDropdown(openDropdown === 'region' ? null : 'region')}
            className="flex items-center justify-between w-40 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-medium text-slate-700 shadow-xs transition-colors"
          >
            <span className="truncate">{getRegionLabel()}</span>
            <svg className="w-4 h-4 text-slate-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {openDropdown === 'region' && (
            <div className="absolute top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 max-h-80 overflow-y-auto">
              <label className="flex items-center px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100">
                <input 
                  type="checkbox" 
                  className="rounded border-slate-300 text-blue-500 focus:ring-blue-500 mr-3 cursor-pointer w-4 h-4"
                  checked={selectedRegions.length === REGIONS.length}
                  onChange={(e) => handleSelectAllRegions(e.target.checked)}
                />
                <span className="text-sm font-bold text-slate-800">Select All</span>
              </label>
              {REGIONS.map(region => (
                <label key={region} className="flex items-center px-4 py-2 hover:bg-slate-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-blue-500 focus:ring-blue-500 mr-3 cursor-pointer w-4 h-4"
                    checked={selectedRegions.includes(region)}
                    onChange={(e) => handleRegionSelect(region, e.target.checked)}
                  />
                  <span className="text-sm text-slate-600">{region}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* DURATION DROPDOWN */}
        <select 
          value={selectedTimeRange}
          onChange={(e) => onTimeRangeChange(e.target.value)}
          className="w-44 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-medium text-slate-700 shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="" disabled>Select Duration</option>
          {TIME_RANGES.map(tr => (
            <option key={tr.id} value={tr.id}>{tr.label}</option>
          ))}
        </select>

        {/* YEAR DROPDOWN */}
        <select 
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          disabled={isMultiYear}
          className={`w-28 px-4 py-2 bg-white border rounded-xl text-sm font-medium shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isMultiYear ? 'border-slate-100 text-slate-300 bg-slate-50' : 'border-slate-200 hover:border-slate-300 text-slate-700'}`}
        >
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        {/* CONDITION DROPDOWN */}
        <div className="relative">
          <button 
            onClick={() => setOpenDropdown(openDropdown === 'condition' ? null : 'condition')}
            className="flex items-center justify-between w-44 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-medium text-slate-700 shadow-xs transition-colors"
          >
            <span className="truncate">{getConditionLabel()}</span>
            <svg className="w-4 h-4 text-slate-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {openDropdown === 'condition' && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
              <label className="flex items-center px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100">
                <input 
                  type="checkbox" 
                  className="rounded border-slate-300 text-blue-500 focus:ring-blue-500 mr-3 cursor-pointer w-4 h-4"
                  checked={selectedCondition.length === CONDITIONS.length}
                  onChange={(e) => handleSelectAllConditions(e.target.checked)}
                />
                <span className="text-sm font-bold text-slate-800">Select All</span>
              </label>
              {CONDITIONS.map(cond => (
                <label key={cond.id} className="flex items-center px-4 py-2 hover:bg-slate-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-blue-500 focus:ring-blue-500 mr-3 cursor-pointer w-4 h-4"
                    checked={selectedCondition.includes(cond.id)}
                    onChange={(e) => handleConditionSelect(cond.id, e.target.checked)}
                  />
                  <span className="text-sm text-slate-600">{cond.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-3 ml-1">
          <button 
            onClick={onClear}
            className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            Clear
          </button>
          <button 
            onClick={() => {
              setOpenDropdown(null);
              onLoadData();
            }}
            disabled={selectedRegions.length === 0 || selectedTimeRange === '' || selectedCondition.length === 0}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
          >
            Load Data
          </button>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';

interface DataTableProps {
  data: any[];
  selectedRegions: string[];
  timeRange: string;
  selectedYear: string;
  selectedCondition: string[];
  hasDataLoaded: boolean;
}

const ConditionIcon = ({ type }: { type: string }) => {
  if (type === 'Clear') return <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
  if (type === 'Rainy') return <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v2m-4-2v2m8-2v2M3 16.5a4.5 4.5 0 01.5-8.9h.5a5.5 5.5 0 0110.8 0h.5a4.5 4.5 0 01.5 8.9v.1A2.5 2.5 0 0113 19h-2a2.5 2.5 0 01-2.5-2.5v-.1z" /></svg>;
  if (type === 'Frosty') return <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v18m0-18l-3 3m3-3l3 3m-3 12l-3 3m3-3l3 3M7.5 7.5L16.5 16.5m0-9L7.5 16.5m0-9l-2.5 1m2.5-1l1 -2.5m8 11.5l2.5-1m-2.5 1l-1 2.5m0-11.5l2.5 1m-2.5-1l-1 -2.5m-8 11.5l-2.5-1m2.5 1l1 2.5" /></svg>;
  return <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>;
};

const formatCondition = (c: string) => ({
  tmin: 'Min Temp', tmax: 'Max Temp', tmean: 'Mean Temp', sun: 'Sunshine', rain: 'Rainfall'
}[c] || c);

// 1. FIXED: Master Table Chronological Sort Order Array
const PERIOD_ORDER = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Win', 'Spr', 'Sum', 'Aut', 'Ann'];

export const DataTable: React.FC<DataTableProps> = ({ data, selectedRegions, timeRange, selectedYear, selectedCondition, hasDataLoaded }) => {
  const [viewMode, setViewMode] = useState<'master' | 'matrix'>('master');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  
  const isMultiRegion = selectedRegions.length > 1;

  const getMatrixColumns = () => {
    let cols = [isMultiRegion ? 'Location' : 'Condition'];
    if (['1y', '5y', '10y', 'all'].includes(timeRange)) cols = ['Year', isMultiRegion ? 'Location' : 'Condition'];
    
    // 2. FIXED: Aligned exactly with Django's output
    if (timeRange === 'monthly') {
      cols = [...cols, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    } else if (timeRange === 'seasonal') {
      cols = [...cols, 'Win', 'Spr', 'Sum', 'Aut', 'Ann'];
    } else {
      cols = [...cols, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Win', 'Spr', 'Sum', 'Aut', 'Ann'];
    }
    return cols;
  };

  const masterColumns = ['YEAR', 'PERIOD', 'LOCATION', 'MIN TEMP', 'MAX TEMP', 'MEAN TEMP', 'SUNSHINE (HRS)', 'RAINFALL (MM)', 'CONDITION'];
  const currentColumns = viewMode === 'matrix' ? getMatrixColumns() : masterColumns;

  const generateData = () => {
    if (!hasDataLoaded || !data || data.length === 0) return [];
    
    // 🔥 THE FIX: Create a lightning-fast Hash Map ONCE (O(N) complexity)
    // Key format: "Year-Region-Period"
    const dataMap = new Map();
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      dataMap.set(`${d.year}-${d.region}-${d.period}`, d);
    }

    let processedData: any[] = [];
    
    if (viewMode === 'master') {
      const sortedData = [...data].sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        return PERIOD_ORDER.indexOf(a.period) - PERIOD_ORDER.indexOf(b.period);
      });

      processedData = sortedData.map((d, i) => {
        let cond = 'Clear';
        if (d.tmin !== null && d.tmin <= 0) cond = 'Frosty';
        else if (d.rain !== null && d.rain > 50) cond = 'Rainy'; 

        return {
          id: `rec-${i}`,
          col0: d.year,
          col1: d.period,
          col2: d.region,
          col3: d.tmin !== null ? d.tmin : '-',
          col4: d.tmax !== null ? d.tmax : '-',
          col5: d.tmean !== null ? d.tmean : '-',
          col6: d.sun !== null ? d.sun : '-',
          col7: d.rain !== null ? d.rain : '-',
          condition: cond
        };
      });
    } else {
      const currentYear = new Date().getFullYear();
      let targetYears: number[] = [];
      
      if (timeRange === 'monthly' || timeRange === 'seasonal') {
        targetYears = [parseInt(selectedYear) || currentYear];
      } else if (timeRange === '1y') {
        targetYears = [currentYear - 1];
      } else if (timeRange === '5y') {
        for(let i=0; i<5; i++) targetYears.push(currentYear - i);
      } else if (timeRange === '10y') {
        for(let i=0; i<10; i++) targetYears.push(currentYear - i);
      } else if (timeRange === 'all') {
        for(let y=currentYear; y>=1884; y--) targetYears.push(y);
      }

      const isMultiYear = ['1y', '5y', '10y', 'all'].includes(timeRange);
      const periods = currentColumns.slice(isMultiYear ? 2 : 1);
      
      if (isMultiRegion) {
        const activeMetric = selectedCondition[0] || 'tmean'; 
        selectedRegions.forEach((reg) => {
          targetYears.forEach(yr => {
            let row: any = { id: `${reg}-${yr}` };
            let offset = 0;
            if (isMultiYear) { row.col0 = yr; row.col1 = reg; offset = 2; } 
            else { row.col0 = reg; offset = 1; }
            
            periods.forEach((period, pIdx) => {
              // 🔥 THE FIX: Instant O(1) lookup instead of Array.find()
              const record = dataMap.get(`${yr}-${reg}-${period}`);
              row[`col${offset + pIdx}`] = record && record[activeMetric] !== null && record[activeMetric] !== undefined ? record[activeMetric] : '-';
            });
            processedData.push(row);
          });
        });
      } else {
        const condNameMap = selectedCondition.map(formatCondition);
        const reg = selectedRegions[0];
        
        selectedCondition.forEach((cond, cIdx) => {
          const condName = condNameMap[cIdx];
          targetYears.forEach(yr => {
            let row: any = { id: `${cond}-${yr}` };
            let offset = 0;
            if (isMultiYear) { row.col0 = yr; row.col1 = condName; offset = 2; } 
            else { row.col0 = condName; offset = 1; }
            
            periods.forEach((period, pIdx) => {
              // 🔥 THE FIX: Instant O(1) lookup instead of Array.find()
              const record = dataMap.get(`${yr}-${reg}-${period}`);
              row[`col${offset + pIdx}`] = record && record[cond] !== null && record[cond] !== undefined ? record[cond] : '-';
            });
            processedData.push(row);
          });
        });
      }
    }
    return processedData;
  };

  const tableData = generateData();
  const totalPages = Math.ceil(tableData.length / rowsPerPage);
  const paginatedData = tableData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleExportCSV = () => {
    if (tableData.length === 0) return;
    const csvRows = [currentColumns.join(',')];
    tableData.forEach(row => {
      const rowValues = currentColumns.map((_, idx) => {
         if (viewMode === 'master' && idx === 8) return row.condition;
         return row[`col${idx}`];
      });
      csvRows.push(rowValues.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weather_${viewMode}_export.csv`;
    a.click();
  };

  const getTableSubtitle = () => {
    if (!hasDataLoaded || viewMode !== 'matrix') return null;
    
    // 🔥 THE FIX: Dynamically generate the string label
    const isMultiYear = ['1y', '5y', '10y', 'all'].includes(timeRange);
    let timeLabel = selectedYear;
    if (timeRange === 'all') timeLabel = 'All Historic Years';
    else if (timeRange === '10y') timeLabel = 'Last 10 Years';
    else if (timeRange === '5y') timeLabel = 'Last 5 Years';
    else if (timeRange === '1y') timeLabel = 'Previous Year';

    if (isMultiRegion) {
      return <>Matrix mapping <strong className="text-blue-600">{formatCondition(selectedCondition[0]).toUpperCase()}</strong> across multiple regions for <strong>{timeLabel}</strong>.</>;
    }
    return <>Matrix mapping multiple conditions for <strong className="text-blue-600">{selectedRegions[0]}</strong> in <strong>{timeLabel}</strong>.</>;
  };

  return (
    <section className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm mb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-slate-100 gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Detailed Weather Records</h2>
          <p className="text-xs text-slate-500 mt-1">{getTableSubtitle()}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => { setViewMode('master'); setCurrentPage(1); }} className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${viewMode === 'master' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}>Master List</button>
            <button onClick={() => { setViewMode('matrix'); setCurrentPage(1); }} className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${viewMode === 'matrix' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}>Matrix View</button>
          </div>

          <button onClick={handleExportCSV} disabled={!hasDataLoaded} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 disabled:opacity-50 rounded-xl text-sm font-medium text-slate-700 shadow-xs transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> Export
          </button>
        </div>
      </div>

      {!hasDataLoaded ? (
        <div className="p-12 text-center text-slate-400 font-medium">Load data to view detailed records.</div>
      ) : (
        <>
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  {currentColumns.map((head) => (
                    <th key={head} className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={currentColumns.length} className="p-8 text-center text-slate-500">
                      No matching records found for this selection.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                      {currentColumns.map((col, idx) => {
                        
                        if (viewMode === 'master' && idx === 8) {
                          return (
                            <td key={idx} className="px-6 py-4 text-sm font-medium text-slate-600">
                              <div className="flex items-center gap-2">
                                <ConditionIcon type={row.condition} /> {row.condition}
                              </div>
                            </td>
                          );
                        }

                        const val = row[`col${idx}`];
                        let cellClass = "px-6 py-4 text-sm font-medium text-slate-600 whitespace-nowrap";
                        
                        if (viewMode === 'master') {
                          if (idx === 2) cellClass = "px-6 py-4 text-sm font-semibold text-blue-500";
                          if (idx === 3 && val !== '-' && val < 0) cellClass = "px-6 py-4 text-sm font-bold text-red-500";
                          else if (idx >= 3 && idx <= 5) cellClass = "px-6 py-4 text-sm font-bold text-slate-700";
                          if (idx === 6) cellClass = "px-6 py-4 text-sm font-semibold text-orange-500";
                        }
                        
                        return (
                          <td key={idx} className={cellClass}>
                            {val}{viewMode === 'master' && (idx >= 3 && idx <= 5) && val !== '-' ? '°C' : ''}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-slate-100 gap-4">
            <span className="text-sm text-slate-400">Showing {tableData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, tableData.length)} of {tableData.length} records</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-colors">Prev</button>
              {Array.from({ length: totalPages }).map((_, i) => {
                 if (totalPages > 7 && i > 2 && i < totalPages - 3 && i + 1 !== currentPage) {
                   if (i === 3 || i === totalPages - 4) return <span key={i} className="px-1 text-slate-400">...</span>;
                   return null;
                 }
                 return (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold ${currentPage === i + 1 ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>{i + 1}</button>
                );
              })}
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-colors">Next</button>
            </div>
          </div>
        </>
      )}
    </section>
  );
};
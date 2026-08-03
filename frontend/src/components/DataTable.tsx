import React, { useState, useMemo } from 'react';

interface DataTableProps {
  selectedRegions: string[];
  timeRange: string;
  selectedYear: string;
  selectedCondition: string[];
  hasDataLoaded: boolean;
}

// Figma UI Weather Icons
const ConditionIcon = ({ type }: { type: string }) => {
  if (type === 'Clear') return <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
  if (type === 'Rainy') return <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v2m-4-2v2m8-2v2M3 16.5a4.5 4.5 0 01.5-8.9h.5a5.5 5.5 0 0110.8 0h.5a4.5 4.5 0 01.5 8.9v.1A2.5 2.5 0 0113 19h-2a2.5 2.5 0 01-2.5-2.5v-.1z" /></svg>;
  if (type === 'Frosty') return <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v18m0-18l-3 3m3-3l3 3m-3 12l-3 3m3-3l3 3M7.5 7.5L16.5 16.5m0-9L7.5 16.5m0-9l-2.5 1m2.5-1l1 -2.5m8 11.5l2.5-1m-2.5 1l-1 2.5m0-11.5l2.5 1m-2.5-1l-1 -2.5m-8 11.5l-2.5-1m2.5 1l1 2.5" /></svg>;
  return <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>;
};

export const DataTable: React.FC<DataTableProps> = ({ selectedRegions, timeRange, selectedYear, selectedCondition, hasDataLoaded }) => {
  const [viewMode, setViewMode] = useState<'master' | 'matrix'>('master');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // 1. Column Definition Logic
  const getMatrixColumns = () => {
    let cols = ['Location'];
    if (['1y', '5y', '10y', 'all'].includes(timeRange)) cols = ['Year', 'Location'];
    
    if (timeRange === 'monthly' || timeRange === '1y') {
      cols = [...cols, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    } else if (timeRange === 'seasonal') {
      cols = [...cols, 'Win', 'Spr', 'Sum', 'Aut', 'Ann'];
    } else {
      cols = [...cols, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Win', 'Spr', 'Sum', 'Aut', 'Ann'];
    }
    return cols;
  };

  const masterColumns = ['DATE', 'LOCATION', 'MIN TEMP', 'MAX TEMP', 'MEAN TEMP', 'SUNSHINE (HRS)', 'RAINFALL (MM)', 'CONDITION'];
  const currentColumns = viewMode === 'matrix' ? getMatrixColumns() : masterColumns;
  const activeMetricForMatrix = selectedCondition[0] || 'tmean';

  // 2. Generate Mock Data based on View Mode
  const generateData = () => {
    if (!hasDataLoaded) return [];
    let data: any[] = [];
    
    if (viewMode === 'master') {
      // Figma UI Flattened Data
      for (let i = 0; i < 45; i++) {
        const isFrosty = i % 7 === 0;
        const isRainy = i % 3 === 0;
        data.push({
          id: `rec-${i}`,
          col0: `${selectedYear}-10-${String((i % 30) + 1).padStart(2, '0')}`,
          col1: selectedRegions[i % selectedRegions.length],
          col2: Number((isFrosty ? -1.5 : 8 + Math.random() * 5).toFixed(1)),
          col3: Number((isFrosty ? 4.5 : 15 + Math.random() * 10).toFixed(1)),
          col4: Number((isFrosty ? 1.5 : 11 + Math.random() * 6).toFixed(1)),
          col5: Number((isRainy ? 1.2 : 6 + Math.random() * 4).toFixed(1)),
          col6: Number((isRainy ? 15.5 : 0).toFixed(1)),
          condition: isFrosty ? 'Frosty' : isRainy ? 'Rainy' : 'Clear',
        });
      }
    } else {
      // Met Office Text File Matrix Data
      const baseVal = activeMetricForMatrix.includes('rain') ? 80 : 12;
      selectedRegions.forEach((reg, rIdx) => {
        const years = ['1y', '5y', '10y', 'all'].includes(timeRange) ? [2024, 2023, 2022] : [selectedYear];
        years.forEach(yr => {
          let row: any = { id: `${reg}-${yr}`, col0: reg };
          let offset = 1;
          if (['1y', '5y', '10y', 'all'].includes(timeRange)) {
            row.col0 = yr;
            row.col1 = reg;
            offset = 2;
          }
          // Fill remaining dynamic columns
          for (let i = offset; i < currentColumns.length; i++) {
            row[`col${i}`] = Number((baseVal + Math.sin(i) * 5 + rIdx).toFixed(1));
          }
          data.push(row);
        });
      });
    }
    return data;
  };

  const tableData = generateData();
  const totalPages = Math.ceil(tableData.length / rowsPerPage);
  const paginatedData = tableData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // 3. Export CSV correctly mapped to the current toggle mode
  const handleExportCSV = () => {
    if (tableData.length === 0) return;
    const csvRows = [currentColumns.join(',')];
    tableData.forEach(row => {
      const rowValues = currentColumns.map((_, idx) => row[`col${idx}`]);
      csvRows.push(rowValues.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weather_${viewMode}_export.csv`;
    a.click();
  };

  return (
    <section className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm mb-12">
      
      {/* Header, Toggle & Export */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-slate-100 gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Detailed Weather Records</h2>
          {hasDataLoaded && viewMode === 'matrix' && (
            <p className="text-xs text-slate-500 mt-1">Matrix currently mapping: <span className="font-semibold text-blue-600">{activeMetricForMatrix.toUpperCase()}</span></p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => { setViewMode('master'); setCurrentPage(1); }}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${viewMode === 'master' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Master List
            </button>
            <button 
              onClick={() => { setViewMode('matrix'); setCurrentPage(1); }}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${viewMode === 'matrix' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Matrix View
            </button>
          </div>

          <button 
            onClick={handleExportCSV}
            disabled={!hasDataLoaded}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 disabled:opacity-50 rounded-xl text-sm font-medium text-slate-700 shadow-xs transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export
          </button>
        </div>
      </div>

      {!hasDataLoaded ? (
        <div className="p-12 text-center text-slate-400 font-medium">Load data to view detailed records.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  {currentColumns.map((head) => (
                    <th key={head} className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    {currentColumns.map((col, idx) => {
                      const val = row[`col${idx}`];
                      // Styling overrides for Master View Date/Location/Negative Temps
                      let cellClass = "px-6 py-4 text-sm font-medium text-slate-600 whitespace-nowrap";
                      if (viewMode === 'master') {
                        if (idx === 1) cellClass = "px-6 py-4 text-sm font-semibold text-blue-500";
                        if (idx === 2 && val < 0) cellClass = "px-6 py-4 text-sm font-bold text-red-500";
                        else if (idx >= 2 && idx <= 4) cellClass = "px-6 py-4 text-sm font-bold text-slate-700";
                        if (idx === 5) cellClass = "px-6 py-4 text-sm font-semibold text-orange-500";
                      }
                      
                      return (
                        <td key={idx} className={cellClass}>
                          {val}{viewMode === 'master' && (idx >= 2 && idx <= 4) ? '°C' : ''}
                        </td>
                      );
                    })}
                    {/* Render Icon column if Master View */}
                    {viewMode === 'master' && (
                      <td className="px-6 py-4 text-sm font-medium text-slate-600 flex items-center gap-2">
                        <ConditionIcon type={row.condition} /> {row.condition}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-slate-100 gap-4">
            <span className="text-sm text-slate-400">
              Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, tableData.length)} of {tableData.length} records
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-colors">Prev</button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold ${currentPage === i + 1 ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>{i + 1}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-colors">Next</button>
            </div>
          </div>
        </>
      )}
    </section>
  );
};
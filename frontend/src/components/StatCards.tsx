import React from 'react';

interface StatCardsProps {
  data: {
    minTemp: number;
    maxTemp: number;
    meanTemp: number;
    sunshineHours: number;
    totalRainfall: number;
  };
}

export const StatCards: React.FC<StatCardsProps> = ({ data }) => {
  const cards = [
    {
      title: 'MIN TEMPERATURE',
      value: data.minTemp,
      unit: '°C',
      bgClass: 'bg-gradient-to-br from-blue-400 to-blue-200',
      textClass: 'text-blue-900',
      labelClass: 'text-blue-800',
    },
    {
      title: 'MAX TEMPERATURE',
      value: data.maxTemp,
      unit: '°C',
      bgClass: 'bg-gradient-to-br from-orange-300 to-orange-200',
      textClass: 'text-orange-900',
      labelClass: 'text-orange-800',
    },
    {
      title: 'MEAN TEMPERATURE',
      value: data.meanTemp,
      unit: '°C',
      bgClass: 'bg-gradient-to-br from-slate-400 to-slate-200',
      textClass: 'text-slate-900',
      labelClass: 'text-slate-700',
    },
    {
      title: 'SUNSHINE HOURS',
      value: data.sunshineHours,
      unit: 'hrs',
      bgClass: 'bg-gradient-to-br from-yellow-400 to-yellow-200',
      textClass: 'text-yellow-900',
      labelClass: 'text-yellow-800',
    },
    {
      title: 'TOTAL RAINFALL',
      value: data.totalRainfall,
      unit: 'mm',
      bgClass: 'bg-gradient-to-br from-slate-800 to-slate-900',
      textClass: 'text-white',
      labelClass: 'text-slate-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {cards.map((card, idx) => (
        <div 
          key={idx} 
          className={`rounded-2xl p-5 shadow-sm border border-black/5 transition-all duration-300 ${card.bgClass}`}
        >
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${card.labelClass}`}>
            {card.title}
          </h3>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-bold ${card.textClass}`}>
              {card.value}
            </span>
            <span className={`text-sm font-semibold ${card.labelClass}`}>
              {card.unit}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
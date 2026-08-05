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

// Reusable SVG Icons for the cards
const Icons = {
  MinTemp: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  ),
  MaxTemp: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  ),
  MeanTemp: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 11V6a3 3 0 016 0v5a4 4 0 11-6 0z" />
    </svg>
  ),
  Sunshine: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Rainfall: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
    </svg>
  )
};

export const StatCards: React.FC<StatCardsProps> = ({ data }) => {
  const cards = [
    {
      title: 'MIN TEMPERATURE',
      value: data.minTemp,
      unit: '°C',
      icon: <Icons.MinTemp />,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      title: 'MAX TEMPERATURE',
      value: data.maxTemp,
      unit: '°C',
      icon: <Icons.MaxTemp />,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
    },
    {
      title: 'MEAN TEMPERATURE',
      value: data.meanTemp,
      unit: '°C',
      icon: <Icons.MeanTemp />,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
    },
    {
      title: 'SUNSHINE HOURS',
      value: data.sunshineHours,
      unit: 'hrs',
      icon: <Icons.Sunshine />,
      iconBg: 'bg-yellow-50',
      iconColor: 'text-yellow-500',
    },
    {
      title: 'TOTAL RAINFALL',
      value: data.totalRainfall,
      unit: 'mm',
      icon: <Icons.Rainfall />,
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {cards.map((card, idx) => (
        <div 
          key={idx} 
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 transition-all duration-300 hover:shadow-md flex flex-col justify-center"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-xl ${card.iconBg} ${card.iconColor}`}>
              {card.icon}
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {card.title}
            </h3>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold text-slate-900">
              {card.value}
            </span>
            <span className="text-sm font-semibold text-slate-500 ml-1">
              {card.unit}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
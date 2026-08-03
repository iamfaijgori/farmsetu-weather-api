import React from 'react';

export interface StatCardsData {
  minTemp?: number;
  maxTemp?: number;
  meanTemp?: number;
  sunshineHours?: number;
  totalRainfall?: number;
}

interface StatCardsProps {
  data?: StatCardsData;
}

export const StatCards: React.FC<StatCardsProps> = ({
  data = {
    minTemp: -1.2,
    maxTemp: 34.0,
    meanTemp: 14.2,
    sunshineHours: 6.4,
    totalRainfall: 845,
  },
}) => {
  // High-quality aesthetic stock images & a rain GIF for a sober, clean vibe
  const cardConfigs = [
    {
      id: 'min-temp',
      title: 'Min Temperature',
      value: `${data.minTemp ?? '-'}`,
      unit: '°C',
      // Crisp, subtle morning cold / frosted landscape
      bgUrl: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=800&q=80',
      textColor: 'text-slate-900',
      overlay: 'bg-white/45 backdrop-blur-[2px]',
    },
    {
      id: 'max-temp',
      title: 'Max Temperature',
      value: `${data.maxTemp ?? '-'}`,
      unit: '°C',
      // Sober golden warm landscape
      bgUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      textColor: 'text-slate-900',
      overlay: 'bg-white/45 backdrop-blur-[2px]',
    },
    {
      id: 'mean-temp',
      title: 'Mean Temperature',
      value: `${data.meanTemp ?? '-'}`,
      unit: '°C',
      // Aesthetic lush green valley
      bgUrl: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=800&q=80',
      textColor: 'text-white',
      overlay: 'bg-black/35 backdrop-blur-[1px]',
    },
    {
      id: 'sunshine-hours',
      title: 'Sunshine Hours',
      value: `${data.sunshineHours ?? '-'}`,
      unit: 'hrs',
      // Soft, clean blue sky with gentle sunshine
      bgUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      textColor: 'text-slate-900',
      overlay: 'bg-white/40 backdrop-blur-[1px]',
    },
    {
      id: 'total-rainfall',
      title: 'Total Rainfall',
      value: `${data.totalRainfall ?? '-'}`,
      unit: 'mm',
      // Subtle rain GIF for animated aesthetic vibe
      bgUrl: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExYXJhaHByMTVnZXg1dTlvZmJ4a2hqb2l6azY3cnN0em1sazQyOXU0eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/OKYuALyOExdU4/giphy.gif',
      textColor: 'text-white',
      overlay: 'bg-slate-950/50 backdrop-blur-[1px]',
    },
  ];

  return (
    <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cardConfigs.map((card) => (
        <div
          key={card.id}
          className="relative overflow-hidden border border-white/60 shadow-xs transition-transform duration-300 hover:scale-[1.01]"
          style={{
            borderRadius: '16px',
            borderWidth: '0.8px',
            paddingLeft: '24px',
            paddingRight: '24px',
            paddingTop: '20px',
            paddingBottom: '20px',
          }}
        >
          {/* Background Image / GIF */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
            style={{ backgroundImage: `url('${card.bgUrl}')` }}
          />

          {/* Soft Tint Overlay for Readable Text */}
          <div className={`absolute inset-0 ${card.overlay}`} />

          {/* Card Content */}
          <div className={`relative z-10 flex flex-col justify-between h-full ${card.textColor}`}>
            {/* Heading */}
            <h3
              className="uppercase font-semibold tracking-[0.88px] mb-3"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                lineHeight: '16.5px',
              }}
            >
              {card.title}
            </h3>

            {/* Metric Value */}
            <div className="flex items-baseline gap-1">
              <span
                className="font-bold tracking-normal"
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: '30px',
                  lineHeight: '30px',
                }}
              >
                {card.value}
              </span>
              <span className="text-sm font-semibold opacity-80">{card.unit}</span>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};
import { Header } from './components/Header';

export default function App() {
  return (
    <div className="w-full min-h-screen bg-[#f3f6f9] text-slate-800 p-4 sm:p-6 lg:p-8">
      {/* Our Header Component */}
      <Header
        onRegionChange={(regions) => console.log('Selected regions:', regions)}
        onTimeRangeChange={(range) => console.log('Selected time range:', range)}
        onConditionChange={(condition) => console.log('Selected condition:', condition)}
      />

      {/* Placeholder for the next section */}
      <div className="w-full border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-400 font-medium">
        Next Section: Hero Photographic Stat Cards
      </div>
    </div>
  );
}
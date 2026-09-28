import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { LayoutDashboard, Warehouse, Store, ArrowLeftRight, Clock } from 'lucide-react';
import { soundAndHaptics } from '../utils/soundAndHaptics.ts';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, stats, t } = useApp();

  const handleTabChange = (tab: 'dashboard' | 'godam' | 'dukan' | 'transfer' | 'history') => {
    soundAndHaptics.playTap();
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const lowStockCount = stats?.lowStockItemsCount || 0;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 px-1 py-1.5 items-center">
        {/* Dashboard */}
        <button
          onClick={() => handleTabChange('dashboard')}
          className={`flex flex-col items-center justify-center py-1 transition-all rounded-xl ${
            activeTab === 'dashboard'
              ? 'text-emerald-700 font-bold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'scale-110' : ''}`} />
          <span className="text-[11px] mt-0.5 tracking-tight">
            {t('डैशबोर्ड', 'Home')}
          </span>
        </button>

        {/* Godam (Warehouse) */}
        <button
          onClick={() => handleTabChange('godam')}
          className={`flex flex-col items-center justify-center py-1 transition-all rounded-xl ${
            activeTab === 'godam'
              ? 'text-emerald-700 font-bold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Warehouse className={`w-5 h-5 ${activeTab === 'godam' ? 'scale-110' : ''}`} />
          <span className="text-[11px] mt-0.5 tracking-tight">
            {t('गोदाम', 'Godam')}
          </span>
        </button>

        {/* Transfer Button (Center highlight) */}
        <button
          onClick={() => handleTabChange('transfer')}
          className="flex flex-col items-center justify-center py-0.5 -mt-3.5 group"
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform group-active:scale-95 ${
              activeTab === 'transfer'
                ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                : 'bg-emerald-700 text-white shadow-emerald-900/20 ring-4 ring-white'
            }`}
          >
            <ArrowLeftRight className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span
            className={`text-[10px] mt-0.5 font-bold ${
              activeTab === 'transfer' ? 'text-amber-600' : 'text-emerald-800'
            }`}
          >
            {t('ट्रांसफर', 'Transfer')}
          </span>
        </button>

        {/* Dukan (Shop Counter) */}
        <button
          onClick={() => handleTabChange('dukan')}
          className={`relative flex flex-col items-center justify-center py-1 transition-all rounded-xl ${
            activeTab === 'dukan'
              ? 'text-emerald-700 font-bold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <Store className={`w-5 h-5 ${activeTab === 'dukan' ? 'scale-110' : ''}`} />
            {lowStockCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                {lowStockCount > 9 ? '9+' : lowStockCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">
            {t('दुकान', 'Dukan')}
          </span>
        </button>

        {/* History / Log */}
        <button
          onClick={() => handleTabChange('history')}
          className={`flex flex-col items-center justify-center py-1 transition-all rounded-xl ${
            activeTab === 'history'
              ? 'text-emerald-700 font-bold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Clock className={`w-5 h-5 ${activeTab === 'history' ? 'scale-110' : ''}`} />
          <span className="text-[11px] mt-0.5 tracking-tight">
            {t('इतिहास', 'Log')}
          </span>
        </button>
      </div>
    </nav>
  );
};

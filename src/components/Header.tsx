import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { RefreshCw, Globe, Wifi, WifiOff, ShieldCheck, User as UserIcon } from 'lucide-react';
import { soundAndHaptics } from '../utils/soundAndHaptics.ts';

export const Header: React.FC = () => {
  const {
    currentUser,
    setIsUserSwitchOpen,
    isCloudSynced,
    lastSyncTime,
    fetchFreshData,
    lang,
    toggleLang,
    t,
  } = useApp();

  const handleRefresh = async () => {
    soundAndHaptics.playTap();
    await fetchFreshData();
  };

  return (
    <header className="sticky top-0 z-30 bg-emerald-800 text-white shadow-md border-b border-emerald-900/40">
      <div className="max-w-md mx-auto px-3.5 py-2.5 flex items-center justify-between">
        {/* Brand & Tagline */}
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-900 font-extrabold flex items-center justify-center text-lg shadow-sm border border-amber-300">
            ⚡
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-base font-bold tracking-tight text-white leading-none">
                StockDukan
              </h1>
              <span className="text-[10px] bg-emerald-700 text-amber-200 font-semibold px-1.5 py-0.5 rounded-full border border-emerald-600">
                {t('इलेक्ट्रिकल • गोदाम-दुकान', 'Electrical • Godam-Dukan')}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 mt-0.5 text-[11px] text-emerald-200">
              {isCloudSynced ? (
                <span className="flex items-center text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1"></span>
                  <Wifi className="w-3 h-3 mr-0.5 inline text-emerald-300" />
                  {t('लाइव सिंक', 'Live Sync')} ({lastSyncTime})
                </span>
              ) : (
                <span className="flex items-center text-amber-300">
                  <WifiOff className="w-3 h-3 mr-0.5 inline" />
                  {t('ऑफलाइन मोड', 'Offline')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5">
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-lg bg-emerald-700/60 active:bg-emerald-700 text-emerald-100 hover:text-white transition-colors"
            title={t('ताज़ा करें', 'Refresh')}
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-emerald-700/80 active:bg-emerald-600 text-xs font-semibold text-emerald-100 border border-emerald-600/60"
            title="भाषा बदलें"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'EN' : 'हिं'}</span>
          </button>

          {/* User profile button */}
          <button
            onClick={() => {
              soundAndHaptics.playTap();
              setIsUserSwitchOpen(true);
            }}
            className="flex items-center space-x-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-emerald-900/60 border border-emerald-700 active:scale-95 transition-transform"
          >
            <div className={`w-6 h-6 rounded-full ${currentUser.avatarColor} text-white flex items-center justify-center text-xs font-bold shadow-inner`}>
              {currentUser.role === 'owner' ? (
                <ShieldCheck className="w-3.5 h-3.5" />
              ) : (
                <UserIcon className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="text-left max-w-[85px] truncate">
              <p className="text-[11px] font-semibold text-white leading-tight truncate">
                {currentUser.name.split(' ')[0]}
              </p>
              <p className="text-[9px] text-amber-300 font-medium leading-none capitalize">
                {currentUser.role === 'owner' ? t('मालिक', 'Owner') : t('स्टाफ', 'Staff')}
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

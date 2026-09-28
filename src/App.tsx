import React from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Header } from './components/Header.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { GodamView } from './components/GodamView.tsx';
import { DukanView } from './components/DukanView.tsx';
import { TransferView } from './components/TransferView.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { AddProductModal } from './components/AddProductModal.tsx';
import { StockMovementModal } from './components/StockMovementModal.tsx';
import { UserSwitchModal } from './components/UserSwitchModal.tsx';
import { Plus } from 'lucide-react';
import { soundAndHaptics } from './utils/soundAndHaptics.ts';

const MainAppContent: React.FC = () => {
  const { activeTab, setIsAddModalOpen, isLoading } = useApp();

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-between">
      {/* Sticky Top Header */}
      <Header />

      {/* Main View Area */}
      <main className="flex-1 max-w-md w-full mx-auto p-3.5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-500 space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold">स्टॉक डेटा लोड हो रहा है...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'godam' && <GodamView />}
            {activeTab === 'dukan' && <DukanView />}
            {activeTab === 'transfer' && <TransferView />}
            {activeTab === 'history' && <HistoryView />}
          </>
        )}
      </main>

      {/* Floating Action Button (FAB) on Godam and Dukan tabs */}
      {(activeTab === 'godam' || activeTab === 'dukan') && (
        <button
          onClick={() => {
            soundAndHaptics.playTap();
            setIsAddModalOpen(true);
          }}
          className="fixed bottom-20 right-4 z-30 w-12 h-12 bg-emerald-700 active:bg-emerald-800 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all ring-4 ring-white"
          title="नया सामान जोड़ें"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      )}

      {/* Bottom Thumb Navigation Bar */}
      <BottomNav />

      {/* Global Modals */}
      <AddProductModal />
      <StockMovementModal />
      <UserSwitchModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

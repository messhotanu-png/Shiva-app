import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Warehouse, Store, AlertTriangle, PlusCircle, ArrowLeftRight, TrendingUp, DollarSign, Package, Clock, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import { soundAndHaptics } from '../utils/soundAndHaptics.ts';

export const DashboardView: React.FC = () => {
  const {
    stats,
    products,
    transactions,
    currentUser,
    setActiveTab,
    setSelectedCategory,
    setIsAddModalOpen,
    openMovementModal,
    t,
  } = useApp();

  const lowStockItems = products.filter(p => p.dukanStock <= p.minStockAlert);

  // Group stats for the 4 core electrical categories
  const categoriesStats = [
    {
      id: 'Switches (स्विच)',
      name: t('स्विच (Switches)', 'Switches'),
      icon: '🔘',
      color: 'bg-blue-50 border-blue-200 text-blue-900',
      items: products.filter(p => p.category.includes('Switch')),
    },
    {
      id: 'Sockets (सॉकेट)',
      name: t('सॉकेट (Sockets)', 'Sockets'),
      icon: '🔌',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      items: products.filter(p => p.category.includes('Socket')),
    },
    {
      id: 'Electrical pipes (इलेक्ट्रिकल पाइप)',
      name: t('इलेक्ट्रिकल पाइप (Pipes)', 'Conduit Pipes'),
      icon: '🪵',
      color: 'bg-amber-50 border-amber-200 text-amber-900',
      items: products.filter(p => p.category.includes('pipe') || p.category.includes('पाइप')),
    },
    {
      id: 'Electrical accessories (इलेक्ट्रिकल एक्सेसरीज)',
      name: t('एक्सेसरीज (Accessories)', 'Accessories'),
      icon: '🔩',
      color: 'bg-purple-50 border-purple-200 text-purple-900',
      items: products.filter(p => p.category.includes('accessories') || p.category.includes('एक्सेसरीज')),
    },
  ];

  const handleCategoryClick = (catId: string) => {
    soundAndHaptics.playTap();
    setSelectedCategory(catId);
    setActiveTab('godam');
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-stone-900 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-emerald-200 font-medium flex items-center">
                <Zap className="w-3.5 h-3.5 mr-1 text-amber-300" />
                {t('इलेक्ट्रिकल हार्डवेयर दुकान', 'Electrical Hardware Shop')}
              </p>
              <h2 className="text-xl font-extrabold tracking-tight mt-0.5">
                {t('गोदाम व दुकान स्टॉक', 'Godam & Dukan Stock')}
              </h2>
            </div>
            <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-100 border border-white/10">
              {products.length} {t('आइटम्स', 'Items')}
            </span>
          </div>

          {/* Quick Dual Stock Counter */}
          <div className="grid grid-cols-2 gap-2.5 mt-3.5 pt-3 border-t border-emerald-600/60">
            <button
              onClick={() => {
                soundAndHaptics.playTap();
                setActiveTab('godam');
              }}
              className="bg-emerald-900/40 active:bg-emerald-900/60 rounded-xl p-2.5 text-left border border-emerald-600/40 transition-colors"
            >
              <div className="flex items-center space-x-1.5 text-emerald-200 text-xs">
                <Warehouse className="w-3.5 h-3.5 text-amber-300" />
                <span>{t('गोदाम क्वांटिटी (Warehouse)', 'Godam Stock')}</span>
              </div>
              <p className="text-2xl font-black text-white mt-0.5">
                {stats?.totalGodamUnits.toLocaleString('hi-IN') || 0}
              </p>
              <span className="text-[10px] text-emerald-300 block">
                {t('थोक माल सुरक्षित', 'Bulk storage')}
              </span>
            </button>

            <button
              onClick={() => {
                soundAndHaptics.playTap();
                setActiveTab('dukan');
              }}
              className="bg-emerald-900/40 active:bg-emerald-900/60 rounded-xl p-2.5 text-left border border-emerald-600/40 transition-colors"
            >
              <div className="flex items-center space-x-1.5 text-emerald-200 text-xs">
                <Store className="w-3.5 h-3.5 text-emerald-300" />
                <span>{t('दुकान क्वांटिटी (Counter)', 'Shop Stock')}</span>
              </div>
              <p className="text-2xl font-black text-white mt-0.5">
                {stats?.totalDukanUnits.toLocaleString('hi-IN') || 0}
              </p>
              <span className="text-[10px] text-emerald-300 block">
                {t('काउंटर पर उपलब्ध', 'Ready for sale')}
              </span>
            </button>
          </div>
        </div>

        {/* Ambient background deco */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
      </div>

      {/* 4 Core Electrical Categories Dashboard Overview */}
      <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-stone-200/90">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold text-stone-800 flex items-center">
            <Zap className="w-3.5 h-3.5 text-amber-500 mr-1" />
            {t('4 मुख्य श्रेणियां (Core Electrical Categories)', '4 Core Electrical Categories')}
          </h3>
          <span className="text-[10px] text-stone-500">{t('गोदाम | दुकान', 'Godam | Dukan')}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {categoriesStats.map(cat => {
            const godamSum = cat.items.reduce((acc, p) => acc + p.godamStock, 0);
            const dukanSum = cat.items.reduce((acc, p) => acc + p.dukanStock, 0);
            const lowInCat = cat.items.filter(p => p.dukanStock <= p.minStockAlert).length;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`p-2.5 rounded-xl border text-left transition-all active:scale-[0.98] ${cat.color}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{cat.icon}</span>
                  {lowInCat > 0 && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-rose-600 text-white">
                      {lowInCat} {t('कम', 'low')}
                    </span>
                  )}
                </div>

                <p className="text-xs font-bold mt-1 leading-tight">{cat.name}</p>

                <div className="mt-1.5 flex items-center justify-between text-[11px] font-extrabold pt-1 border-t border-black/10">
                  <span className="text-stone-700">🏢 {godamSum}</span>
                  <span className="text-stone-900">🏪 {dukanSum}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Owner Financial Valuation (Visible only to owner) */}
      {currentUser.role === 'owner' && (
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-stone-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-700 flex items-center">
              <DollarSign className="w-4 h-4 mr-1 text-emerald-600" />
              {t('कुल स्टॉक का मूल्य (मालिक रिपोर्ट)', 'Stock Valuation (Owner Only)')}
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {t('गोपनीय', 'Confidential')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-stone-800">
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] text-stone-500 block">
                {t('खरीद लागत (Purchase Cost)', 'Cost Valuation')}
              </span>
              <p className="text-base font-extrabold text-stone-900 mt-0.5">
                ₹{(stats?.totalPurchaseValuation || 0).toLocaleString('hi-IN')}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[11px] text-emerald-800 block">
                {t('बिक्री मूल्य (Retail Value)', 'Selling Valuation')}
              </span>
              <p className="text-base font-extrabold text-emerald-900 mt-0.5">
                ₹{(stats?.totalSellingValuation || 0).toLocaleString('hi-IN')}
              </p>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
            <span className="flex items-center text-emerald-700 font-semibold">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              {t('अनुमानित मार्जिन:', 'Est. Margin:')} ₹
              {((stats?.totalSellingValuation || 0) - (stats?.totalPurchaseValuation || 0)).toLocaleString('hi-IN')}
            </span>
            <span className="text-[11px] text-stone-500">
              {t('कुल सामान:', 'Total Items:')} {stats?.totalUnits || 0}
            </span>
          </div>
        </div>
      )}

      {/* Low-Stock Warning Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-rose-900">
                  {t('दुकान में माल खत्म होने वाला है!', 'Low Stock Alert!')}
                </h3>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  {lowStockItems.length} {t('सामान की दुकान में कमी है। गोदाम से तुरंत ट्रांसफर करें।', 'items low in shop counter stock.')}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundAndHaptics.playTap();
                setActiveTab('transfer');
              }}
              className="px-2.5 py-1.5 bg-rose-600 active:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm whitespace-nowrap"
            >
              {t('ट्रांसफर करें', 'Restock Now')}
            </button>
          </div>

          {/* Quick chip preview of low stock items with brand & size */}
          <div className="mt-2.5 flex flex-wrap gap-1.5 pt-2 border-t border-rose-200/60">
            {lowStockItems.slice(0, 4).map(p => (
              <span
                key={p.id}
                className="text-[11px] bg-white text-rose-800 px-2 py-0.5 rounded-lg border border-rose-200 font-medium flex items-center space-x-1"
              >
                <span className="font-extrabold text-[9px] bg-rose-100 text-rose-900 px-1 rounded">{p.brand}</span>
                <span className="truncate max-w-[120px]">{p.name.split('(')[0]}</span>
                <span className="text-[10px] text-stone-500">({p.modelSize})</span>
                <span className="font-black text-rose-600">({p.dukanStock} {p.unit})</span>
              </span>
            ))}
            {lowStockItems.length > 4 && (
              <span className="text-[10px] text-rose-600 font-semibold self-center">
                +{lowStockItems.length - 4} {t('और सामान...', 'more...')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Quick Action Shortcuts */}
      <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-stone-200/80">
        <h3 className="text-xs font-bold text-stone-700 mb-2.5">
          {t('त्वरित कार्य (Quick Actions)', 'Quick Actions')}
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Add Product Button */}
          <button
            onClick={() => {
              soundAndHaptics.playTap();
              setIsAddModalOpen(true);
            }}
            className="flex items-center space-x-2.5 p-3 rounded-xl bg-stone-50 active:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-left transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-800">
                {t('नया इलेक्ट्रिकल सामान', 'Add Electrical Item')}
              </p>
              <p className="text-[10px] text-stone-500">
                {t('स्विच, सॉकेट, पाइप...', 'Switch, socket, pipe')}
              </p>
            </div>
          </button>

          {/* Transfer Stock Button */}
          <button
            onClick={() => {
              soundAndHaptics.playTap();
              setActiveTab('transfer');
            }}
            className="flex items-center space-x-2.5 p-3 rounded-xl bg-stone-50 active:bg-amber-50 border border-stone-200 hover:border-amber-300 text-left transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-800">
                {t('गोदाम ➔ दुकान', 'Transfer Stock')}
              </p>
              <p className="text-[10px] text-stone-500">
                {t('काउंटर पर माल भेजें', 'Move to counter')}
              </p>
            </div>
          </button>

          {/* Bulk In Stock */}
          <button
            onClick={() => {
              soundAndHaptics.playTap();
              if (products.length > 0) {
                openMovementModal(products[0], 'IN', 'godam');
              }
            }}
            className="flex items-center space-x-2.5 p-3 rounded-xl bg-stone-50 active:bg-blue-50 border border-stone-200 hover:border-blue-300 text-left transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-800">
                {t('माल आया (+ इन)', 'Stock In (+)')}
              </p>
              <p className="text-[10px] text-stone-500">
                {t('फैक्ट्री / थोक खरीद', 'Factory delivery')}
              </p>
            </div>
          </button>

          {/* Counter Sale */}
          <button
            onClick={() => {
              soundAndHaptics.playTap();
              setActiveTab('dukan');
            }}
            className="flex items-center space-x-2.5 p-3 rounded-xl bg-stone-50 active:bg-rose-50 border border-stone-200 hover:border-rose-300 text-left transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-800">
                {t('काउंटर बिक्री (- आउट)', 'Stock Out (-)')}
              </p>
              <p className="text-[10px] text-stone-500">
                {t('इलेक्ट्रीशियन / ग्राहक', 'Electrician billing')}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity Log Preview */}
      <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-stone-200/80">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold text-stone-700 flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1 text-stone-500" />
            {t('हाल की गतिविधियां (Recent Activity)', 'Recent Activity')}
          </h3>
          <button
            onClick={() => {
              soundAndHaptics.playTap();
              setActiveTab('history');
            }}
            className="text-[11px] text-emerald-700 font-semibold hover:underline"
          >
            {t('पूरा देखें ➔', 'View All ➔')}
          </button>
        </div>

        {transactions.length === 0 ? (
          <p className="text-xs text-stone-500 py-4 text-center">
            {t('कोई गतिविधि दर्ज नहीं है', 'No activity yet')}
          </p>
        ) : (
          <div className="divide-y divide-stone-100">
            {transactions.slice(0, 4).map(tx => (
              <div key={tx.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      tx.type === 'TRANSFER'
                        ? 'bg-amber-100 text-amber-700'
                        : tx.type === 'IN'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {tx.type === 'TRANSFER' ? '🔄' : tx.type === 'IN' ? '⬇' : '⬆'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900 leading-tight">
                      {tx.brand ? `[${tx.brand}] ` : ''}{tx.productName.split('(')[0]} {tx.modelSize ? `(${tx.modelSize})` : ''}
                    </p>
                    <p className="text-[10px] text-stone-500 mt-0.5">
                      <span className="font-semibold text-stone-700">{tx.performedBy.name.split(' ')[0]}</span>
                      {' • '}
                      <span>{tx.reason}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-black ${
                      tx.type === 'IN'
                        ? 'text-emerald-600'
                        : tx.type === 'OUT'
                        ? 'text-rose-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {tx.type === 'IN' ? '+' : tx.type === 'OUT' ? '-' : '↔'}{tx.quantity} {tx.unit}
                  </span>
                  <p className="text-[9px] text-stone-400 mt-0.5">
                    {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

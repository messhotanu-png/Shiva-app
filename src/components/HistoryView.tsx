import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Clock, User, ArrowLeftRight, ArrowDownRight, ArrowUpRight, Search, ShieldCheck } from 'lucide-react';
import { soundAndHaptics } from '../utils/soundAndHaptics.ts';

export const HistoryView: React.FC = () => {
  const { transactions, t } = useApp();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const filtered = transactions.filter(tx => {
    const matchesType = filterType === 'ALL' || tx.type === filterType;
    const matchesSearch = tx.productName.toLowerCase().includes(search.toLowerCase()) ||
                          tx.performedBy.name.toLowerCase().includes(search.toLowerCase()) ||
                          (tx.reason && tx.reason.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-3.5 pb-24">
      {/* History Header */}
      <div className="bg-gradient-to-r from-stone-800 via-stone-700 to-stone-900 rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl">
              📜
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {t('स्टॉक इतिहास (Activity Log)', 'Activity & Audit Log')}
              </h2>
              <p className="text-xs text-stone-300">
                {t('किसने कब क्या माल बदला व ट्रांसफर किया', 'Who modified stock, when and why')}
              </p>
            </div>
          </div>

          <span className="text-xs bg-stone-700 text-stone-200 px-2.5 py-1 rounded-full font-bold">
            {transactions.length} {t('रिकॉर्ड', 'Logs')}
          </span>
        </div>
      </div>

      {/* Filter Chips & Search */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('सामान या स्टाफ के नाम से खोजें...', 'Search by item or staff name...')}
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 shadow-sm"
          />
        </div>

        <div className="flex space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'ALL', label: t('सभी (All)', 'All') },
            { id: 'TRANSFER', label: t('🔄 ट्रांसफर (Transfers)', '🔄 Transfers') },
            { id: 'IN', label: t('⬇ इन (Stock In)', '⬇ Stock In') },
            { id: 'OUT', label: t('⬆ आउट (Sales/Out)', '⬆ Sales / Out') },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                soundAndHaptics.playTap();
                setFilterType(f.id);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                filterType === f.id
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 text-stone-500">
            <Clock className="w-10 h-10 mx-auto text-stone-300 mb-2" />
            <p className="text-sm font-semibold">{t('कोई रिकॉर्ड नहीं मिला', 'No records found')}</p>
          </div>
        ) : (
          filtered.map(tx => {
            const date = new Date(tx.timestamp);
            const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const formattedDate = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

            return (
              <div
                key={tx.id}
                className="bg-white rounded-2xl p-3.5 shadow-sm border border-stone-200/90 space-y-2"
              >
                {/* Header row: Icon, Name, Quantity & Time */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5 ${
                        tx.type === 'TRANSFER'
                          ? 'bg-amber-100 text-amber-800'
                          : tx.type === 'IN'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {tx.type === 'TRANSFER' ? (
                        <ArrowLeftRight className="w-4 h-4" />
                      ) : tx.type === 'IN' ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-1.5 flex-wrap mb-0.5">
                        {tx.brand && (
                          <span className="text-[9px] font-extrabold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded">
                            {tx.brand}
                          </span>
                        )}
                        {tx.modelSize && (
                          <span className="text-[9px] font-bold text-stone-700 bg-stone-100 px-1.5 py-0.2 rounded">
                            {tx.modelSize}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-stone-900 leading-snug">
                        {tx.productName}
                      </h4>
                      <p className="text-[11px] text-stone-500 font-medium">
                        {tx.reason}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span
                      className={`text-sm font-black ${
                        tx.type === 'IN'
                          ? 'text-emerald-700'
                          : tx.type === 'OUT'
                          ? 'text-rose-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {tx.type === 'IN' ? '+' : tx.type === 'OUT' ? '-' : '↔'}
                      {tx.quantity} {tx.unit}
                    </span>
                    <p className="text-[10px] text-stone-400">
                      {formattedDate}, {formattedTime}
                    </p>
                  </div>
                </div>

                {/* Stock transformation breakdown */}
                <div className="p-2 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="text-stone-500">{t('🏢 गोदाम:', 'Godam:')} </span>
                    <span className="font-bold text-stone-700">
                      {tx.previousGodamStock} ➔ {tx.newGodamStock}
                    </span>
                  </div>
                  <div className="border-l border-stone-200 pl-3">
                    <span className="text-stone-500">{t('🏪 दुकान:', 'Shop:')} </span>
                    <span className="font-bold text-stone-700">
                      {tx.previousDukanStock} ➔ {tx.newDukanStock}
                    </span>
                  </div>
                </div>

                {/* Performed by footer */}
                <div className="flex items-center justify-between pt-1 text-[11px] text-stone-500">
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3 text-stone-400" />
                    <span>{t('किया गया:', 'By:')}</span>
                    <span className="font-bold text-stone-800">{tx.performedBy.name}</span>
                    {tx.performedBy.role === 'owner' ? (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-semibold px-1 rounded flex items-center">
                        <ShieldCheck className="w-2.5 h-2.5 mr-0.5" />
                        {t('मालिक', 'Owner')}
                      </span>
                    ) : (
                      <span className="text-[9px] bg-blue-100 text-blue-800 font-semibold px-1 rounded">
                        {t('स्टाफ', 'Staff')}
                      </span>
                    )}
                  </div>

                  {tx.note && (
                    <span className="italic text-stone-400 truncate max-w-[130px]">
                      "{tx.note}"
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

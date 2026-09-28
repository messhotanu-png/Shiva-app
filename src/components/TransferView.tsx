import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Product } from '../types/inventory.ts';
import { ArrowRight, ArrowLeftRight, CheckCircle2, Warehouse, Store, AlertCircle } from 'lucide-react';
import { soundAndHaptics } from '../utils/soundAndHaptics.ts';

export const TransferView: React.FC = () => {
  const {
    products,
    transferTargetProduct,
    setTransferTargetProduct,
    transferStock,
    setActiveTab,
    t,
  } = useApp();

  const [selectedProductId, setSelectedProductId] = useState<string>(
    transferTargetProduct?.id || products[0]?.id || ''
  );
  const [direction, setDirection] = useState<'godam_to_dukan' | 'dukan_to_godam'>('godam_to_dukan');
  const [quantity, setQuantity] = useState<number>(5);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (transferTargetProduct) {
      setSelectedProductId(transferTargetProduct.id);
    }
  }, [transferTargetProduct]);

  const activeProduct: Product | undefined = products.find(p => p.id === selectedProductId) || products[0];

  const sourceStock = activeProduct
    ? direction === 'godam_to_dukan'
      ? activeProduct.godamStock
      : activeProduct.dukanStock
    : 0;

  const targetStock = activeProduct
    ? direction === 'godam_to_dukan'
      ? activeProduct.dukanStock
      : activeProduct.godamStock
    : 0;

  const afterSourceStock = Math.max(0, sourceStock - (quantity || 0));
  const afterTargetStock = targetStock + (quantity || 0);

  const handlePresetAdd = (amount: number) => {
    soundAndHaptics.playTap();
    setQuantity(prev => Math.min(sourceStock, Math.max(1, prev + amount)));
  };

  const handleMaxTransfer = () => {
    soundAndHaptics.playTap();
    setQuantity(sourceStock);
  };

  const handleDirectionToggle = () => {
    soundAndHaptics.playTap();
    setDirection(prev => (prev === 'godam_to_dukan' ? 'dukan_to_godam' : 'godam_to_dukan'));
    setQuantity(1);
    setErrorMsg(null);
  };

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    if (quantity <= 0) {
      setErrorMsg(t('कृपया सही मात्रा दर्ज करें', 'Please enter a valid quantity'));
      soundAndHaptics.playWarning();
      return;
    }
    if (quantity > sourceStock) {
      setErrorMsg(
        direction === 'godam_to_dukan'
          ? t(`गोदाम में केवल ${sourceStock} ${activeProduct.unit} उपलब्ध है`, `Godam has only ${sourceStock} ${activeProduct.unit}`)
          : t(`दुकान में केवल ${sourceStock} ${activeProduct.unit} उपलब्ध है`, `Shop has only ${sourceStock} ${activeProduct.unit}`)
      );
      soundAndHaptics.playWarning();
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const from = direction === 'godam_to_dukan' ? 'godam' : 'dukan';
      const to = direction === 'godam_to_dukan' ? 'dukan' : 'godam';

      await transferStock(activeProduct.id, quantity, from, to, note);
      setSuccessMsg(
        t(
          `${quantity} ${activeProduct.unit} सफलता से ट्रांसफर हुआ!`,
          `Successfully transferred ${quantity} ${activeProduct.unit}!`
        )
      );
      setTransferTargetProduct(null);
      setNote('');

      setTimeout(() => {
        setSuccessMsg(null);
      }, 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ट्रांसफर विफल रहा';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeProduct) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-stone-200">
        <p className="text-sm font-semibold text-stone-600">
          {t('कृपया पहले सामान जोड़ें', 'Please add products first')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Transfer Header Card */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl font-bold">
            🔄
          </div>
          <div>
            <h2 className="text-lg font-bold">
              {t('स्टॉक ट्रांसफर (Stock Transfer)', 'Stock Transfer')}
            </h2>
            <p className="text-xs text-amber-100">
              {direction === 'godam_to_dukan'
                ? t('गोदाम (वेयरहाउस) से दुकान काउंटर पर भेजें', 'Transfer warehouse stock to shop counter')
                : t('दुकान से वापस गोदाम में भेजें', 'Return shop stock to warehouse')}
            </p>
          </div>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-3 flex items-center space-x-2 text-xs font-semibold animate-pulse-soft">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 rounded-xl p-3 flex items-center space-x-2 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleExecuteTransfer} className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200/90 space-y-4">
        {/* Step 1: Select Product */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            {t('1. सामान चुनें (Select Product):', '1. Select Product:')}
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => {
              setSelectedProductId(e.target.value);
              setQuantity(1);
              setErrorMsg(null);
            }}
            className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>
                [{p.brand}] {p.name} - {p.modelSize} (गोदाम: {p.godamStock} | दुकान: {p.dukanStock} {p.unit})
              </option>
            ))}
          </select>

          {/* Active Product Details & Specs Card */}
          <div className="mt-2.5 p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <div className="flex items-center space-x-1.5 flex-wrap">
                <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                  {t('ब्रांड:', 'Brand:')} {activeProduct.brand}
                </span>
                <span className="text-[10px] font-bold text-stone-700 bg-stone-200 px-2 py-0.5 rounded-md">
                  {t('साइज:', 'Size:')} {activeProduct.modelSize}
                </span>
                <span className="text-[10px] text-stone-500 font-medium">
                  {activeProduct.category}
                </span>
              </div>
              <span className="text-[11px] font-extrabold text-stone-700 bg-white px-2 py-0.5 rounded border border-stone-200">
                {activeProduct.unit}
              </span>
            </div>

            {/* Quantities & Min-Stock Grid */}
            <div className="grid grid-cols-3 gap-1.5 text-center pt-1 border-t border-stone-200/70">
              <div className="bg-amber-100/60 p-1.5 rounded-lg border border-amber-200">
                <span className="text-[9px] font-bold text-amber-900 block">{t('🏢 गोदाम', 'Godam')}</span>
                <span className="text-xs font-black text-amber-950">{activeProduct.godamStock} {activeProduct.unit}</span>
              </div>
              <div className={`p-1.5 rounded-lg border ${
                activeProduct.dukanStock <= activeProduct.minStockAlert
                  ? 'bg-rose-100/80 border-rose-300 text-rose-900 font-bold'
                  : 'bg-emerald-100/60 border-emerald-200 text-emerald-950'
              }`}>
                <span className="text-[9px] font-bold block">{t('🏪 दुकान', 'Dukan')}</span>
                <span className="text-xs font-black">{activeProduct.dukanStock} {activeProduct.unit}</span>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-stone-200">
                <span className="text-[9px] text-stone-500 font-bold block">{t('⚠️ न्यूनतम', 'Min Level')}</span>
                <span className="text-xs font-black text-stone-800">{activeProduct.minStockAlert} {activeProduct.unit}</span>
              </div>
            </div>

            {/* Pricing info */}
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-200/70 text-stone-600">
              <span>
                {t('खरीद भाव:', 'Cost:')} <strong className="text-stone-900 font-bold">₹{activeProduct.purchasePrice}</strong>
              </span>
              <span>
                {t('बिक्री भाव:', 'Sale Price:')} <strong className="text-emerald-700 font-black">₹{activeProduct.sellingPrice}</strong> /{activeProduct.unit.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Direction Switcher Visual */}
        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
              {direction === 'godam_to_dukan' ? <Warehouse className="w-4 h-4" /> : <Store className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-[10px] text-stone-500 block font-medium">
                {t('स्रोत (From)', 'Source')}
              </span>
              <p className="text-xs font-bold text-stone-900">
                {direction === 'godam_to_dukan' ? t('🏢 गोदाम', 'Godam') : t('🏪 दुकान', 'Dukan')}
              </p>
              <span className="text-[10px] text-amber-800 font-semibold">
                {t('उपलब्ध:', 'Available:')} {sourceStock} {activeProduct.unit}
              </span>
            </div>
          </div>

          {/* Toggle Direction Button */}
          <button
            type="button"
            onClick={handleDirectionToggle}
            className="p-2 rounded-full bg-white active:bg-amber-100 text-amber-700 border border-stone-300 shadow-sm active:scale-90 transition-transform"
            title={t('दिशा बदलें', 'Change direction')}
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2 text-right">
            <div>
              <span className="text-[10px] text-stone-500 block font-medium">
                {t('गंतव्य (To)', 'Destination')}
              </span>
              <p className="text-xs font-bold text-stone-900">
                {direction === 'godam_to_dukan' ? t('🏪 दुकान', 'Dukan') : t('🏢 गोदाम', 'Godam')}
              </p>
              <span className="text-[10px] text-emerald-800 font-semibold">
                {t('वर्तमान:', 'Current:')} {targetStock} {activeProduct.unit}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              {direction === 'godam_to_dukan' ? <Store className="w-4 h-4" /> : <Warehouse className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {/* Step 2: Quantity Selection with Quick Buttons */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-stone-700">
              {t('2. ट्रांसफर मात्रा (Quantity):', '2. Transfer Quantity:')}
            </label>
            <span className="text-xs font-extrabold text-amber-700">
              {activeProduct.unit}
            </span>
          </div>

          <div className="relative">
            <input
              type="number"
              min="1"
              max={sourceStock}
              value={quantity || ''}
              onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full text-center py-3 bg-stone-50 border-2 border-amber-400 rounded-xl text-2xl font-black text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="0"
            />
          </div>

          {/* Quick preset chips */}
          <div className="grid grid-cols-5 gap-1.5 mt-2">
            {[1, 5, 10, 20].map(amt => (
              <button
                key={amt}
                type="button"
                onClick={() => handlePresetAdd(amt)}
                disabled={sourceStock < amt}
                className="py-1 px-1.5 bg-stone-100 active:bg-amber-200 disabled:opacity-40 text-stone-800 rounded-lg text-xs font-bold border border-stone-200"
              >
                +{amt}
              </button>
            ))}
            <button
              type="button"
              onClick={handleMaxTransfer}
              disabled={sourceStock === 0}
              className="py-1 px-1.5 bg-amber-100 active:bg-amber-300 text-amber-900 rounded-lg text-xs font-extrabold border border-amber-300"
            >
              {t('पूरा', 'All')}
            </button>
          </div>
        </div>

        {/* Step 3: Live Preview of Stock Changes */}
        <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
          <span className="text-[11px] font-bold text-amber-900 block mb-1">
            {t('ट्रांसफर के बाद नया स्टॉक (Live Preview):', 'Stock Preview After Transfer:')}
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2 rounded-lg border border-amber-200">
              <span className="text-[10px] text-stone-500 block">
                {direction === 'godam_to_dukan' ? t('🏢 गोदाम में बचेगा:', 'Godam will have:') : t('🏪 दुकान में बचेगी:', 'Dukan will have:')}
              </span>
              <p className="font-extrabold text-stone-800 text-sm">
                {afterSourceStock} {activeProduct.unit}
              </p>
            </div>

            <div className="bg-white p-2 rounded-lg border border-amber-200">
              <span className="text-[10px] text-emerald-700 block">
                {direction === 'godam_to_dukan' ? t('🏪 दुकान में हो जाएगी:', 'Dukan will become:') : t('🏢 गोदाम में हो जाएगा:', 'Godam will become:')}
              </span>
              <p className="font-extrabold text-emerald-800 text-sm">
                {afterTargetStock} {activeProduct.unit}
              </p>
            </div>
          </div>
        </div>

        {/* Optional Note / Remark */}
        <div>
          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
            {t('नोट / कारण (वैकल्पिक):', 'Note / Reason (Optional):')}
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('जैसे: काउंटर रीस्टॉक, खाली रैक', 'e.g. Counter restock')}
            className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Execute Transfer Button */}
        <button
          type="submit"
          disabled={isSubmitting || sourceStock <= 0 || quantity <= 0 || quantity > sourceStock}
          className="w-full py-3 bg-amber-600 active:bg-amber-700 disabled:bg-stone-300 text-white font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.99]"
        >
          {isSubmitting ? (
            <span>{t('ट्रांसफर हो रहा है...', 'Transferring...')}</span>
          ) : (
            <>
              <span>{t('अभी ट्रांसफर पुष्टि करें (Confirm)', 'Confirm Transfer Now')}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

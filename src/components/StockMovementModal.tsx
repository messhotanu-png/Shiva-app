import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { X, ArrowDownRight, ArrowUpRight, Warehouse, Store } from 'lucide-react';
import { soundAndHaptics } from '../utils/soundAndHaptics.ts';

export const StockMovementModal: React.FC = () => {
  const { movementModalConfig, closeMovementModal, recordStockMovement, t } = useApp();
  const { isOpen, product, type, defaultLocation } = movementModalConfig;

  const [location, setLocation] = useState<'godam' | 'dukan'>(defaultLocation || 'godam');
  const [quantity, setQuantity] = useState<number>(10);
  const [reason, setReason] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultLocation) {
      setLocation(defaultLocation);
    }
    if (type === 'IN') {
      setReason('थोक सप्लायर खरीद');
      setQuantity(20);
    } else {
      setReason('ग्राहक बिक्री / काउंटर सेल');
      setQuantity(1);
    }
    setError(null);
  }, [isOpen, defaultLocation, type]);

  if (!isOpen || !product) return null;

  const currentAvailableStock = location === 'godam' ? product.godamStock : product.dukanStock;

  const handlePresetAdd = (amount: number) => {
    soundAndHaptics.playTap();
    setQuantity(prev => Math.max(1, prev + amount));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setError(t('कृपया सही मात्रा दर्ज करें', 'Please enter a valid quantity'));
      soundAndHaptics.playWarning();
      return;
    }

    if (type === 'OUT' && quantity > currentAvailableStock) {
      setError(
        location === 'godam'
          ? t(`गोदाम में केवल ${currentAvailableStock} ${product.unit} है`, `Godam has only ${currentAvailableStock} ${product.unit}`)
          : t(`दुकान में केवल ${currentAvailableStock} ${product.unit} है`, `Shop has only ${currentAvailableStock} ${product.unit}`)
      );
      soundAndHaptics.playWarning();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await recordStockMovement(product.id, type, quantity, location, reason, note);
      closeMovementModal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'कार्रवाई असफल रही';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className={`px-4 py-3 text-white flex items-center justify-between ${
          type === 'IN' ? 'bg-emerald-800' : 'bg-rose-800'
        }`}>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black">
              {type === 'IN' ? <ArrowDownRight className="w-5 h-5 text-emerald-200" /> : <ArrowUpRight className="w-5 h-5 text-rose-200" />}
            </div>
            <div>
              <h3 className="text-sm font-bold">
                {type === 'IN' ? t('+ स्टॉक इन (माल आया)', '+ Stock In (Arrival)') : t('- स्टॉक आउट (माल निकला/बिका)', '- Stock Out (Sale/Removal)')}
              </h3>
              <p className="text-[10px] opacity-90">[{product.brand}] {product.name} ({product.modelSize})</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundAndHaptics.playTap();
              closeMovementModal();
            }}
            className="p-1.5 rounded-full hover:bg-black/20"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto flex-1">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Product Specifications Card */}
          <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 flex-wrap">
                <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                  {product.brand}
                </span>
                <span className="text-[10px] font-bold text-stone-700 bg-stone-200 px-2 py-0.5 rounded">
                  {product.modelSize}
                </span>
                <span className="text-[10px] text-stone-500 font-medium">
                  {product.category}
                </span>
              </div>
              <span className="text-[11px] font-bold text-stone-600">
                {product.unit}
              </span>
            </div>

            <h4 className="text-xs font-bold text-stone-900">{product.name}</h4>

            <div className="grid grid-cols-3 gap-1.5 text-center pt-1 border-t border-stone-200">
              <div className="bg-amber-100/50 p-1.5 rounded-lg border border-amber-200">
                <span className="text-[9px] font-bold text-amber-900 block">{t('🏢 गोदाम', 'Godam')}</span>
                <span className="text-xs font-black text-amber-950">{product.godamStock} {product.unit}</span>
              </div>
              <div className={`p-1.5 rounded-lg border ${
                product.dukanStock <= product.minStockAlert ? 'bg-rose-100/70 border-rose-300 font-bold' : 'bg-emerald-100/50 border-emerald-200'
              }`}>
                <span className="text-[9px] font-bold block">{t('🏪 दुकान', 'Dukan')}</span>
                <span className="text-xs font-black">{product.dukanStock} {product.unit}</span>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-stone-200">
                <span className="text-[9px] text-stone-500 font-bold block">{t('⚠️ न्यूनतम', 'Min')}</span>
                <span className="text-xs font-black text-stone-800">{product.minStockAlert} {product.unit}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 text-stone-600">
              <span>{t('खरीद भाव:', 'Cost:')} ₹{product.purchasePrice}</span>
              <span>{t('बिक्री भाव:', 'Sale Price:')} <strong className="text-emerald-700 font-bold">₹{product.sellingPrice}</strong> /{product.unit.split(' ')[0]}</span>
            </div>
          </div>

          {/* Location Picker: Godam vs Dukan */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              {t('कहाँ से / कहाँ माल दर्ज करना है?', 'Select Location:')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  soundAndHaptics.playTap();
                  setLocation('godam');
                }}
                className={`p-2.5 rounded-xl border flex items-center space-x-2 transition-all ${
                  location === 'godam'
                    ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold ring-2 ring-amber-300/40'
                    : 'bg-stone-50 border-stone-200 text-stone-600'
                }`}
              >
                <Warehouse className="w-4 h-4 text-amber-700" />
                <div className="text-left">
                  <span className="text-xs block">{t('🏢 गोदाम', 'Godam')}</span>
                  <span className="text-[10px] text-amber-800">
                    {product.godamStock} {product.unit} {t('मौजूद', 'avail')}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundAndHaptics.playTap();
                  setLocation('dukan');
                }}
                className={`p-2.5 rounded-xl border flex items-center space-x-2 transition-all ${
                  location === 'dukan'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-300/40'
                    : 'bg-stone-50 border-stone-200 text-stone-600'
                }`}
              >
                <Store className="w-4 h-4 text-emerald-700" />
                <div className="text-left">
                  <span className="text-xs block">{t('🏪 दुकान', 'Dukan')}</span>
                  <span className="text-[10px] text-emerald-800">
                    {product.dukanStock} {product.unit} {t('मौजूद', 'avail')}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-700">
                {t('मात्रा (Quantity):', 'Quantity:')}
              </label>
              <span className="text-xs font-bold text-stone-600">{product.unit}</span>
            </div>

            <input
              type="number"
              min="1"
              value={quantity || ''}
              onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className={`w-full text-center py-2.5 bg-stone-50 border-2 rounded-xl text-2xl font-black text-stone-900 focus:outline-none ${
                type === 'IN' ? 'border-emerald-400 focus:ring-emerald-500' : 'border-rose-400 focus:ring-rose-500'
              }`}
            />

            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {[1, 5, 10, 25].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handlePresetAdd(amt)}
                  className="py-1 px-1.5 bg-stone-100 active:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold border border-stone-200"
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Reason presets */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t('कारण / विवरण (Reason):', 'Reason:')}
            </label>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {(type === 'IN'
                ? ['कंपनी फैक्ट्री माल आया', 'थोक सप्लायर खरीद', 'इलेक्ट्रीशियन माल वापसी', 'स्टॉक सुधार']
                : ['इलेक्ट्रीशियन ठेकेदार बिक्री', 'काउंटर रिटेल ग्राहक बिक्री', 'डैमेज / टूटा सामान', 'साइट सप्लाई']
              ).map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    soundAndHaptics.playTap();
                    setReason(preset);
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium ${
                    reason === preset
                      ? 'bg-stone-800 text-white border-stone-800'
                      : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('कारण दर्ज करें...', 'Enter reason...')}
              className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900"
            />
          </div>

          {/* Note or Bill Number */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              {t('बिल नंबर या नोट (वैकल्पिक):', 'Bill No. / Note (Optional):')}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('उदा: बिल #234, मोहन ट्रेडर्स', 'e.g. Invoice #234')}
              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || quantity <= 0}
            className={`w-full py-3 text-white font-extrabold text-sm rounded-xl shadow-md transition-all active:scale-[0.99] ${
              type === 'IN'
                ? 'bg-emerald-700 active:bg-emerald-800 disabled:bg-stone-300'
                : 'bg-rose-700 active:bg-rose-800 disabled:bg-stone-300'
            }`}
          >
            {isSubmitting
              ? t('सहेजा जा रहा है...', 'Saving...')
              : type === 'IN'
              ? t('+ माल जोड़ें (Stock In Confirm)', '+ Confirm Stock In')
              : t('- माल घटाएं (Stock Out Confirm)', '- Confirm Stock Out')}
          </button>
        </form>
      </div>
    </div>
  );
};

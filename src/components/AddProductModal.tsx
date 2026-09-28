import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { UnitType } from '../types/inventory.ts';
import { X, Plus, Package, DollarSign, Warehouse, Store, AlertTriangle, Layers, Bookmark } from 'lucide-react';
import { soundAndHaptics } from '../utils/soundAndHaptics.ts';

const ELECTRICAL_UNITS: UnitType[] = [
  'पीस (Pcs)',
  'पैकेट (Pkt)',
  'बॉक्स (Box)',
  'लेंथ / पाइप (Length)',
  'बंडल (Bundle)',
  'मीटर (Meter)',
  'दर्जन (Dzn)',
  'सेट (Set)',
];

const ELECTRICAL_CATEGORIES = [
  'Switches (स्विच)',
  'Sockets (सॉकेट)',
  'Electrical pipes (इलेक्ट्रिकल पाइप)',
  'Electrical accessories (इलेक्ट्रिकल एक्सेसरीज)',
];

const POPULAR_BRANDS = [
  'Anchor Roma',
  'Havells',
  'GM Modular',
  'Precision',
  'Sudhakar',
  'Polycab',
  'Finolex',
  'Legrand',
  'Schneider',
  'Goldmedal',
];

export const AddProductModal: React.FC = () => {
  const { isAddModalOpen, setIsAddModalOpen, addNewProduct, t } = useApp();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Anchor Roma');
  const [customBrand, setCustomBrand] = useState('');
  const [modelSize, setModelSize] = useState('');
  const [category, setCategory] = useState(ELECTRICAL_CATEGORIES[0]);
  const [unit, setUnit] = useState<UnitType>('पीस (Pcs)');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');
  const [godamStock, setGodamStock] = useState<number | ''>('');
  const [dukanStock, setDukanStock] = useState<number | ''>('');
  const [minStockAlert, setMinStockAlert] = useState<number>(15);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAddModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('कृपया उत्पाद का नाम दर्ज करें', 'Please enter product name'));
      soundAndHaptics.playWarning();
      return;
    }

    const finalBrand = customBrand.trim() || brand;

    setIsSubmitting(true);
    setError(null);

    try {
      await addNewProduct({
        name: name.trim(),
        brand: finalBrand,
        modelSize: modelSize.trim() || 'Standard',
        category,
        unit,
        purchasePrice: Number(purchasePrice) || 0,
        sellingPrice: Number(sellingPrice) || 0,
        godamStock: Number(godamStock) || 0,
        dukanStock: Number(dukanStock) || 0,
        minStockAlert: Number(minStockAlert) || 10,
      });

      setIsAddModalOpen(false);
      setName('');
      setModelSize('');
      setCustomBrand('');
      setPurchasePrice('');
      setSellingPrice('');
      setGodamStock('');
      setDukanStock('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'उत्पाद जोड़ने में त्रुटि हुई';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-4 py-3 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
              <Package className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold">{t('नया इलेक्ट्रिकल सामान जोड़ें', 'Add Electrical Product')}</h3>
              <p className="text-[10px] text-emerald-200">{t('स्विच, सॉकेट, पाइप या एक्सेसरी दर्ज करें', 'Switches, Sockets, Pipes & Accessories')}</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundAndHaptics.playTap();
              setIsAddModalOpen(false);
            }}
            className="p-1.5 rounded-full hover:bg-emerald-700/60 active:scale-95 transition-colors"
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

          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t('सामान का नाम (Product Name)*', 'Product Name*')}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('उदा: 1-Way स्विच, 3-पिन सॉकेट, PVC पाइप...', 'e.g. 1-Way Modular Switch, PVC Conduit Pipe')}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Brand & Model/Size in 2 Columns */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center">
                <Bookmark className="w-3 h-3 text-amber-600 mr-1" />
                {t('ब्रांड (Brand)*', 'Brand*')}
              </label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold text-stone-900 focus:outline-none"
              >
                {POPULAR_BRANDS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
                <option value="अन्य / लोकल">{t('अन्य / लोकल', 'Other / Local')}</option>
              </select>
              {brand === 'अन्य / लोकल' && (
                <input
                  type="text"
                  placeholder={t('ब्रांड का नाम लिखें', 'Type brand name')}
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  className="w-full mt-1.5 p-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center">
                <Layers className="w-3 h-3 text-emerald-600 mr-1" />
                {t('मॉडल / साइज (Model/Size)*', 'Model / Size*')}
              </label>
              <input
                type="text"
                required
                value={modelSize}
                onChange={(e) => setModelSize(e.target.value)}
                placeholder={t('उदा: 6A, 16A, 20mm, 8-Mod...', 'e.g. 6A, 20mm, 8-Mod')}
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t('श्रेणी (Electrical Category)', 'Category')}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {ELECTRICAL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Unit selection */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              {t('इकाई (Unit)*', 'Unit*')}
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {ELECTRICAL_UNITS.map(u => (
                <button
                  type="button"
                  key={u}
                  onClick={() => {
                    soundAndHaptics.playTap();
                    setUnit(u);
                  }}
                  className={`py-1.5 px-1 text-[11px] font-bold rounded-xl border transition-all truncate text-center ${
                    unit === u
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing: Purchase & Selling Price */}
          <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center">
                <DollarSign className="w-3 h-3 text-stone-500 mr-0.5" />
                {t('खरीद भाव (Cost Price)', 'Cost Price')}
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-xs font-bold text-stone-500">₹</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="0"
                  className="w-full pl-6 pr-2 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-emerald-800 mb-1 flex items-center">
                <DollarSign className="w-3 h-3 text-emerald-600 mr-0.5" />
                {t('बिक्री भाव (Selling/MRP)', 'Selling Price')}
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-xs font-bold text-emerald-700">₹</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="0"
                  className="w-full pl-6 pr-2 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-emerald-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Quantities: Godam Quantity & Dukan Quantity */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200">
              <label className="block text-[11px] font-bold text-amber-900 mb-1 flex items-center">
                <Warehouse className="w-3.5 h-3.5 mr-1 text-amber-700" />
                {t('गोदाम क्वांटिटी (Godam)', 'Godam Quantity')}
              </label>
              <input
                type="number"
                min="0"
                value={godamStock}
                onChange={(e) => setGodamStock(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                placeholder="0"
                className="w-full p-2 bg-white border border-amber-300 rounded-lg text-sm font-extrabold text-stone-900 focus:outline-none"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <label className="block text-[11px] font-bold text-emerald-900 mb-1 flex items-center">
                <Store className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                {t('दुकान क्वांटिटी (Dukan)', 'Dukan Quantity')}
              </label>
              <input
                type="number"
                min="0"
                value={dukanStock}
                onChange={(e) => setDukanStock(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                placeholder="0"
                className="w-full p-2 bg-white border border-emerald-300 rounded-lg text-sm font-extrabold text-stone-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Minimum-Stock Level */}
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <div>
                <span className="text-xs font-bold text-stone-800 block">
                  {t('कम-स्टॉक सीमा (Minimum-Stock Level):', 'Minimum-Stock Level:')}
                </span>
                <span className="text-[10px] text-stone-500">
                  {t('दुकान में इससे कम होने पर अलर्ट आएगा', 'Alerts when shop stock drops below this')}
                </span>
              </div>
            </div>

            <div className="w-20">
              <input
                type="number"
                min="1"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full text-center p-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold text-stone-900"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center space-x-2 transition-transform active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>{isSubmitting ? t('सुरक्षित हो रहा है...', 'Saving...') : t('इलेक्ट्रिकल सामान सुरक्षित करें', 'Save Electrical Item')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

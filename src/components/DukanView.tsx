import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Product } from '../types/inventory.ts';
import { Store, Search, AlertTriangle, ArrowLeftRight, MinusCircle, ShoppingBag, Bookmark, Layers } from 'lucide-react';
import { soundAndHaptics } from '../utils/soundAndHaptics.ts';

export const DukanView: React.FC = () => {
  const {
    products,
    stats,
    categories,
    selectedCategory,
    setSelectedCategory,
    brands,
    setActiveTab,
    setTransferTargetProduct,
    openMovementModal,
    quickSellDukan,
    t,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [sellingId, setSellingId] = useState<string | null>(null);

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.modelSize.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());

    const matchesCat =
      selectedCategory === 'all' ||
      p.category.toLowerCase().includes(selectedCategory.toLowerCase().split(' ')[0]);

    const matchesBrand = selectedBrand === 'all' || p.brand === selectedBrand;
    return matchesSearch && matchesCat && matchesBrand;
  });

  const handleQuickSale = async (product: Product, qty: number) => {
    if (product.dukanStock < qty) {
      soundAndHaptics.playWarning();
      return;
    }
    setSellingId(product.id);
    try {
      await quickSellDukan(product.id, qty);
    } catch {
      // Handled in context
    } finally {
      setSellingId(null);
    }
  };

  const handleRestockFromGodam = (product: Product) => {
    soundAndHaptics.playTap();
    setTransferTargetProduct(product);
    setActiveTab('transfer');
  };

  return (
    <div className="space-y-3.5 pb-24">
      {/* Top Dukan Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-stone-900 rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center text-xl">
              🏪
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {t('दुकान काउंटर (Shop Counter)', 'Dukan Counter')}
              </h2>
              <p className="text-xs text-emerald-200">
                {t('स्विच, सॉकेट, कंड्यूट पाइप व फिटिंग बिक्री', 'Fast Sales & Electrician Billing')}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-black text-emerald-300">
              {stats?.totalDukanUnits || 0}
            </p>
            <span className="text-[10px] text-emerald-100 font-medium">
              {t('दुकान कुल क्वांटिटी', 'Dukan Quantity')}
            </span>
          </div>
        </div>

        {/* Low Stock Warning Alert */}
        {(stats?.lowStockItemsCount || 0) > 0 && (
          <div className="mt-3 pt-3 border-t border-emerald-600/40 flex items-center justify-between text-xs bg-rose-950/40 -mx-1 px-3 py-1.5 rounded-lg border border-rose-500/30">
            <span className="flex items-center text-rose-300 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-400 animate-pulse" />
              {stats?.lowStockItemsCount} {t('इलेक्ट्रिकल सामान में कम-स्टॉक अलर्ट!', 'items low in shop stock!')}
            </span>
            <button
              onClick={() => {
                soundAndHaptics.playTap();
                setActiveTab('transfer');
              }}
              className="text-amber-300 font-bold underline text-[11px]"
            >
              {t('गोदाम से लाएं ➔', 'Restock Now ➔')}
            </button>
          </div>
        )}
      </div>

      {/* Search & 4 Electrical Categories Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('स्विच, सॉकेट, पाइप, ब्रांड या साइज खोजें...', 'Search Switch, Socket, Pipe, Brand...')}
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-xs text-stone-400 font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* 4 Focused Categories Horizontal Scroll */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => {
              soundAndHaptics.playTap();
              setSelectedCategory('all');
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white text-stone-600 border border-stone-200'
            }`}
          >
            {t('सभी (All)', 'All Items')} ({products.length})
          </button>
          {categories.map(cat => {
            const count = products.filter(p => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => {
                  soundAndHaptics.playTap();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Brand filter row */}
        {brands.length > 0 && (
          <div className="flex space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
            <span className="text-stone-400 self-center text-[10px] pl-1">{t('ब्रांड:', 'Brand:')}</span>
            <button
              onClick={() => {
                soundAndHaptics.playTap();
                setSelectedBrand('all');
              }}
              className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap ${
                selectedBrand === 'all' ? 'bg-stone-800 text-white' : 'bg-stone-200/80 text-stone-700'
              }`}
            >
              {t('सभी ब्रांड', 'All Brands')}
            </button>
            {brands.map(b => (
              <button
                key={b}
                onClick={() => {
                  soundAndHaptics.playTap();
                  setSelectedBrand(b);
                }}
                className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap ${
                  selectedBrand === b ? 'bg-stone-800 text-white' : 'bg-stone-200/80 text-stone-700'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product List */}
      <div className="space-y-2.5">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 text-stone-500">
            <Store className="w-10 h-10 mx-auto text-stone-300 mb-2" />
            <p className="text-sm font-semibold">{t('कोई सामान नहीं मिला', 'No items found')}</p>
          </div>
        ) : (
          filteredProducts.map(product => {
            const isLowStock = product.dukanStock <= product.minStockAlert;
            const isOut = product.dukanStock <= 0;

            return (
              <div
                key={product.id}
                className={`bg-white rounded-2xl p-3.5 shadow-sm border transition-all ${
                  isOut
                    ? 'border-rose-300 bg-rose-50/20'
                    : isLowStock
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : 'border-stone-200/90'
                }`}
              >
                {/* Header: Brand, Size, Category */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      {/* Brand */}
                      <span className="text-[10px] font-extrabold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md inline-flex items-center">
                        <Bookmark className="w-3 h-3 mr-0.5 text-emerald-700" />
                        {t('ब्रांड:', 'Brand:')} {product.brand}
                      </span>

                      {/* Size / Model */}
                      <span className="text-[10px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md inline-flex items-center">
                        <Layers className="w-3 h-3 mr-0.5 text-stone-500" />
                        {t('साइज:', 'Size:')} {product.modelSize}
                      </span>

                      {/* Category */}
                      <span className="text-[10px] text-stone-500 font-medium">
                        {product.category.split(' ')[0]}
                      </span>

                      {isLowStock && (
                        <span className="text-[10px] font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-0.5" />
                          {t('लो-स्टॉक चेतावनी!', 'Low-Stock Alert!')}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-stone-900 leading-snug">
                      {product.name}
                    </h3>
                  </div>

                  {/* Quick Restock if Godam has stock */}
                  <div>
                    {product.godamStock > 0 && isLowStock && (
                      <button
                        onClick={() => handleRestockFromGodam(product)}
                        className="px-2.5 py-1 bg-amber-500 active:bg-amber-600 text-stone-900 rounded-lg text-[10px] font-extrabold shadow-sm flex items-center space-x-1"
                        title={t('गोदाम से दुकान लाएं', 'Transfer from warehouse')}
                      >
                        <ArrowLeftRight className="w-3 h-3" />
                        <span>{t('मंगाएं', 'Restock')}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 3 Quantities Specification Grid */}
                <div className="grid grid-cols-3 gap-2 mt-2.5 text-xs">
                  {/* Dukan Quantity */}
                  <div className={`p-2 rounded-xl text-center border ${
                    isOut
                      ? 'bg-rose-100 border-rose-300 text-rose-900'
                      : isLowStock
                      ? 'bg-amber-100 border-amber-300 text-amber-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}>
                    <span className="text-[10px] font-bold block">
                      {t('🏪 दुकान क्वांटिटी', 'Dukan Quantity')}
                    </span>
                    <p className="text-base font-black mt-0.5">
                      {product.dukanStock}
                    </p>
                    <span className="text-[10px] opacity-75">{product.unit}</span>
                  </div>

                  {/* Godam Quantity */}
                  <div className="bg-stone-50 border border-stone-200 p-2 rounded-xl text-center">
                    <span className="text-[10px] text-stone-600 font-bold block">
                      {t('🏢 गोदाम बैकअप', 'Godam Backup')}
                    </span>
                    <p className="text-base font-black text-stone-800 mt-0.5">
                      {product.godamStock}
                    </p>
                    <span className="text-[10px] text-stone-500">{product.unit}</span>
                  </div>

                  {/* Minimum Stock Level */}
                  <div className="bg-stone-50 border border-stone-200 p-2 rounded-xl text-center">
                    <span className="text-[10px] text-stone-600 font-bold block">
                      {t('⚠️ न्यूनतम सीमा', 'Min Level')}
                    </span>
                    <p className="text-base font-black text-stone-800 mt-0.5">
                      {product.minStockAlert}
                    </p>
                    <span className="text-[10px] text-stone-500">{product.unit}</span>
                  </div>
                </div>

                {/* Pricing: Purchase & Sale Price */}
                <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-600">
                    {t('बिक्री भाव (Sale Price):', 'Sale Price:')} <strong className="text-emerald-700 text-sm font-extrabold">₹{product.sellingPrice}</strong> /{product.unit.split(' ')[0]}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {t('खरीद भाव:', 'Cost:')} ₹{product.purchasePrice}
                  </span>
                </div>

                {/* 1-Tap Quick Sale Buttons */}
                <div className="mt-2.5 pt-2 border-t border-stone-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-stone-600 flex items-center">
                      <ShoppingBag className="w-3 h-3 mr-1 text-stone-500" />
                      {t('काउंटर बिक्री दर्ज करें (Fast Sale):', 'Fast Sale:')}
                    </span>

                    <button
                      onClick={() => {
                        soundAndHaptics.playTap();
                        openMovementModal(product, 'OUT', 'dukan');
                      }}
                      className="text-[11px] text-stone-500 hover:text-stone-800 underline"
                    >
                      {t('अन्य मात्रा...', 'Custom qty...')}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    {/* -1 Unit Sale */}
                    <button
                      onClick={() => handleQuickSale(product, 1)}
                      disabled={product.dukanStock < 1 || sellingId === product.id}
                      className={`flex items-center justify-center space-x-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all active:scale-95 ${
                        product.dukanStock >= 1
                          ? 'bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-800 border border-rose-300 shadow-sm'
                          : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                      }`}
                    >
                      <MinusCircle className="w-4 h-4 text-rose-600" />
                      <span>-1 {t('बिका', 'Sold')}</span>
                    </button>

                    {/* -5 Unit Sale */}
                    <button
                      onClick={() => handleQuickSale(product, 5)}
                      disabled={product.dukanStock < 5 || sellingId === product.id}
                      className={`flex items-center justify-center space-x-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all active:scale-95 ${
                        product.dukanStock >= 5
                          ? 'bg-rose-600 active:bg-rose-700 text-white shadow-sm'
                          : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                      }`}
                    >
                      <MinusCircle className="w-4 h-4" />
                      <span>-5 {t('बिका', 'Sold')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

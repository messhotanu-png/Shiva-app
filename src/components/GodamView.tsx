import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Product } from '../types/inventory.ts';
import { Warehouse, Search, PlusCircle, ArrowRight, ArrowDownRight, Bookmark, Layers, AlertTriangle, ShieldCheck } from 'lucide-react';
import { soundAndHaptics } from '../utils/soundAndHaptics.ts';

export const GodamView: React.FC = () => {
  const {
    products,
    stats,
    currentUser,
    categories,
    selectedCategory,
    setSelectedCategory,
    brands,
    setActiveTab,
    setTransferTargetProduct,
    openMovementModal,
    setIsAddModalOpen,
    t,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');

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

  const handleTransferClick = (product: Product) => {
    soundAndHaptics.playTap();
    setTransferTargetProduct(product);
    setActiveTab('transfer');
  };

  const handleStockInClick = (product: Product) => {
    soundAndHaptics.playTap();
    openMovementModal(product, 'IN', 'godam');
  };

  return (
    <div className="space-y-3.5 pb-24">
      {/* Top Godam Header Card */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-stone-800 rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/30 border border-amber-400/40 flex items-center justify-center text-xl">
              🏢
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {t('गोदाम इन्वेंट्री (Warehouse Stock)', 'Godam Warehouse Stock')}
              </h2>
              <p className="text-xs text-amber-200">
                {t('स्विच, सॉकेट, पाइप व एक्सेसरीज थोक माल', 'Switches, Sockets, Pipes & Accessories')}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-black text-amber-300">
              {stats?.totalGodamUnits || 0}
            </p>
            <span className="text-[10px] text-amber-100 font-medium">
              {t('कुल गोदाम क्वांटिटी', 'Godam Quantity')}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-amber-600/40 flex items-center justify-between">
          <span className="text-xs text-amber-100">
            {t('कुल इलेक्ट्रिकल सामान:', 'Total Products:')} <strong className="text-white">{products.length}</strong>
          </span>
          <button
            onClick={() => {
              soundAndHaptics.playTap();
              setIsAddModalOpen(true);
            }}
            className="flex items-center space-x-1 px-3 py-1 bg-amber-400 active:bg-amber-500 text-stone-900 text-xs font-bold rounded-lg shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t('+ नया सामान जोड़ें', '+ Add Item')}</span>
          </button>
        </div>
      </div>

      {/* Search & 4 Electrical Categories Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('स्विच, सॉकेट, पाइप, ब्रांड या साइज खोजें...', 'Search Switch, Socket, Pipe, Brand, Size...')}
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
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
                ? 'bg-amber-800 text-white shadow-sm'
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
                    ? 'bg-amber-800 text-white shadow-sm'
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
            <Warehouse className="w-10 h-10 mx-auto text-stone-300 mb-2" />
            <p className="text-sm font-semibold">{t('कोई सामान नहीं मिला', 'No electrical items found')}</p>
            <p className="text-xs text-stone-400 mt-1">{t('फिल्टर बदलकर देखें', 'Try changing your filter')}</p>
          </div>
        ) : (
          filteredProducts.map(product => {
            const hasStock = product.godamStock > 0;
            const isDukanLow = product.dukanStock <= product.minStockAlert;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-3.5 shadow-sm border border-stone-200/90 relative overflow-hidden"
              >
                {/* Header: Name, Brand, Size/Model */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      {/* Brand */}
                      <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md inline-flex items-center">
                        <Bookmark className="w-3 h-3 mr-0.5 text-amber-700" />
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
                    </div>

                    <h3 className="text-sm font-bold text-stone-900 leading-snug">
                      {product.name}
                    </h3>
                  </div>

                  {/* Stock Availability Pill */}
                  <div>
                    {!hasStock ? (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full border border-rose-200">
                        {t('गोदाम खाली', 'Empty')}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200 flex items-center">
                        <ShieldCheck className="w-3 h-3 mr-0.5" />
                        {t('उपलब्ध', 'Available')}
                      </span>
                    )}
                  </div>
                </div>

                {/* 4 Quantities / Levels Specification Grid */}
                <div className="grid grid-cols-3 gap-2 mt-2.5 text-xs">
                  {/* Godam Quantity */}
                  <div className="bg-amber-50 border border-amber-200 p-2 rounded-xl text-center">
                    <span className="text-[10px] text-amber-800 font-bold block">
                      {t('🏢 गोदाम क्वांटिटी', 'Godam Quantity')}
                    </span>
                    <p className="text-base font-black text-amber-950 mt-0.5">
                      {product.godamStock}
                    </p>
                    <span className="text-[10px] text-stone-500">{product.unit}</span>
                  </div>

                  {/* Dukan Quantity */}
                  <div className={`p-2 rounded-xl text-center border ${
                    isDukanLow ? 'bg-rose-50 border-rose-300 text-rose-950' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  }`}>
                    <span className="text-[10px] font-bold block flex items-center justify-center">
                      {isDukanLow && <AlertTriangle className="w-2.5 h-2.5 mr-0.5 text-rose-600" />}
                      {t('🏪 दुकान क्वांटिटी', 'Dukan Quantity')}
                    </span>
                    <p className="text-base font-black mt-0.5">
                      {product.dukanStock}
                    </p>
                    <span className="text-[10px] opacity-75">{product.unit}</span>
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

                {/* Pricing: Purchase Price & Sale Price */}
                <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3 text-[11px]">
                    {currentUser.role === 'owner' && (
                      <span className="text-stone-600">
                        {t('खरीद भाव:', 'Cost:')} <strong className="text-stone-900 font-bold">₹{product.purchasePrice}</strong>
                      </span>
                    )}
                    <span className="text-stone-600">
                      {t('बिक्री भाव:', 'Sale Price:')} <strong className="text-emerald-700 font-extrabold">₹{product.sellingPrice}</strong> /{product.unit.split(' ')[0]}
                    </span>
                  </div>

                  {isDukanLow && (
                    <span className="text-[10px] font-extrabold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                      {t('दुकान में कमी!', 'Shop Low!')}
                    </span>
                  )}
                </div>

                {/* Action Buttons: Stock In (+) & Transfer to Dukan (->) */}
                <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-stone-100">
                  <button
                    onClick={() => handleStockInClick(product)}
                    className="flex items-center justify-center space-x-1.5 py-1.5 px-2 bg-stone-100 active:bg-amber-100 text-stone-800 active:text-amber-900 rounded-xl text-xs font-bold border border-stone-200 transition-colors"
                  >
                    <ArrowDownRight className="w-3.5 h-3.5 text-amber-700" />
                    <span>{t('+ माल आया (IN)', '+ Stock In')}</span>
                  </button>

                  <button
                    onClick={() => handleTransferClick(product)}
                    disabled={!hasStock}
                    className={`flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-colors ${
                      hasStock
                        ? 'bg-amber-600 active:bg-amber-700 text-white shadow-sm'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    <span>{t('दुकान भेजें ➔', 'Send to Dukan ➔')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

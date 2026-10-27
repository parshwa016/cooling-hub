import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Scale, Heart, ShoppingCart, 
  SlidersHorizontal, Check, RefreshCw 
} from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import RatingStars from '../components/RatingStars';
import ProductCompareModal from '../components/ProductCompareModal';
import LuxurySelect from '../components/LuxurySelect';

export default function Shop({ setActiveTab, onSelectProduct }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brandFilter, setBrandFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [starFilter, setStarFilter] = useState(0);
  const [tonnageFilter, setTonnageFilter] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const { addToCart, wishlist, toggleWishlist, compareItems, toggleCompare } = useCart();

  const brands = ['All', 'Daikin', 'LG', 'Voltas', 'Blue Star', 'Lloyd', 'Panasonic', 'Mitsubishi'];
  const acTypes = ['All', 'Split', 'Window'];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (brandFilter !== 'All') params.brand = brandFilter;
      if (typeFilter !== 'All') params.ac_type = typeFilter;
      if (starFilter > 0) params.star_rating = starFilter;
      if (tonnageFilter > 0) params.tonnage = tonnageFilter;
      if (searchQuery) params.search = searchQuery;
      if (sortBy) params.sort_by = sortBy;

      const data = await api.getProducts(params);
      setProducts(data);
    } catch (e) {
      console.error("Failed to load products", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [brandFilter, typeFilter, starFilter, tonnageFilter, searchQuery, sortBy]);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Compare Floating Banner */}
      {compareItems.length > 0 && (
        <div className="sticky top-20 z-30 w-full">
          <div className="bg-[#111111] text-white p-4 rounded-2xl shadow-xl border border-[#C8A96B]/30 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Scale className="w-5 h-5 text-[#C8A96B] animate-bounce" />
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white">AC Comparison Mode Active</h4>
                <p className="text-xs text-[#E2E0DB]">Selected: {compareItems.map(i => i.title).join(', ')}</p>
              </div>
            </div>
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="btn-emerald-secondary px-4 py-2 text-xs sm:text-sm font-bold"
            >
              Compare Side-by-Side ({compareItems.length})
            </button>
          </div>
        </div>
      )}

      {/* Top Search & Header */}
      <div className="bg-white dark:bg-[#1A1A1A] p-6 sm:p-8 rounded-3xl border border-[#E2E0DB] dark:border-[#2E2E2E] shadow-sm">
        <div className="w-full space-y-4">
          <h1 className="text-3xl sm:text-4xl font-black text-[#111111] dark:text-white flex items-center space-x-3">
            <ShoppingCart className="w-8 h-8 text-[#C8A96B]" />
            <span>AC Shopping Store</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] dark:text-[#858585]">
            Browse genuine multi-brand Inverter & Window ACs with official warranty, free installation kit, and zero cost EMI options.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="w-4.5 h-4.5 text-[#555555] absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by brand, tonnage, features (e.g. Daikin, 5-Star, Dew Clean)..."
                className="w-full pl-10 pr-4 py-3 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#2E2E2E] rounded-2xl text-sm text-[#111111] dark:text-white placeholder-[#858585] focus:outline-none focus:ring-2 focus:ring-[#C8A96B]"
              />
            </div>
            
            <div className="w-full sm:w-60">
              <LuxurySelect
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={[
                  { value: 'popular', label: 'Sort: Most Popular' },
                  { value: 'price_low', label: 'Sort: Price Low to High' },
                  { value: 'price_high', label: 'Sort: Price High to Low' },
                  { value: 'rating', label: 'Sort: Highest Rating' }
                ]}
                className="py-3 px-4 rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Filter Controls */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] p-5 rounded-2xl border border-[#E2E0DB] dark:border-[#2E2E2E] space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E2E0DB] dark:border-[#2E2E2E] pb-3">
              <h3 className="font-bold text-sm text-[#111111] dark:text-white flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-[#C8A96B]" />
                <span>Filters</span>
              </h3>
              <button
                onClick={() => {
                  setBrandFilter('All');
                  setTypeFilter('All');
                  setStarFilter(0);
                  setTonnageFilter(0);
                  setSearchQuery('');
                }}
                className="text-[11px] font-bold text-[#111111] dark:text-[#C8A96B] hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-xs font-bold text-[#111111] dark:text-white mb-2">Brand</label>
              <div className="flex flex-wrap gap-1.5">
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setBrandFilter(b)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      brandFilter === b
                        ? 'bg-[#111111] text-white shadow-sm'
                        : 'bg-[#F7F6F2] dark:bg-[#252525] text-[#555555] dark:text-[#858585] border border-[#E2E0DB] dark:border-[#2E2E2E] hover:bg-[#FAF7F0]'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* AC Type */}
            <div>
              <label className="block text-xs font-bold text-[#111111] dark:text-white mb-2">AC Type</label>
              <div className="flex gap-2">
                {acTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition ${
                      typeFilter === t
                        ? 'bg-[#111111] text-white shadow-sm'
                        : 'bg-[#F7F6F2] dark:bg-[#252525] text-[#555555] dark:text-[#858585] border border-[#E2E0DB] dark:border-[#2E2E2E] hover:bg-[#FAF7F0]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Star Rating */}
            <div>
              <label className="block text-xs font-bold text-[#111111] dark:text-white mb-2">Star Rating</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setStarFilter(star)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition ${
                      starFilter === star
                        ? 'bg-[#111111] text-white shadow-sm'
                        : 'bg-[#F7F6F2] dark:bg-[#252525] text-[#555555] dark:text-[#858585] border border-[#E2E0DB] dark:border-[#2E2E2E] hover:bg-[#FAF7F0]'
                    }`}
                  >
                    {star === 0 ? 'All' : `${star}★`}
                  </button>
                ))}
              </div>
            </div>

            {/* Tonnage */}
            <div>
              <label className="block text-xs font-bold text-[#111111] dark:text-white mb-2">Cooling Tonnage</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 1.0, 1.5, 2.0].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTonnageFilter(t)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition ${
                      tonnageFilter === t
                        ? 'bg-[#111111] text-white shadow-sm'
                        : 'bg-[#F7F6F2] dark:bg-[#252525] text-[#555555] dark:text-[#858585] border border-[#E2E0DB] dark:border-[#2E2E2E] hover:bg-[#FAF7F0]'
                    }`}
                  >
                    {t === 0 ? 'All' : `${t}T`}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="lg:col-span-9 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-[#555555] space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin text-[#C8A96B]" />
              <span>Fetching AC products...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white dark:bg-[#1A1A1A] p-12 text-center rounded-2xl border border-[#E2E0DB] dark:border-[#2E2E2E] space-y-3">
              <p className="text-[#555555] font-semibold">No AC products found matching your filter criteria.</p>
              <button
                onClick={() => { setBrandFilter('All'); setTypeFilter('All'); setStarFilter(0); setTonnageFilter(0); setSearchQuery(''); }}
                className="btn-emerald-primary px-4 py-2 text-xs"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {products.map((p) => {
                const isWishlisted = wishlist.some((w) => w.id === p.id);
                const isCompared = compareItems.some((c) => c.id === p.id);

                return (
                  <div 
                    key={p.id}
                    className="product-card-premium group flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-52 sm:h-56 overflow-hidden bg-[#F7F6F2] dark:bg-[#252525]">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = '/images/products/daikin_split.jpg'; }}
                        />
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10 pointer-events-none">
                          <span className="px-2.5 py-1 bg-white/95 dark:bg-[#1A1A1A]/95 border border-[#E2E0DB] text-[#111111] dark:text-[#C8A96B] font-extrabold text-[10px] rounded-full shadow-sm">
                            ★ {p.star_rating} Star {p.is_inverter ? 'Inverter' : 'Fixed'}
                          </span>
                          {p.badge && (
                            <span className="px-2 py-0.5 bg-[#111111] text-[#C8A96B] font-bold text-[9px] rounded-md shadow-sm uppercase tracking-wider">
                              {p.badge}
                            </span>
                          )}
                        </div>

                        {/* Top Action Icons */}
                        <div className="absolute top-3 right-3 flex space-x-1.5">
                          <button
                            onClick={() => toggleWishlist(p)}
                            className={`p-2 rounded-full text-xs font-bold transition shadow-sm ${
                              isWishlisted 
                                ? 'bg-rose-500 text-white' 
                                : 'bg-white/90 dark:bg-[#1A1A1A]/90 text-[#111111] dark:text-[#F7F6F2] hover:bg-[#FAF7F0]'
                            }`}
                            title="Wishlist"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
                          </button>
                          
                          <button
                            onClick={() => toggleCompare(p)}
                            className={`p-2 rounded-full text-xs font-bold transition shadow-sm ${
                              isCompared 
                                ? 'bg-[#111111] text-white' 
                                : 'bg-white/90 dark:bg-[#1A1A1A]/90 text-[#111111] dark:text-[#F7F6F2] hover:bg-[#FAF7F0]'
                            }`}
                            title="Compare AC"
                          >
                            <Scale className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold text-[#C8A96B] tracking-wider uppercase">
                              {p.brand} • {p.tonnage} Ton
                            </span>
                            <span className="text-[10px] font-bold text-[#555555]">ISEER {p.iseer_rating}</span>
                          </div>

                          <h3 
                            onClick={() => { onSelectProduct(p.id); setActiveTab('product_detail'); }}
                            className="font-bold text-sm sm:text-base text-[#111111] dark:text-[#F7F6F2] line-clamp-2 cursor-pointer hover:text-[#C8A96B] transition mt-0.5"
                          >
                            {p.title}
                          </h3>

                          <p className="text-xs text-[#555555] line-clamp-1 mt-1">{p.features}</p>
                          
                          <div className="mt-2">
                            <RatingStars rating={p.rating} count={p.reviews_count} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 pt-0">
                      <div className="pt-3 border-t border-[#E2E0DB] dark:border-[#2E2E2E] flex items-center justify-between">
                        <div>
                          <span className="text-xs text-[#555555] line-through">₹{p.original_price.toLocaleString()}</span>
                          <h4 className="text-base sm:text-lg font-black text-[#111111] dark:text-white">₹{p.price.toLocaleString()}</h4>
                        </div>
                        <button
                          onClick={() => addToCart(p)}
                          className="btn-emerald-primary px-4 py-2 text-xs sm:text-sm font-bold flex items-center space-x-1"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                          <span>Buy</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      <ProductCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
      />

    </div>
  );
}

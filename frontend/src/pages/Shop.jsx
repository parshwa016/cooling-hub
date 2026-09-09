import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Scale, Heart, ShoppingCart, 
  SlidersHorizontal, Check, RefreshCw 
} from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import RatingStars from '../components/RatingStars';
import ProductCompareModal from '../components/ProductCompareModal';

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
        <div className="sticky top-20 z-30 max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-indigo-700/50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Scale className="w-5 h-5 text-indigo-400 animate-bounce" />
              <div>
                <h4 className="font-bold text-xs">AC Comparison Mode Active</h4>
                <p className="text-[11px] text-slate-300">Selected: {compareItems.map(i => i.title).join(', ')}</p>
              </div>
            </div>
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-4 py-2 bg-indigo-500 text-white font-bold rounded-xl text-xs hover:bg-indigo-600 transition shadow"
            >
              Compare Side-by-Side ({compareItems.length})
            </button>
          </div>
        </div>
      )}

      {/* Top Search & Header */}
      <div className="bg-gradient-to-b from-cool-50 to-white dark:from-slate-900 dark:to-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">🛒 AC Shopping Store</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Browse genuine multi-brand Inverter & Window ACs with official warranty, free installation kit, and zero cost EMI options.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by brand, tonnage, features (e.g. Daikin, 5-Star, Dew Clean)..."
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="popular">Sort: Most Popular</option>
              <option value="price_low">Sort: Price Low to High</option>
              <option value="price_high">Sort: Price High to Low</option>
              <option value="rating">Sort: Highest Rating</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Filter Controls */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-cyan-600" />
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
                className="text-[11px] font-bold text-cyan-600 hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Brand</label>
              <div className="flex flex-wrap gap-1.5">
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setBrandFilter(b)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      brandFilter === b
                        ? 'bg-cool-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* AC Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">AC Type</label>
              <div className="flex gap-2">
                {acTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition ${
                      typeFilter === t
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Star Rating */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Star Rating</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setStarFilter(star)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition ${
                      starFilter === star
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {star === 0 ? 'All' : `${star}★`}
                  </button>
                ))}
              </div>
            </div>

            {/* Tonnage */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Cooling Tonnage</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 1.0, 1.5, 2.0].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTonnageFilter(t)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition ${
                      tonnageFilter === t
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
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
            <div className="flex items-center justify-center py-20 text-slate-400 space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin text-cyan-500" />
              <span>Fetching AC products...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <p className="text-slate-500 font-semibold">No AC products found matching your filter criteria.</p>
              <button
                onClick={() => { setBrandFilter('All'); setTypeFilter('All'); setStarFilter(0); setTonnageFilter(0); setSearchQuery(''); }}
                className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold hover:bg-cyan-700"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => {
                const isWishlisted = wishlist.some((w) => w.id === p.id);
                const isCompared = compareItems.some((c) => c.id === p.id);

                return (
                  <div 
                    key={p.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-cyan-500/50 transition-all flex flex-col group"
                  >
                    <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Badges */}
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded-full shadow">
                        ★ {p.star_rating} Star {p.is_inverter ? 'Inverter' : 'Fixed'}
                      </span>

                      {/* Top Action Icons */}
                      <div className="absolute top-3 right-3 flex space-x-1.5">
                        <button
                          onClick={() => toggleWishlist(p)}
                          className={`p-2 rounded-full text-xs font-bold transition shadow ${
                            isWishlisted ? 'bg-rose-500 text-white' : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 hover:bg-white'
                          }`}
                          title="Wishlist"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
                        </button>
                        
                        <button
                          onClick={() => toggleCompare(p)}
                          className={`p-2 rounded-full text-xs font-bold transition shadow ${
                            isCompared ? 'bg-indigo-600 text-white' : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 hover:bg-white'
                          }`}
                          title="Compare AC"
                        >
                          <Scale className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-cyan-600 dark:text-cyan-400 tracking-wider uppercase">
                            {p.brand} • {p.tonnage} Ton
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">ISEER {p.iseer_rating}</span>
                        </div>

                        <h3 
                          onClick={() => { onSelectProduct(p.id); setActiveTab('product_detail'); }}
                          className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 line-clamp-2 cursor-pointer hover:text-cyan-600 transition mt-0.5"
                        >
                          {p.title}
                        </h3>

                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{p.features}</p>
                        
                        <div className="mt-2">
                          <RatingStars rating={p.rating} count={p.reviews_count} />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-slate-400 line-through">₹{p.original_price.toLocaleString()}</span>
                          <h4 className="text-base font-black text-slate-900 dark:text-white">₹{p.price.toLocaleString()}</h4>
                        </div>
                        <button
                          onClick={() => addToCart(p)}
                          className="px-3.5 py-2 bg-cool-600 text-white rounded-xl text-xs font-bold hover:bg-cool-700 transition flex items-center space-x-1"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
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

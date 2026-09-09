import React, { useState, useEffect } from 'react';
import { 
  Star, ShoppingCart, Heart, Scale, ShieldCheck, 
  Zap, Volume2, Award, CheckCircle2, MessageSquare, ArrowLeft, RefreshCw 
} from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import RatingStars from '../components/RatingStars';

export default function ProductDetail({ productId, setActiveTab }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submitMsg, setSubmitMsg] = useState('');

  const { addToCart, wishlist, toggleWishlist, compareItems, toggleCompare } = useCart();

  useEffect(() => {
    if (productId) {
      setLoading(true);
      api.getProduct(productId)
        .then(res => setProduct(res))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [productId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;
    try {
      await api.addReview(productId, {
        user_name: reviewName,
        rating: reviewRating,
        title: reviewTitle || "Great AC!",
        comment: reviewComment
      });
      setSubmitMsg("Review submitted successfully! Thank you for your feedback.");
      setReviewName('');
      setReviewComment('');
      setReviewTitle('');
      // refresh product
      const updated = await api.getProduct(productId);
      setProduct(updated);
    } catch (e) {
      setSubmitMsg("Error submitting review");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 space-x-2">
        <RefreshCw className="w-6 h-6 animate-spin text-cyan-500" />
        <span>Loading product details...</span>
      </div>
    );
  }

  if (!product) return null;

  const isWishlisted = wishlist.some((w) => w.id === product.id);
  const isCompared = compareItems.some((c) => c.id === product.id);

  return (
    <div className="space-y-12 pb-16">
      
      {/* Back button */}
      <button
        onClick={() => setActiveTab('shop')}
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-cyan-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to AC Store</span>
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        
        {/* Left Column: Image Showcase */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 h-[380px] sm:h-[420px]">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-4 left-4 px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-full shadow">
              ★ {product.star_rating} Star {product.is_inverter ? 'Inverter' : 'Fixed Speed'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-cyan-50 dark:bg-slate-800/80 rounded-xl text-center border border-cyan-100 dark:border-slate-700">
              <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mx-auto mb-1" />
              <span className="block text-[10px] text-slate-400 font-bold uppercase">ISEER Rating</span>
              <span className="text-sm font-black text-slate-800 dark:text-slate-100">{product.iseer_rating}</span>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-slate-800/80 rounded-xl text-center border border-blue-100 dark:border-slate-700">
              <Volume2 className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Noise Level</span>
              <span className="text-sm font-black text-slate-800 dark:text-slate-100">{product.noise_level_db} dB</span>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-slate-800/80 rounded-xl text-center border border-emerald-100 dark:border-slate-700">
              <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Warranty</span>
              <span className="text-sm font-black text-slate-800 dark:text-slate-100">10 Yr Comp</span>
            </div>
          </div>
        </div>

        {/* Right Column: Specs & Purchase */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              {product.brand} • {product.ac_type} AC • {product.tonnage} Ton
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 leading-snug">
              {product.title}
            </h1>
            <div className="mt-2 flex items-center space-x-3">
              <RatingStars rating={product.rating} count={product.reviews_count} />
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>In Stock ({product.stock} units)</span>
              </span>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">₹{product.price.toLocaleString()}</span>
                <span className="text-xs text-slate-400 line-through">₹{product.original_price.toLocaleString()}</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">({product.discount_percent}% OFF)</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Inclusive of all taxes + Standard Express Delivery</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {product.description}
          </p>

          {/* Key Features Bullet List */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">Key Features & Technologies:</h4>
            <div className="flex flex-wrap gap-2">
              {(product.features || '').split(',').map((feat, idx) => (
                <span key={idx} className="px-3 py-1 bg-cyan-50 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 rounded-lg text-xs font-semibold border border-cyan-100 dark:border-slate-700">
                  ✓ {feat.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => addToCart(product)}
              className="flex-1 py-3.5 bg-gradient-to-r from-cool-600 to-cyan-600 text-white font-bold rounded-2xl shadow-lg hover:opacity-95 transition flex items-center justify-center space-x-2 text-xs sm:text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Shopping Cart</span>
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              className={`p-3.5 rounded-2xl border font-bold transition flex items-center space-x-1 text-xs ${
                isWishlisted 
                  ? 'bg-rose-500 text-white border-rose-500' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={() => toggleCompare(product)}
              className={`p-3.5 rounded-2xl border font-bold transition flex items-center space-x-1 text-xs ${
                isCompared 
                  ? 'bg-indigo-600 text-white border-indigo-600' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
              }`}
            >
              <Scale className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Review Section */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
        <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-cyan-600" />
          <span>Customer Reviews & Ratings ({product.reviews_count})</span>
        </h3>

        {/* Add Review Form */}
        <form onSubmit={handleReviewSubmit} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase">Write a Customer Review</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={reviewName}
              onChange={(e) => setReviewName(e.target.value)}
              placeholder="Your Name"
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              required
            />

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Rating:</span>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-amber-500"
              >
                <option value={5}>★★★★★ 5 Stars (Excellent)</option>
                <option value={4}>★★★★☆ 4 Stars (Good)</option>
                <option value={3}>★★★☆☆ 3 Stars (Average)</option>
              </select>
            </div>
          </div>

          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Share your experience with this AC model (cooling speed, noise, electricity consumption)..."
            rows={3}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            required
          />

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold hover:bg-cyan-700 transition"
            >
              Post Review
            </button>
            {submitMsg && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{submitMsg}</span>}
          </div>
        </form>
      </div>

    </div>
  );
}

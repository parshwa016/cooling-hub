import React, { useState, useEffect } from 'react';
import { 
  Star, ShoppingCart, Heart, Scale, ShieldCheck, 
  Zap, Volume2, Award, CheckCircle2, MessageSquare, ArrowLeft, RefreshCw 
} from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import RatingStars from '../components/RatingStars';
import LuxurySelect from '../components/LuxurySelect';

export default function ProductDetail({ productId, setActiveTab }) {
  const { currentUser, openAuthModal } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewName, setReviewName] = useState(currentUser?.name || '');
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
    if (!currentUser) {
      openAuthModal('prompt');
      return;
    }
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
      <div className="flex items-center justify-center py-24 text-[#555555] space-x-2">
        <RefreshCw className="w-6 h-6 animate-spin text-[#C8A96B]" />
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
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#555555] hover:text-[#111111] dark:hover:text-[#C8A96B] transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to AC Store</span>
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 bg-white dark:bg-[#1A1A1A] p-6 sm:p-10 lg:p-12 rounded-3xl border border-[#E2E0DB] dark:border-[#2E2E2E] shadow-sm">
        
        {/* Left Column: Image Showcase */}
        <div className="lg:col-span-6 space-y-5">
          <div className="relative rounded-2xl overflow-hidden border border-[#E2E0DB] dark:border-[#2E2E2E] bg-[#F7F6F2] dark:bg-[#252525] h-[380px] sm:h-[440px] lg:h-[480px]">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = '/images/products/daikin_split.jpg'; }}
            />
            <span className="absolute top-4 left-4 px-3.5 py-1.5 bg-white/95 dark:bg-[#1A1A1A]/95 border border-[#E2E0DB] text-[#111111] dark:text-[#C8A96B] font-black text-xs sm:text-sm rounded-full shadow-sm">
              ★ {product.star_rating} Star {product.is_inverter ? 'Inverter' : 'Fixed Speed'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3.5 sm:p-4 bg-[#F7F6F2] dark:bg-[#252525] rounded-xl text-center border border-[#E2E0DB] dark:border-[#2E2E2E]">
              <Zap className="w-5 h-5 text-[#C8A96B] mx-auto mb-1" />
              <span className="block text-[11px] text-[#555555] dark:text-[#858585] font-bold uppercase">ISEER Rating</span>
              <span className="text-base sm:text-lg font-black text-[#111111] dark:text-white">{product.iseer_rating}</span>
            </div>

            <div className="p-3.5 sm:p-4 bg-[#F7F6F2] dark:bg-[#252525] rounded-xl text-center border border-[#E2E0DB] dark:border-[#2E2E2E]">
              <Volume2 className="w-5 h-5 text-[#111111] dark:text-[#C8A96B] mx-auto mb-1" />
              <span className="block text-[11px] text-[#555555] dark:text-[#858585] font-bold uppercase">Noise Level</span>
              <span className="text-base sm:text-lg font-black text-[#111111] dark:text-white">{product.noise_level_db} dB</span>
            </div>

            <div className="p-3.5 sm:p-4 bg-[#F7F6F2] dark:bg-[#252525] rounded-xl text-center border border-[#E2E0DB] dark:border-[#2E2E2E]">
              <Award className="w-5 h-5 text-[#C8A96B] mx-auto mb-1" />
              <span className="block text-[11px] text-[#555555] dark:text-[#858585] font-bold uppercase">Warranty</span>
              <span className="text-base sm:text-lg font-black text-[#111111] dark:text-white">10 Yr Comp</span>
            </div>
          </div>
        </div>

        {/* Right Column: Specs & Purchase */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#C8A96B]">
              {product.brand} • {product.ac_type} AC • {product.tonnage} Ton
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#111111] dark:text-white mt-1 leading-snug">
              {product.title}
            </h1>
            <div className="mt-2.5 flex items-center space-x-3">
              <RatingStars rating={product.rating} count={product.reviews_count} />
              <span className="text-xs text-[#555555]">|</span>
              <span className="text-xs sm:text-sm text-[#C8A96B] font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>In Stock ({product.stock} units)</span>
              </span>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="p-4 sm:p-5 bg-[#F7F6F2] dark:bg-[#252525] rounded-2xl border border-[#E2E0DB] dark:border-[#2E2E2E] flex items-center justify-between">
            <div>
              <div className="flex items-baseline space-x-2.5">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[#111111] dark:text-white">₹{product.price.toLocaleString()}</span>
                <span className="text-xs sm:text-sm text-[#555555] line-through">₹{product.original_price.toLocaleString()}</span>
                <span className="text-xs sm:text-sm font-bold text-[#C8A96B]">({product.discount_percent}% OFF)</span>
              </div>
              <p className="text-xs text-[#555555] dark:text-[#858585] mt-1">Inclusive of all taxes + Standard Express Delivery</p>
            </div>
          </div>

          <p className="text-sm sm:text-base text-[#111111] dark:text-[#858585] leading-relaxed">
            {product.description}
          </p>

          {/* Key Features Bullet List */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs sm:text-sm text-[#111111] dark:text-white uppercase tracking-wider">Key Features & Technologies:</h4>
            <div className="flex flex-wrap gap-2">
              {(product.features || '').split(',').map((feat, idx) => (
                <span key={idx} className="px-3.5 py-1.5 bg-[#FAF7F0] dark:bg-[#252525] text-[#111111] dark:text-[#C8A96B] rounded-lg text-xs sm:text-sm font-semibold border border-[#C8A96B]/30">
                  ✓ {feat.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3.5 pt-4 border-t border-[#E2E0DB] dark:border-[#2E2E2E]">
            <button
              onClick={() => addToCart(product)}
              className="btn-emerald-primary flex-1 py-4 text-sm sm:text-base font-bold"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              <span>Add to Shopping Cart</span>
            </button>

            <button
              onClick={() => {
                addToCart(product);
                if (!currentUser) {
                  openAuthModal('prompt');
                }
              }}
              className="btn-emerald-secondary px-6 sm:px-8 py-4 text-sm sm:text-base font-bold"
            >
              <span>⚡ Buy Now</span>
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              className={`p-4 rounded-2xl border font-bold transition flex items-center space-x-1 text-sm ${
                isWishlisted 
                  ? 'bg-rose-500 text-white border-rose-500' 
                  : 'bg-white dark:bg-[#1A1A1A] border-[#E2E0DB] dark:border-[#2E2E2E] text-[#111111] dark:text-[#F7F6F2] hover:bg-[#FAF7F0]'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={() => toggleCompare(product)}
              className={`p-4 rounded-2xl border font-bold transition flex items-center space-x-1 text-sm ${
                isCompared 
                  ? 'bg-[#111111] text-white border-[#111111]' 
                  : 'bg-white dark:bg-[#1A1A1A] border-[#E2E0DB] dark:border-[#2E2E2E] text-[#111111] dark:text-[#F7F6F2] hover:bg-[#FAF7F0]'
              }`}
            >
              <Scale className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>

      {/* Review Section */}
      <div className="bg-white dark:bg-[#1A1A1A] p-6 sm:p-8 rounded-3xl border border-[#E2E0DB] dark:border-[#2E2E2E] space-y-6">
        <h3 className="font-bold text-[#111111] dark:text-white text-lg flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-[#C8A96B]" />
          <span>Customer Reviews & Ratings ({product.reviews_count})</span>
        </h3>

        {/* Add Review Form */}
        <form onSubmit={handleReviewSubmit} className="p-4 bg-[#F7F6F2] dark:bg-[#252525] rounded-2xl border border-[#E2E0DB] dark:border-[#2E2E2E] space-y-3">
          <h4 className="font-bold text-xs text-[#111111] dark:text-white uppercase">Write a Customer Review</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={reviewName}
              onChange={(e) => setReviewName(e.target.value)}
              placeholder="Your Name"
              className="px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#2E2E2E] rounded-xl text-xs text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C8A96B]"
              required
            />

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-[#555555] dark:text-[#858585]">Rating:</span>
              <div className="w-56">
                <LuxurySelect
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  options={[
                    { value: 5, label: '★★★★★ 5 Stars (Excellent)' },
                    { value: 4, label: '★★★★☆ 4 Stars (Good)' },
                    { value: 3, label: '★★★☆☆ 3 Stars (Average)' }
                  ]}
                  size="sm"
                />
              </div>
            </div>
          </div>

          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Share your experience with this AC model (cooling speed, noise, electricity consumption)..."
            rows={3}
            className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#2E2E2E] rounded-xl text-xs text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C8A96B]"
            required
          />

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="btn-emerald-primary px-4 py-2 text-xs"
            >
              Post Review
            </button>
            {submitMsg && <span className="text-xs text-[#C8A96B] font-semibold">{submitMsg}</span>}
          </div>
        </form>
      </div>

    </div>
  );
}

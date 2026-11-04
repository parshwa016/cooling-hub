import React, { useState, useEffect } from 'react';
import { 
  Star, ShoppingCart, Heart, Scale, ShieldCheck, 
  Zap, Volume2, Award, CheckCircle2, MessageSquare, ArrowLeft, RefreshCw,
  Camera, Sparkles, Eye, Truck, CreditCard, RefreshCcw, Info, ChevronDown, Wrench, Send, MapPin
} from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import RatingStars from '../components/RatingStars';
import LuxurySelect from '../components/LuxurySelect';
import RoomVisualizerModal from '../components/RoomVisualizerModal';

export default function ProductDetail({ productId, setActiveTab }) {
  const { currentUser, openAuthModal } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewName, setReviewName] = useState(currentUser?.name || '');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submitMsg, setSubmitMsg] = useState('');
  const [visualizerOpen, setVisualizerOpen] = useState(false);
  const [deliveryPin, setDeliveryPin] = useState('380009');
  const [pinChecked, setPinChecked] = useState(true);
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const [exchangeType, setExchangeType] = useState('split');
  const [exchangeWorking, setExchangeWorking] = useState(true);
  const [showNoiseGuide, setShowNoiseGuide] = useState(false);
  const [installationScopeOpen, setInstallationScopeOpen] = useState(false);

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
            
            {/* Top Badge */}
            <span className="absolute top-4 left-4 px-3.5 py-1.5 bg-white/95 dark:bg-[#1A1A1A]/95 border border-[#E2E0DB] text-[#111111] dark:text-[#C8A96B] font-black text-xs sm:text-sm rounded-full shadow-sm">
              ★ {product.star_rating} Star {product.is_inverter ? 'Inverter' : 'Fixed Speed'}
            </span>

            {/* AR Wall Visualizer Action Trigger on Image */}
            <button
              onClick={() => setVisualizerOpen(true)}
              className="absolute bottom-4 right-4 px-3.5 py-2 bg-black/85 hover:bg-black text-white text-xs font-bold rounded-xl border border-[#C8A96B]/50 backdrop-blur-md flex items-center space-x-1.5 shadow-lg transition hover:scale-105 z-10 group"
            >
              <Camera className="w-4 h-4 text-[#C8A96B] group-hover:rotate-12 transition-transform" />
              <span>Visualize On Wall (AR)</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3.5 sm:p-4 bg-[#F7F6F2] dark:bg-[#252525] rounded-xl text-center border border-[#E2E0DB] dark:border-[#2E2E2E]">
              <Zap className="w-5 h-5 text-[#C8A96B] mx-auto mb-1" />
              <span className="block text-[11px] text-[#555555] dark:text-[#858585] font-bold uppercase">ISEER Rating</span>
              <span className="text-base sm:text-lg font-black text-[#111111] dark:text-white">{product.iseer_rating}</span>
            </div>

            <div 
              onClick={() => setShowNoiseGuide(!showNoiseGuide)}
              className="p-3.5 sm:p-4 bg-[#F7F6F2] dark:bg-[#252525] rounded-xl text-center border border-[#E2E0DB] dark:border-[#2E2E2E] cursor-pointer hover:border-[#C8A96B] transition relative group"
              title="Click to view acoustic noise level benchmark"
            >
              <Volume2 className="w-5 h-5 text-[#111111] dark:text-[#C8A96B] mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <span className="block text-[11px] text-[#555555] dark:text-[#858585] font-bold uppercase">Noise Level</span>
              <span className="text-base sm:text-lg font-black text-[#111111] dark:text-white">{product.noise_level_db} dB</span>
              <span className="block text-[9px] text-[#C8A96B] font-bold mt-0.5">Acoustic Scale ℹ️</span>
              
              {showNoiseGuide && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#111111] text-white text-[11px] rounded-2xl shadow-2xl border border-[#C8A96B]/50 z-30 text-left space-y-1.5"
                >
                  <div className="font-extrabold text-[#C8A96B] text-xs flex justify-between items-center">
                    <span>Acoustic Loudness Guide</span>
                    <button onClick={() => setShowNoiseGuide(false)} className="text-white/60 hover:text-white">✕</button>
                  </div>
                  <div className="space-y-1 text-[10px] text-[#FAF7F0]">
                    <div className="flex justify-between"><span>🌙 19 dB</span><span className="text-emerald-400">Whisper / Silent Sleep</span></div>
                    <div className="flex justify-between"><span>📖 26 dB</span><span className="text-emerald-300">Quiet Bedroom</span></div>
                    <div className="flex justify-between"><span>❄️ 34 dB</span><span className="text-[#C8A96B]">Library Whisper (This AC)</span></div>
                    <div className="flex justify-between"><span>🗣️ 45 dB</span><span className="text-amber-400">Normal Conversation</span></div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3.5 sm:p-4 bg-[#F7F6F2] dark:bg-[#252525] rounded-xl text-center border border-[#E2E0DB] dark:border-[#2E2E2E]">
              <Award className="w-5 h-5 text-[#C8A96B] mx-auto mb-1" />
              <span className="block text-[11px] text-[#555555] dark:text-[#858585] font-bold uppercase">Warranty</span>
              <span className="text-xs sm:text-sm font-black text-[#111111] dark:text-white">{product.warranty_summary ? product.warranty_summary.split('•')[0].trim() : '10 Yr Comp'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Specs & Purchase */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#C8A96B]">
              {product.brand} {product.model ? `• ${product.model}` : ''} • {product.ac_type} AC • {product.tonnage} Ton
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

          {/* Pricing Card with EMI & Exchange Badges */}
          <div className="p-4 sm:p-5 bg-[#F7F6F2] dark:bg-[#252525] rounded-2xl border border-[#E2E0DB] dark:border-[#2E2E2E] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline space-x-2.5">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[#111111] dark:text-white">₹{product.price.toLocaleString()}</span>
                  <span className="text-xs sm:text-sm text-[#555555] line-through">₹{product.original_price.toLocaleString()}</span>
                  <span className="text-xs sm:text-sm font-bold text-[#C8A96B]">({product.discount_percent}% OFF)</span>
                </div>
                <p className="text-xs text-[#555555] dark:text-[#858585] mt-0.5">Inclusive of all GST taxes + Free Delivery in Ahmedabad</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-black">
                Ready to Dispatch
              </span>
            </div>

            {/* No-Cost EMI & Exchange Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-[#E2E0DB] dark:border-[#2E2E2E] text-xs">
              <div className="flex items-center space-x-2 p-2 rounded-xl bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#2E2E2E]">
                <CreditCard className="w-4 h-4 text-[#C8A96B] shrink-0" />
                <span className="text-[11px] text-[#111111] dark:text-[#E2E0DB] leading-tight">
                  No-Cost EMI from <strong>₹{Math.round(product.price / 18).toLocaleString()}/mo</strong>
                </span>
              </div>
              <button
                onClick={() => setExchangeOpen(!exchangeOpen)}
                className="flex items-center justify-between p-2 rounded-xl bg-[#FAF7F0] dark:bg-[#202020] hover:bg-[#FAF7F0]/80 border border-[#C8A96B]/40 text-[11px] font-bold text-[#111111] dark:text-[#C8A96B] transition cursor-pointer"
              >
                <span className="flex items-center space-x-1.5">
                  <RefreshCcw className="w-3.5 h-3.5 text-[#C8A96B]" />
                  <span>Exchange Old AC (Up to ₹4,000 Off)</span>
                </span>
                <span className="text-xs font-extrabold">{exchangeOpen ? '▲' : '▼'}</span>
              </button>
            </div>

            {/* Interactive Old AC Exchange Calculator Widget */}
            {exchangeOpen && (
              <div className="p-3 bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#C8A96B]/40 text-xs space-y-2.5 animate-in fade-in">
                <div className="flex justify-between items-center font-bold text-[#111111] dark:text-white">
                  <span>Exchange Old AC Valuation:</span>
                  <span className="text-[#C8A96B] font-black text-sm">
                    -₹{(exchangeType === 'split' ? (exchangeWorking ? 4000 : 2500) : (exchangeWorking ? 3000 : 1800)).toLocaleString()} Instant Off
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#858585] mb-1">Old AC Type</label>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        onClick={() => setExchangeType('split')}
                        className={`py-1 rounded-lg text-[11px] font-bold ${exchangeType === 'split' ? 'bg-[#111111] text-white' : 'bg-[#F7F6F2] dark:bg-[#252525] text-[#555555]'}`}
                      >
                        Split AC
                      </button>
                      <button
                        type="button"
                        onClick={() => setExchangeType('window')}
                        className={`py-1 rounded-lg text-[11px] font-bold ${exchangeType === 'window' ? 'bg-[#111111] text-white' : 'bg-[#F7F6F2] dark:bg-[#252525] text-[#555555]'}`}
                      >
                        Window AC
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#858585] mb-1">Condition</label>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        onClick={() => setExchangeWorking(true)}
                        className={`py-1 rounded-lg text-[11px] font-bold ${exchangeWorking ? 'bg-emerald-600 text-white' : 'bg-[#F7F6F2] dark:bg-[#252525] text-[#555555]'}`}
                      >
                        Working
                      </button>
                      <button
                        type="button"
                        onClick={() => setExchangeWorking(false)}
                        className={`py-1 rounded-lg text-[11px] font-bold ${!exchangeWorking ? 'bg-emerald-600 text-white' : 'bg-[#F7F6F2] dark:bg-[#252525] text-[#555555]'}`}
                      >
                        Defective
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-[#858585]">
                  *Old AC will be picked up at the time of delivery. Our technician will verify condition on-site.
                </p>
              </div>
            )}

            {/* Pincode Delivery & Installation Timeline Checker */}
            <div className="p-3 bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#E2E0DB] dark:border-[#2E2E2E] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#111111] dark:text-white flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C8A96B]" />
                  <span>Check Delivery & Installation Date</span>
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">Ahmedabad Hub</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  maxLength={6}
                  value={deliveryPin}
                  onChange={(e) => {
                    setDeliveryPin(e.target.value);
                    setPinChecked(true);
                  }}
                  placeholder="Enter 6-digit Pincode"
                  className="px-3 py-1.5 text-xs bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#2E2E2E] rounded-lg text-[#111111] dark:text-white w-36 font-mono font-bold"
                />
                <button
                  type="button"
                  onClick={() => setPinChecked(true)}
                  className="btn-emerald-secondary px-3 py-1.5 text-xs font-bold"
                >
                  Verify
                </button>
              </div>

              {pinChecked && (
                <div className="space-y-1 text-[11px] text-[#333333] dark:text-[#CCCCCC] pt-1">
                  <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Free Delivery by Tomorrow, 4:00 PM</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[#C8A96B] font-bold">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Authorized Installation Slot available in 24-48 Hours</span>
                  </div>
                </div>
              )}
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

          {/* Official Manufacturer Warranty Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F0] dark:bg-[#202020] border border-[#C8A96B]/40 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E2E0DB] dark:border-[#333333] pb-2.5">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#C8A96B]" />
                <h4 className="font-extrabold text-xs sm:text-sm text-[#111111] dark:text-white uppercase tracking-wider">
                  Official Brand Warranty & Guarantees
                </h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#C8A96B]/20 text-[#111111] dark:text-[#C8A96B] text-[10px] sm:text-[11px] font-black uppercase">
                100% Genuine OEM
              </span>
            </div>

            {/* 3-Tier Warranty Spec Badges */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#2E2E2E]">
                <span className="block text-[9px] sm:text-[10px] uppercase font-bold text-[#555555] dark:text-[#888888]">Comprehensive</span>
                <span className="text-xs sm:text-sm font-black text-[#111111] dark:text-white">1 Year Unit</span>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#2E2E2E]">
                <span className="block text-[9px] sm:text-[10px] uppercase font-bold text-[#555555] dark:text-[#888888]">Inverter PCB</span>
                <span className="text-xs sm:text-sm font-black text-[#111111] dark:text-white">5 Years PCB</span>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#2E2E2E]">
                <span className="block text-[9px] sm:text-[10px] uppercase font-bold text-[#555555] dark:text-[#888888]">Compressor</span>
                <span className="text-xs sm:text-sm font-black text-[#111111] dark:text-white">10 Years Comp</span>
              </div>
            </div>

            {product.warranty_details && (
              <p className="text-xs text-[#555555] dark:text-[#A8A8A8] leading-relaxed pt-0.5">
                {product.warranty_details}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[11px] font-semibold text-[#111111] dark:text-[#DDDDDD]">
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Original Brand Warranty Card Included</span>
              </span>
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>GST Tax Invoice with Serial Number</span>
              </span>
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Parshwa Enterprise Certified Installation</span>
              </span>
            </div>
          </div>

          {/* Transparent Installation Scope & Standard Extras Card */}
          <div className="rounded-2xl border border-[#E2E0DB] dark:border-[#2E2E2E] bg-white dark:bg-[#1A1A1A] overflow-hidden shadow-xs">
            <button
              onClick={() => setInstallationScopeOpen(!installationScopeOpen)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-[#FAF7F0] dark:hover:bg-[#202020] transition cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <Wrench className="w-4.5 h-4.5 text-[#C8A96B]" />
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-[#111111] dark:text-white">
                    Installation Scope & Transparent Extras
                  </h4>
                  <p className="text-[10px] text-[#858585]">
                    Know exactly what is included for free and standard charges for extras
                  </p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#858585] transition-transform ${installationScopeOpen ? 'rotate-180' : ''}`} />
            </button>

            {installationScopeOpen && (
              <div className="p-4 pt-0 space-y-3 text-xs border-t border-[#E2E0DB] dark:border-[#2E2E2E] animate-in fade-in">
                <div className="pt-3">
                  <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider block mb-1.5">
                    ✓ Included In Standard Installation:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#444444] dark:text-[#CCCCCC]">
                    <div className="flex items-center space-x-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>3 Meters 100% Copper Refrigerant Piping</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>3 Meters 3-Core Electrical Wire</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>3 Meters Vinyl Drain Pipe</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Standard Brick Wall Core Drilling & Indoor Mounting</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E2E0DB] dark:border-[#2E2E2E]">
                  <span className="text-[10px] font-black uppercase text-[#858585] tracking-wider block mb-1.5">
                    Standard Transparent Rates For Extras (If Required on Site):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
                    <div className="p-2 rounded-lg bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#2E2E2E]">
                      <span className="block text-[#858585]">Extra Copper Pipe</span>
                      <strong className="text-[#111111] dark:text-white">₹850 / meter</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#2E2E2E]">
                      <span className="block text-[#858585]">Outdoor Wall Bracket</span>
                      <strong className="text-[#111111] dark:text-white">₹750 / pair</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#2E2E2E]">
                      <span className="block text-[#858585]">RCC Beam Core Cut</span>
                      <strong className="text-[#111111] dark:text-white">₹500 / hole</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#2E2E2E]">
                      <span className="block text-[#858585]">Drain Pipe Extension</span>
                      <strong className="text-[#111111] dark:text-white">₹120 / meter</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Room Visualizer Interactive Banner / Button */}
          <div 
            onClick={() => setVisualizerOpen(true)}
            className="p-4 rounded-2xl bg-gradient-to-r from-[#111111] via-[#1E1E1E] to-[#111111] text-white border border-[#C8A96B]/50 hover:border-[#C8A96B] flex items-center justify-between shadow-lg cursor-pointer transition-all hover:scale-[1.01] group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#C8A96B] text-[#111111] flex items-center justify-center font-bold shadow-md group-hover:rotate-6 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-sm sm:text-base text-white">
                    Try in Your Room (AR Visualizer)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#C8A96B] text-[#111111] text-[10px] font-black uppercase tracking-wider">
                    Upload or Click Photo
                  </span>
                </div>
                <p className="text-xs text-[#C8A96B] font-medium mt-0.5">
                  Upload your room photo or click live photo with camera to preview fit, scale & airflow
                </p>
              </div>
            </div>
            <button className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#C8A96B] text-xs font-bold transition">
              <span>Try On Wall</span>
              <Sparkles className="w-3.5 h-3.5 text-[#C8A96B]" />
            </button>
          </div>

          {/* CTA Buttons with Direct WhatsApp Connect */}
          <div className="space-y-3 pt-2 border-t border-[#E2E0DB] dark:border-[#2E2E2E]">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => addToCart(product)}
                className="btn-emerald-primary flex-1 py-4 text-sm sm:text-base font-bold cursor-pointer"
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
                className="btn-emerald-secondary px-6 sm:px-8 py-4 text-sm sm:text-base font-bold cursor-pointer"
              >
                <span>⚡ Buy Now</span>
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-4 rounded-2xl border font-bold transition flex items-center space-x-1 text-sm cursor-pointer ${
                  isWishlisted 
                    ? 'bg-rose-500 text-white border-rose-500' 
                    : 'bg-white dark:bg-[#1A1A1A] border-[#E2E0DB] dark:border-[#2E2E2E] text-[#111111] dark:text-[#F7F6F2] hover:bg-[#FAF7F0]'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-white' : ''}`} />
              </button>

              <button
                onClick={() => toggleCompare(product)}
                className={`p-4 rounded-2xl border font-bold transition flex items-center space-x-1 text-sm cursor-pointer ${
                  isCompared 
                    ? 'bg-[#111111] text-white border-[#111111]' 
                    : 'bg-white dark:bg-[#1A1A1A] border-[#E2E0DB] dark:border-[#2E2E2E] text-[#111111] dark:text-[#F7F6F2] hover:bg-[#FAF7F0]'
                }`}
                title="Compare with another AC"
              >
                <Scale className="w-5 h-5" />
              </button>
            </div>

            {/* Direct WhatsApp Dealer Assistance Button */}
            <a
              href={`https://wa.me/919099991453?text=${encodeURIComponent(
                `Hi Parshwa Enterprise! I am interested in buying ${product.brand} ${product.model || product.title} (Price: ₹${product.price.toLocaleString()}) in Ahmedabad. Can you share today's best deal and confirm installation timeline?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-2xl bg-emerald-700/15 hover:bg-emerald-700/25 border border-emerald-600/40 text-emerald-800 dark:text-emerald-300 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4 fill-emerald-600 dark:fill-emerald-400 flex-shrink-0" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>Inquire This Model on WhatsApp</span>
            </a>
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

      {/* Room Visualizer Modal */}
      <RoomVisualizerModal
        isOpen={visualizerOpen}
        onClose={() => setVisualizerOpen(false)}
        initialProduct={product}
      />

    </div>
  );
}

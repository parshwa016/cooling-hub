import React, { useState, useEffect } from 'react';
import { 
  Snowflake, Zap, Wrench, ShieldCheck, ArrowRight, Star, 
  Sparkles, CheckCircle2, Search, Flame, MapPin, PhoneCall, Scale, TrendingUp,
  Volume2, Sliders, Wind, Gauge, Activity, Check
} from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import RatingStars from '../components/RatingStars';

export default function Home({ setActiveTab, onSelectProduct }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, toggleCompare, compareItems } = useCart();

  // Interactive AC Simulator State
  const [temp, setTemp] = useState(18);
  const [mode, setMode] = useState('turbo'); // 'turbo', 'eco', 'silent'
  
  // Interactive Room Tonnage Recommender
  const [roomSqFt, setRoomSqFt] = useState(150);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getProducts(),
      api.getServices()
    ]).then(([prods, srvs]) => {
      setFeaturedProducts(prods.slice(0, 4));
      setServices(srvs.slice(0, 3));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const businessFlowSteps = [
    { title: 'Buy AC', icon: '🛒', desc: 'Top Tier Brands' },
    { title: 'Installation', icon: '🔩', desc: 'Free Next-Day' },
    { title: 'Warranty', icon: '🛡️', desc: '10-Yr Digital' },
    { title: 'Service', icon: '🧹', desc: 'Foam Jet Wash' },
    { title: 'Complaint', icon: '📢', desc: 'Fast Resolution' },
    { title: 'Repair', icon: '🔧', desc: 'OEM Genuine' },
    { title: 'AMC', icon: '📅', desc: 'Zero Stress Care' },
    { title: 'Renewal', icon: '🔄', desc: '1-Click Ext.' },
  ];

  const brandsList = [
    { name: 'DAIKIN', tag: 'Japanese Streamer Discharge' },
    { name: 'MITSUBISHI HEAVY', tag: '18m Long Air Throw' },
    { name: 'PANASONIC', tag: 'Miraie AI Voice Control' },
    { name: 'LG AI DUAL', tag: '6-in-1 Diet Inverter' },
    { name: 'BLUE STAR', tag: 'Precision 0.5°C Cooling' },
    { name: 'VOLTAS', tag: '52°C Ambient Cooling' },
    { name: 'O GENERAL', tag: 'Hyper Tropical Tech' }
  ];

  // Calculated values based on interactive temperature
  const getPowerDraw = () => {
    if (mode === 'turbo') return 1180;
    if (mode === 'silent') return 480;
    return Math.round(520 + (26 - temp) * 45);
  };

  const getDecibels = () => {
    if (mode === 'silent') return 19;
    if (mode === 'turbo') return 34;
    return 26;
  };

  // Recommended tonnage based on room size
  const getRecommendedTonnage = () => {
    if (roomSqFt <= 120) return { ton: '1.0 Ton', stars: '3 to 5-Star', desc: 'Ideal for small bedrooms & study rooms up to 120 sq ft.' };
    if (roomSqFt <= 190) return { ton: '1.5 Ton', stars: '5-Star Inverter', desc: 'Perfect sweet spot for standard master bedrooms (120 - 190 sq ft).' };
    return { ton: '2.0 Ton', stars: 'Heavy Duty 5-Star', desc: 'Recommended for large living rooms, master suites & halls.' };
  };

  const recommended = getRecommendedTonnage();

  return (
    <div className="space-y-20 pb-20">
      
      {/* Luxury Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-20 rounded-[2.5rem] bg-gradient-to-b from-white/90 via-slate-50/70 to-white/90 dark:from-slate-900/90 dark:via-slate-950/90 dark:to-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-2xl backdrop-blur-2xl">
        
        {/* Glow Lighting in background */}
        <div className="absolute top-[-20%] left-1/4 w-[500px] h-[500px] bg-cyan-400/15 dark:bg-cyan-500/20 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-10 w-[500px] h-[500px] bg-brand-orange/15 dark:bg-brand-orange/20 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Live Dispatch Radar Pill */}
          <div className="flex justify-center lg:justify-start mb-6">
            <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold backdrop-blur-md shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-radar" />
              <span className="font-bold text-slate-900 dark:text-white">Live Operations:</span>
              <span className="text-slate-600 dark:text-slate-300">48 Certified Technicians Active • Avg Arrival 35 Mins</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-brand-navy dark:text-white leading-[1.12]">
                Next-Gen Comfort, <br />
                <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-brand-orange bg-clip-text text-transparent">
                  Intelligent AC Care.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed font-normal">
                The all-in-one ecosystem for buying 5-Star Inverter ACs, calculating electricity bill savings, booking same-day jet wash services, and continuous AMC protection.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('shop')}
                  className="btn-shine btn-animate px-7 py-4 bg-brand-navy text-white font-bold rounded-2xl shadow-xl flex items-center space-x-2.5 text-sm"
                >
                  <Snowflake className="w-4.5 h-4.5 text-cyan-300 animate-pulse" />
                  <span>Explore AC Store</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveTab('calculator')}
                  className="btn-shine btn-orange-animate px-7 py-4 bg-brand-orange text-white font-bold rounded-2xl shadow-xl flex items-center space-x-2.5 text-sm"
                >
                  <Zap className="w-4.5 h-4.5 text-amber-200" />
                  <span>Savings Calculator</span>
                </button>

                <button
                  onClick={() => setActiveTab('services')}
                  className="btn-animate px-6 py-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition flex items-center space-x-2 text-sm shadow-sm"
                >
                  <Wrench className="w-4 h-4 text-cyan-600" />
                  <span>Book Service</span>
                </button>
              </div>

              {/* Trust Metric Counters */}
              <div className="pt-8 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-3 gap-4">
                <div className="p-3.5 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <h4 className="text-2xl font-black text-brand-navy dark:text-white">15,000+</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">ACs Delivered & Installed</p>
                </div>
                <div className="p-3.5 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <h4 className="text-2xl font-black text-brand-navy dark:text-white">4.9 / 5★</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Verified User Rating</p>
                </div>
                <div className="p-3.5 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <h4 className="text-2xl font-black text-brand-orange">Zero-Wait</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Emergency Dispatch</p>
                </div>
              </div>

            </div>

            {/* Right: High-Tech Interactive AC Simulator Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-[2rem] overflow-hidden glass-luxury border border-white/80 dark:border-slate-700/60 shadow-2xl p-6 space-y-6">
                
                {/* Simulator Top Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-xs font-black tracking-wider uppercase text-brand-navy dark:text-cyan-300">
                      Live AC Smart Controller
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-brand-orange text-white text-[10px] font-black rounded-full shadow">
                    AI DUAL INVERTER
                  </span>
                </div>

                {/* Main Temperature & Frost Breeze Visualizer */}
                <div className="relative rounded-2xl bg-gradient-to-b from-brand-navy via-slate-900 to-brand-navy text-white p-6 overflow-hidden shadow-inner">
                  
                  {/* Breeze Flow Wave Lines (SVG) */}
                  <div className="absolute inset-0 pointer-events-none opacity-40">
                    <svg className="w-full h-full" viewBox="0 0 400 200" fill="none">
                      <path d="M 0 50 Q 100 20 200 50 T 400 50" stroke="#38bdf8" strokeWidth="2" className="breeze-line" />
                      <path d="M 0 100 Q 100 70 200 100 T 400 100" stroke="#7dd3fc" strokeWidth="1.5" className="breeze-line" style={{ animationDelay: '1s' }} />
                      <path d="M 0 150 Q 100 120 200 150 T 400 150" stroke="#38bdf8" strokeWidth="2" className="breeze-line" style={{ animationDelay: '2s' }} />
                    </svg>
                  </div>

                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-300">Set Temperature</span>
                      <div className="flex items-baseline space-x-1 mt-1">
                        <span className="text-6xl font-black text-white tracking-tighter">{temp}</span>
                        <span className="text-2xl font-bold text-cyan-400">°C</span>
                      </div>
                      <p className="text-[11px] text-cyan-200 mt-1 flex items-center space-x-1">
                        <Wind className="w-3.5 h-3.5 animate-spin" />
                        <span>Instant Dew-Clean Breeze active</span>
                      </p>
                    </div>

                    {/* Temp Adjust Buttons */}
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => setTemp(Math.min(26, temp + 1))}
                        className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-lg flex items-center justify-center transition"
                      >
                        +
                      </button>
                      <button
                        onClick={() => setTemp(Math.max(16, temp - 1))}
                        className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-lg flex items-center justify-center transition"
                      >
                        -
                      </button>
                    </div>
                  </div>

                  {/* Mode Selector Buttons */}
                  <div className="relative z-10 grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-white/15 text-xs font-bold">
                    <button
                      onClick={() => { setMode('turbo'); setTemp(16); }}
                      className={`py-2 rounded-xl transition ${mode === 'turbo' ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-white/10 text-white hover:bg-white/15'}`}
                    >
                      ❄️ Turbo (16°)
                    </button>
                    <button
                      onClick={() => { setMode('eco'); setTemp(24); }}
                      className={`py-2 rounded-xl transition ${mode === 'eco' ? 'bg-emerald-400 text-slate-950 font-black' : 'bg-white/10 text-white hover:bg-white/15'}`}
                    >
                      🌱 Eco Inverter
                    </button>
                    <button
                      onClick={() => { setMode('silent'); setTemp(22); }}
                      className={`py-2 rounded-xl transition ${mode === 'silent' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-white/10 text-white hover:bg-white/15'}`}
                    >
                      🌙 19dB Silent
                    </button>
                  </div>

                </div>

                {/* Real-time Diagnostics bar */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
                    <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                      <Gauge className="w-3.5 h-3.5 text-cyan-600" />
                      <span className="text-[10px] font-bold uppercase">Real-Time Power</span>
                    </div>
                    <span className="text-base font-black text-brand-navy dark:text-white">{getPowerDraw()} Watts</span>
                    <span className="block text-[10px] text-emerald-600 font-bold">52% Energy Optimized</span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
                    <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                      <Volume2 className="w-3.5 h-3.5 text-brand-orange" />
                      <span className="text-[10px] font-bold uppercase">Acoustic Noise</span>
                    </div>
                    <span className="text-base font-black text-brand-navy dark:text-white">{getDecibels()} dB</span>
                    <span className="block text-[10px] text-slate-400">Library Whisper Quiet</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('shop')}
                  className="w-full py-3 bg-gradient-to-r from-brand-navy via-slate-800 to-brand-navy text-white rounded-xl text-xs font-bold shadow hover:opacity-90 transition flex items-center justify-center space-x-2"
                >
                  <span>Browse Compatible Daikin & LG Models</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Infinite Scrolling Premium Brands Marquee */}
      <section className="relative overflow-hidden py-4 border-y border-slate-200/80 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
        <div className="flex animate-marquee space-x-12 items-center">
          {brandsList.concat(brandsList).map((b, idx) => (
            <div key={idx} className="flex items-center space-x-3 flex-shrink-0 px-4 py-2 rounded-xl">
              <span className="font-black text-lg tracking-wider text-slate-700 dark:text-slate-300">{b.name}</span>
              <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-400 rounded-md">
                {b.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Room Size & AC Tonnage Finder */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-luxury rounded-3xl p-8 lg:p-10 border border-slate-200 dark:border-slate-800 space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-brand-orange">Interactive Capacity Finder</span>
              <h2 className="text-2xl sm:text-3xl font-black text-brand-navy dark:text-white mt-1">
                Find the Exact AC Tonnage For Your Room
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Avoid oversized power bills or undersized weak cooling with our algorithmic sizing guide.</p>
            </div>
            <button
              onClick={() => setActiveTab('calculator')}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl text-xs hover:opacity-90 transition flex-shrink-0"
            >
              Open Full ROI Calculator
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Room Carpet Area:</span>
                <span className="text-lg font-black text-brand-orange">{roomSqFt} sq. ft.</span>
              </div>

              <input
                type="range"
                min={80}
                max={320}
                step={10}
                value={roomSqFt}
                onChange={(e) => setRoomSqFt(Number(e.target.value))}
                className="w-full accent-brand-orange cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Small Bedroom (100 sq ft)</span>
                <span>Master Bed (150 sq ft)</span>
                <span>Large Hall (250+ sq ft)</span>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Recommended Match</span>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-black text-brand-navy dark:text-white">{recommended.ton}</h3>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">({recommended.stars})</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{recommended.desc}</p>
              <button
                onClick={() => setActiveTab('shop')}
                className="w-full py-2.5 bg-brand-navy text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition"
              >
                Shop Recommended {recommended.ton} Models
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* Business Lifecycle Roadmap */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-black uppercase tracking-wider text-brand-orange">One Seamless Lifecycle</span>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-navy dark:text-white mt-1">
            The Cooling Hub Experience
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Every step from selecting your first AC to maintenance & renewals under a single platform.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {businessFlowSteps.map((step, idx) => (
            <div 
              key={idx}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center shadow-sm hover:shadow-xl hover:border-brand-orange hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer"
            >
              <div className="text-2xl mb-2 group-hover:scale-125 transition-transform duration-300">{step.icon}</div>
              <h4 className="font-black text-xs text-slate-800 dark:text-slate-100">{step.title}</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured AC Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-brand-navy dark:text-cyan-400">Featured Inverters</span>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-navy dark:text-white mt-1">
              Top Rated AC Collection
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('shop')}
            className="inline-flex items-center space-x-1 text-xs font-bold text-brand-orange hover:underline"
          >
            <span>View All ACs ({featuredProducts.length}+)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800 shimmer-loading" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <div 
                key={p.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-2xl hover:border-cyan-500 hover:-translate-y-1.5 transition-all duration-300 flex flex-col group"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full shadow">
                    ★ {p.star_rating} Star {p.is_inverter ? 'Inverter' : 'Fixed'}
                  </span>
                  <button
                    onClick={() => toggleCompare(p)}
                    className={`absolute top-3 right-3 p-2 rounded-full text-xs font-bold transition shadow ${
                      compareItems.some(item => item.id === p.id)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-white'
                    }`}
                    title="Compare AC"
                  >
                    <Scale className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-black text-brand-navy dark:text-cyan-400 tracking-wider uppercase">{p.brand} • {p.tonnage} Ton</span>
                    <h3 
                      onClick={() => { onSelectProduct(p.id); setActiveTab('product_detail'); }}
                      className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-2 cursor-pointer hover:text-cyan-600 transition mt-0.5"
                    >
                      {p.title}
                    </h3>
                    <div className="mt-2">
                      <RatingStars rating={p.rating} count={p.reviews_count} />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 line-through">₹{p.original_price.toLocaleString()}</span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white">₹{p.price.toLocaleString()}</h4>
                    </div>
                    <button
                      onClick={() => addToCart(p)}
                      className="btn-orange-animate px-3.5 py-1.5 bg-brand-orange text-white rounded-xl text-xs font-bold"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* Doorstep Care Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Certified Services</span>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-navy dark:text-white mt-1">
              Doorstep Service & Jet Wash
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('services')}
            className="inline-flex items-center space-x-1 text-xs font-bold text-brand-navy dark:text-cyan-400 hover:underline"
          >
            <span>Book Service</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((srv) => (
            <div key={srv.id} className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{srv.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{srv.description}</p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-lg font-black text-brand-navy dark:text-cyan-400">₹{srv.price}</span>
                <button
                  onClick={() => setActiveTab('services')}
                  className="btn-animate px-4 py-2 bg-brand-navy text-white rounded-xl text-xs font-bold"
                >
                  Book Slot
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

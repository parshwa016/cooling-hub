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
      
      {/* Premium Hero Section with Warm Off-White background and Champagne Airflow */}
      <section className="relative overflow-hidden pt-10 pb-20 rounded-[2.5rem] bg-[#F7F6F2] dark:bg-[#1A1A1A]/60 border border-[#E2E0DB] dark:border-[#2E2E2E] shadow-sm">
        
        {/* Signature "Champagne Airflow" Atmospheric SVG Streams */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
          <svg className="w-full h-full" viewBox="0 0 1200 600" fill="none" preserveAspectRatio="none">
            <path 
              d="M -100 150 C 200 80, 500 240, 850 130 C 1050 70, 1200 180, 1350 140" 
              stroke="#C8A96B" 
              strokeWidth="2" 
              strokeDasharray="12 18"
              className="breeze-line"
              opacity="0.6"
            />
            <path 
              d="M -50 320 C 250 220, 600 390, 950 280 C 1150 220, 1250 310, 1350 270" 
              stroke="#111111" 
              strokeWidth="1.5" 
              strokeDasharray="16 22"
              className="breeze-line"
              style={{ animationDelay: '1.8s' }}
              opacity="0.35"
            />
            <path 
              d="M 100 480 C 400 400, 750 520, 1050 440 C 1200 390, 1300 460, 1400 430" 
              stroke="#C8A96B" 
              strokeWidth="1.2" 
              strokeDasharray="10 14"
              className="breeze-line"
              style={{ animationDelay: '3.2s' }}
              opacity="0.4"
            />
          </svg>
        </div>

        {/* Ambient Subtle Diffusions */}
        <div className="absolute top-[-10%] left-1/4 w-[450px] h-[450px] bg-[#C8A96B]/10 dark:bg-[#C8A96B]/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-10 w-[450px] h-[450px] bg-[#111111]/5 dark:bg-[#C8A96B]/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full relative z-10">
          
          {/* Live Dispatch Radar Pill */}
          <div className="flex justify-center lg:justify-start mb-6">
            <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full bg-white dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#2E2E2E] text-[#111111] dark:text-[#F7F6F2] text-xs sm:text-sm font-semibold shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C8A96B] animate-radar" />
              <span className="font-bold text-[#111111] dark:text-[#C8A96B]">Live Operations:</span>
              <span className="text-[#555555] dark:text-[#858585]">48 Certified Technicians Active • Avg Arrival 35 Mins</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#111111] dark:text-white leading-[1.15]">
                Next-Gen Comfort, <br />
                <span className="text-[#C8A96B]">
                  Intelligent AC Care.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#555555] dark:text-[#858585] max-w-2xl leading-relaxed font-normal">
                The all-in-one ecosystem for buying 5-Star Inverter ACs, calculating electricity bill savings, booking same-day jet wash services, and continuous AMC protection.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => setActiveTab('shop')}
                  className="btn-emerald-primary px-7 sm:px-8 py-4 text-sm sm:text-base font-bold"
                >
                  <Snowflake className="w-5 h-5 text-[#C8A96B] mr-2" />
                  <span>Explore AC Store</span>
                  <ArrowRight className="w-4.5 h-4.5 ml-2" />
                </button>

                <button
                  onClick={() => setActiveTab('calculator')}
                  className="btn-emerald-secondary px-7 sm:px-8 py-4 text-sm sm:text-base font-bold"
                >
                  <Zap className="w-5 h-5 text-[#C8A96B] mr-2" />
                  <span>Savings Calculator</span>
                </button>

                <button
                  onClick={() => setActiveTab('services')}
                  className="btn-emerald-secondary px-6 sm:px-7 py-4 text-sm sm:text-base font-bold"
                >
                  <Wrench className="w-4.5 h-4.5 text-[#111111] dark:text-[#C8A96B] mr-2" />
                  <span>Book Service</span>
                </button>
              </div>

              {/* Trust Metric Counters */}
              <div className="pt-8 border-t border-[#E2E0DB] dark:border-[#2E2E2E] grid grid-cols-3 gap-3 sm:gap-4">
                <div className="p-3.5 sm:p-4 bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#E2E0DB] dark:border-[#2E2E2E] shadow-sm">
                  <h4 className="text-xl sm:text-2xl font-black text-[#111111] dark:text-white">15,000+</h4>
                  <p className="text-[11px] text-[#555555] dark:text-[#858585] font-medium mt-1">ACs Delivered & Installed</p>
                </div>
                <div className="p-3.5 sm:p-4 bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#E2E0DB] dark:border-[#2E2E2E] shadow-sm">
                  <h4 className="text-xl sm:text-2xl font-black text-[#111111] dark:text-white">4.9 / 5★</h4>
                  <p className="text-[11px] text-[#555555] dark:text-[#858585] font-medium mt-1">Verified User Rating</p>
                </div>
                <div className="p-3.5 sm:p-4 bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#E2E0DB] dark:border-[#2E2E2E] shadow-sm">
                  <h4 className="text-xl sm:text-2xl font-black text-[#C8A96B]">Zero-Wait</h4>
                  <p className="text-[11px] text-[#555555] dark:text-[#858585] font-medium mt-1">Emergency Dispatch</p>
                </div>
              </div>

            </div>

            {/* Right: High-Tech Interactive AC Simulator Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-[2rem] overflow-hidden bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#2E2E2E] shadow-xl p-6 sm:p-8 space-y-6">
                
                {/* Simulator Top Header */}
                <div className="flex items-center justify-between border-b border-[#E2E0DB] dark:border-[#2E2E2E] pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C8A96B] animate-ping" />
                    <span className="text-xs font-black tracking-wider uppercase text-[#111111] dark:text-[#C8A96B]">
                      Live AC Smart Controller
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-[#FAF7F0] dark:bg-[#252525] text-[#111111] dark:text-[#C8A96B] border border-[#C8A96B]/30 text-[10px] font-black rounded-full shadow-sm">
                    AI DUAL INVERTER
                  </span>
                </div>

                {/* Main Temperature & Frost Breeze Visualizer */}
                <div className="relative rounded-2xl bg-[#111111] text-white p-6 overflow-hidden shadow-inner">
                  
                  {/* Breeze Flow Wave Lines (SVG) in Champagne */}
                  <div className="absolute inset-0 pointer-events-none opacity-40">
                    <svg className="w-full h-full" viewBox="0 0 400 200" fill="none">
                      <path d="M 0 50 Q 100 20 200 50 T 400 50" stroke="#C8A96B" strokeWidth="2" className="breeze-line" />
                      <path d="M 0 100 Q 100 70 200 100 T 400 100" stroke="#FAF7F0" strokeWidth="1.5" className="breeze-line" style={{ animationDelay: '1s' }} />
                      <path d="M 0 150 Q 100 120 200 150 T 400 150" stroke="#C8A96B" strokeWidth="2" className="breeze-line" style={{ animationDelay: '2s' }} />
                    </svg>
                  </div>

                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C8A96B]">Set Temperature</span>
                      <div className="flex items-baseline space-x-1 mt-1">
                        <span className="text-4xl sm:text-5xl font-black text-white tracking-tighter">{temp}</span>
                        <span className="text-xl font-bold text-[#C8A96B]">°C</span>
                      </div>
                      <p className="text-[11px] text-[#FAF7F0] mt-1 flex items-center space-x-1">
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
                      className={`py-2 rounded-xl transition ${mode === 'turbo' ? 'bg-[#C8A96B] text-[#111111] font-black shadow' : 'bg-white/10 text-white hover:bg-white/15'}`}
                    >
                      ❄️ Turbo (16°)
                    </button>
                    <button
                      onClick={() => { setMode('eco'); setTemp(24); }}
                      className={`py-2 rounded-xl transition ${mode === 'eco' ? 'bg-[#C8A96B] text-[#111111] font-black shadow' : 'bg-white/10 text-white hover:bg-white/15'}`}
                    >
                      🌱 Eco Inverter
                    </button>
                    <button
                      onClick={() => { setMode('silent'); setTemp(22); }}
                      className={`py-2 rounded-xl transition ${mode === 'silent' ? 'bg-[#C8A96B] text-[#111111] font-black shadow' : 'bg-white/10 text-white hover:bg-white/15'}`}
                    >
                      🌙 19dB Silent
                    </button>
                  </div>

                </div>

                {/* Real-time Diagnostics bar */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#F7F6F2] dark:bg-[#252525] rounded-2xl border border-[#E2E0DB] dark:border-[#2E2E2E]">
                    <div className="flex items-center space-x-1.5 text-[#555555] dark:text-[#858585] mb-1">
                      <Gauge className="w-3.5 h-3.5 text-[#C8A96B]" />
                      <span className="text-[10px] font-bold uppercase">Real-Time Power</span>
                    </div>
                    <span className="text-base font-black text-[#111111] dark:text-white">{getPowerDraw()} Watts</span>
                    <span className="block text-[10px] text-[#C8A96B] font-bold">52% Energy Optimized</span>
                  </div>

                  <div className="p-3 bg-[#F7F6F2] dark:bg-[#252525] rounded-2xl border border-[#E2E0DB] dark:border-[#2E2E2E]">
                    <div className="flex items-center space-x-1.5 text-[#555555] dark:text-[#858585] mb-1">
                      <Volume2 className="w-3.5 h-3.5 text-[#111111] dark:text-[#C8A96B]" />
                      <span className="text-[10px] font-bold uppercase">Acoustic Noise</span>
                    </div>
                    <span className="text-base font-black text-[#111111] dark:text-white">{getDecibels()} dB</span>
                    <span className="block text-[10px] text-[#555555] dark:text-[#858585]">Library Whisper Quiet</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('shop')}
                  className="btn-emerald-primary w-full py-3 text-xs"
                >
                  <span>Browse Compatible Daikin & LG Models</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </button>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Infinite Scrolling Premium Brands Marquee */}
      <section className="relative overflow-hidden py-4 border-y border-[#E2E0DB] dark:border-[#2E2E2E] bg-white dark:bg-[#1A1A1A]">
        <div className="flex animate-marquee space-x-12 items-center">
          {brandsList.concat(brandsList).map((b, idx) => (
            <div key={idx} className="flex items-center space-x-3 flex-shrink-0 px-4 py-2 rounded-xl">
              <span className="font-black text-lg tracking-wider text-[#111111] dark:text-[#F7F6F2]">{b.name}</span>
              <span className="px-2.5 py-0.5 bg-[#FAF7F0] dark:bg-[#252525] text-[10px] font-semibold text-[#555555] dark:text-[#858585] border border-[#E2E0DB] dark:border-[#2E2E2E] rounded-md">
                {b.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Room Size & AC Tonnage Finder */}
      <section className="w-full">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-8 lg:p-10 xl:p-12 border border-[#E2E0DB] dark:border-[#2E2E2E] shadow-sm space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#C8A96B]">Interactive Capacity Finder</span>
              <h2 className="text-xl sm:text-2xl font-black text-[#111111] dark:text-white mt-1">
                Find the Exact AC Tonnage For Your Room
              </h2>
              <p className="text-xs sm:text-sm text-[#555555] dark:text-[#858585] mt-1">Avoid oversized power bills or undersized weak cooling with our algorithmic sizing guide.</p>
            </div>
            <button
              onClick={() => setActiveTab('calculator')}
              className="btn-emerald-secondary px-5 py-2.5 text-xs sm:text-sm flex-shrink-0 font-bold"
            >
              Open Full ROI Calculator
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-2">
            
            <div className="lg:col-span-7 space-y-5">
              <div className="flex justify-between items-center text-sm font-bold text-[#111111] dark:text-[#F7F6F2]">
                <span>Room Carpet Area:</span>
                <span className="text-xl font-black text-[#111111] dark:text-[#C8A96B]">{roomSqFt} sq. ft.</span>
              </div>

              <input
                type="range"
                min={80}
                max={320}
                step={10}
                value={roomSqFt}
                onChange={(e) => setRoomSqFt(Number(e.target.value))}
                className="w-full accent-[#C8A96B] cursor-pointer h-2.5 bg-[#E2E0DB] dark:bg-[#2E2E2E] rounded-lg"
              />

              <div className="flex justify-between text-xs text-[#555555] dark:text-[#858585]">
                <span>Small Bedroom (100 sq ft)</span>
                <span>Master Bed (150 sq ft)</span>
                <span>Large Hall (250+ sq ft)</span>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#F7F6F2] dark:bg-[#252525] p-6 sm:p-8 rounded-2xl border border-[#E2E0DB] dark:border-[#2E2E2E] space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#C8A96B]">Recommended Match</span>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-xl sm:text-2xl font-black text-[#111111] dark:text-white">{recommended.ton}</h3>
                <span className="text-sm font-bold text-[#C8A96B]">({recommended.stars})</span>
              </div>
              <p className="text-xs sm:text-sm text-[#555555] dark:text-[#858585] leading-relaxed">{recommended.desc}</p>
              <button
                onClick={() => setActiveTab('shop')}
                className="btn-emerald-primary w-full py-3 text-xs sm:text-sm font-bold"
              >
                Shop Recommended {recommended.ton} Models
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* Business Lifecycle Roadmap */}
      <section className="w-full">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-black uppercase tracking-wider text-[#C8A96B]">One Seamless Lifecycle</span>
          <h2 className="text-xl sm:text-2xl font-black text-[#111111] dark:text-white mt-1">
            The Cooling Hub Experience
          </h2>
          <p className="text-xs sm:text-sm text-[#555555] dark:text-[#858585] mt-1">Every step from selecting your first AC to maintenance & renewals under a single platform.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {businessFlowSteps.map((step, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-[#1A1A1A] p-4 rounded-2xl border border-[#E2E0DB] dark:border-[#2E2E2E] text-center shadow-sm hover:shadow-md hover:border-[#C8A96B] hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">{step.icon}</div>
              <h4 className="font-black text-xs sm:text-sm text-[#111111] dark:text-[#F7F6F2]">{step.title}</h4>
              <p className="text-[10px] text-[#555555] dark:text-[#858585] mt-0.5">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured AC Products */}
      <section className="w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#C8A96B]">Featured Inverters</span>
            <h2 className="text-xl sm:text-2xl font-black text-[#111111] dark:text-white mt-1">
              Top Rated AC Collection
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('shop')}
            className="inline-flex items-center space-x-1 text-xs sm:text-sm font-bold text-[#111111] dark:text-[#C8A96B] hover:text-[#C8A96B] transition-colors"
          >
            <span>View All ACs ({featuredProducts.length}+)</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-[#FAF7F0] dark:bg-[#252525] shimmer-loading" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {featuredProducts.map((p) => (
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
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10 pointer-events-none">
                      <span className="px-2.5 py-1 bg-white/95 dark:bg-[#1A1A1A]/95 border border-[#E2E0DB] text-[#111111] dark:text-[#C8A96B] font-black text-[10px] rounded-full shadow-sm">
                        ★ {p.star_rating} Star {p.is_inverter ? 'Inverter' : 'Fixed'}
                      </span>
                      {p.badge && (
                        <span className="px-2 py-0.5 bg-[#111111] text-[#C8A96B] font-bold text-[9px] rounded-md shadow-sm uppercase tracking-wider">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => toggleCompare(p)}
                      className={`absolute top-3 right-3 p-2 rounded-full text-xs font-bold transition shadow-sm ${
                        compareItems.some(item => item.id === p.id)
                          ? 'bg-[#111111] text-white'
                          : 'bg-white/90 dark:bg-[#1A1A1A]/90 text-[#111111] dark:text-[#F7F6F2] hover:bg-[#FAF7F0]'
                      }`}
                      title="Compare AC"
                    >
                      <Scale className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-black text-[#C8A96B] tracking-wider uppercase">{p.brand} • {p.tonnage} Ton</span>
                      <h3 
                        onClick={() => { onSelectProduct(p.id); setActiveTab('product_detail'); }}
                        className="font-bold text-sm sm:text-base text-[#111111] dark:text-[#F7F6F2] line-clamp-2 cursor-pointer hover:text-[#C8A96B] transition mt-0.5"
                      >
                        {p.title}
                      </h3>
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
                      className="btn-emerald-primary px-4 py-2 text-xs sm:text-sm font-bold"
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
      <section className="w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#C8A96B]">Certified Services</span>
            <h2 className="text-xl sm:text-2xl font-black text-[#111111] dark:text-white mt-1">
              Doorstep Service & Jet Wash
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('services')}
            className="inline-flex items-center space-x-1 text-xs sm:text-sm font-bold text-[#111111] dark:text-[#C8A96B] hover:text-[#C8A96B] transition-colors"
          >
            <span>Book Service</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {services.map((srv) => (
            <div key={srv.id} className="bg-white dark:bg-[#1A1A1A] p-6 sm:p-7 rounded-3xl border border-[#E2E0DB] dark:border-[#2E2E2E] shadow-sm hover:shadow-md hover:border-[#C8A96B] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] dark:bg-[#252525] text-[#111111] dark:text-[#C8A96B] flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-[#C8A96B]" />
                </div>
                <h3 className="font-bold text-[#111111] dark:text-white text-base sm:text-lg">{srv.title}</h3>
                <p className="text-xs sm:text-sm text-[#555555] dark:text-[#858585] leading-relaxed">{srv.description}</p>
              </div>
              <div className="pt-4 mt-4 border-t border-[#E2E0DB] dark:border-[#2E2E2E] flex items-center justify-between">
                <span className="text-lg sm:text-xl font-black text-[#111111] dark:text-white">₹{srv.price}</span>
                <button
                  onClick={() => setActiveTab('services')}
                  className="btn-emerald-primary px-4 py-2 text-xs sm:text-sm font-bold"
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

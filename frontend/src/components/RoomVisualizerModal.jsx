import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Upload, Camera, Wind, Zap, ShoppingCart, 
  Download, RotateCcw, Share2, Sparkles, Check, 
  Eye, Move, SlidersHorizontal, Sun, Moon, Info,
  ChevronLeft, ChevronRight, PhoneCall
} from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { usePopup } from '../context/PopupContext';

const SAMPLE_ROOMS = [
  {
    id: 'living_room',
    name: 'Modern Living Room',
    type: 'Living Room',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80',
    desc: 'Contemporary neutral wall with sofa & natural lighting'
  },
  {
    id: 'master_bedroom',
    name: 'Luxury Master Bedroom',
    type: 'Bedroom',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&q=80',
    desc: 'Spacious master bed wall with ambient recessed lights'
  },
  {
    id: 'study_room',
    name: 'Minimalist Study / Office',
    type: 'Workstation',
    image: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1600&q=80',
    desc: 'Compact desk workspace wall with minimal decor'
  },
  {
    id: 'dining_area',
    name: 'Spacious Dining Hall',
    type: 'Dining',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1600&q=80',
    desc: 'Open dining area with accent wall and wide ceiling span'
  }
];

export default function RoomVisualizerModal({ isOpen, onClose, initialProduct = null }) {
  const { addToCart } = useCart();
  const { showToast } = usePopup();

  // Products list for in-modal switcher
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(initialProduct);

  // Room photo state
  const [roomImage, setRoomImage] = useState(SAMPLE_ROOMS[0].image);
  const [isCustomUpload, setIsCustomUpload] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef(null);

  // AC Placement state (percentages of wall container 0-100)
  const [position, setPosition] = useState({ x: 50, y: 22 });
  const [scale, setScale] = useState(1.0); // 0.6x to 1.6x
  const [temperature, setTemperature] = useState(24);
  const [airflowEnabled, setAirflowEnabled] = useState(true);
  const [airflowSpeed, setAirflowSpeed] = useState('breeze'); // 'breeze' | 'turbo'
  const [showClearanceGuides, setShowClearanceGuides] = useState(true);
  const [lightingMode, setLightingMode] = useState('day'); // 'day' | 'warm' | 'night'
  const [viewMode, setViewMode] = useState('chassis'); // 'chassis' | 'catalog'
  const [isExporting, setIsExporting] = useState(false);

  // Dragging interaction state
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartOffsetRef = useRef({ x: 0, y: 0 });

  // Load products if not provided
  useEffect(() => {
    if (isOpen) {
      api.getProducts().then((data) => {
        if (data && data.length > 0) {
          setProducts(data);
          if (!selectedProduct) {
            setSelectedProduct(data[0]);
          }
        }
      }).catch(console.error);
    }
  }, [isOpen]);

  // Update selected product if initialProduct changes
  useEffect(() => {
    if (initialProduct) {
      setSelectedProduct(initialProduct);
    }
  }, [initialProduct]);

  if (!isOpen) return null;

  const currentProduct = selectedProduct || products[0] || {
    id: 1,
    title: 'Daikin 1.5 Ton 5 Star Inverter Split AC',
    brand: 'Daikin',
    tonnage: 1.5,
    star_rating: 5,
    price: 45490,
    original_price: 52000,
    ac_type: 'Split',
    image: '/images/products/daikin_split.jpg'
  };

  // Handle room photo upload via file input
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const processUploadedFile = (file) => {
    if (!file.type.startsWith('image/')) {
      showToast({ type: 'warning', title: 'Invalid File', message: 'Please upload an image file (JPG, PNG, WebP).' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setRoomImage(event.target.result);
      setIsCustomUpload(true);
      setUploadFileName(file.name);
      showToast({ 
        type: 'success', 
        title: 'Wall Photo Uploaded', 
        message: 'Your room photo is ready! Drag the AC anywhere to find the perfect wall fit.' 
      });
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop on container
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Interactive repositioning of the AC Unit
  const handlePointerDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const currentPxX = (position.x / 100) * rect.width;
      const currentPxY = (position.y / 100) * rect.height;
      dragStartOffsetRef.current = {
        offsetX: clientX - rect.left - currentPxX,
        offsetY: clientY - rect.top - currentPxY
      };
    }

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    if (e.cancelable) e.preventDefault();

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const rect = containerRef.current.getBoundingClientRect();

    const newPxX = clientX - rect.left - dragStartOffsetRef.current.offsetX;
    const newPxY = clientY - rect.top - dragStartOffsetRef.current.offsetY;

    // Convert to percentage and clamp so AC stays on wall
    const pctX = Math.max(12, Math.min(88, (newPxX / rect.width) * 100));
    const pctY = Math.max(10, Math.min(85, (newPxY / rect.height) * 100));

    setPosition({ x: pctX, y: pctY });
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    window.removeEventListener('mousemove', handlePointerMove);
    window.removeEventListener('mouseup', handlePointerUp);
    window.removeEventListener('touchmove', handlePointerMove);
    window.removeEventListener('touchend', handlePointerUp);
  };

  const handleResetPosition = () => {
    setPosition({ x: 50, y: 22 });
    setScale(1.0);
    showToast({ type: 'info', title: 'Position Reset', message: 'AC restored to recommended center-top wall position.' });
  };

  // Export room snapshot to canvas
  const handleDownloadSnapshot = async () => {
    setIsExporting(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');

      // Draw background room image
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        bgImg.onload = resolve;
        bgImg.onerror = () => {
          // If CORS fails on remote sample image, fall back gracefully
          resolve();
        };
        bgImg.src = roomImage;
      });

      if (bgImg.width) {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      } else {
        // Fallback neutral room wall background
        ctx.fillStyle = '#E5E2DA';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw Lighting tint overlay if applied
      if (lightingMode === 'warm') {
        ctx.fillStyle = 'rgba(255, 180, 50, 0.12)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (lightingMode === 'night') {
        ctx.fillStyle = 'rgba(10, 15, 30, 0.45)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Compute AC placement in 1280x800 canvas space
      const acCenterX = (position.x / 100) * canvas.width;
      const acCenterY = (position.y / 100) * canvas.height;
      const baseWidth = 360 * scale;
      const baseHeight = 110 * scale;
      const acLeft = acCenterX - baseWidth / 2;
      const acTop = acCenterY - baseHeight / 2;

      // Draw AC unit realistic wall shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 25 * scale;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 15 * scale;

      // Draw AC Unit chassis body
      ctx.fillStyle = '#FFFFFF';
      const r = 12 * scale;
      ctx.beginPath();
      ctx.moveTo(acLeft + r, acTop);
      ctx.lineTo(acLeft + baseWidth - r, acTop);
      ctx.quadraticCurveTo(acLeft + baseWidth, acTop, acLeft + baseWidth, acTop + r);
      ctx.lineTo(acLeft + baseWidth, acTop + baseHeight - r);
      ctx.quadraticCurveTo(acLeft + baseWidth, acTop + baseHeight, acLeft + baseWidth - r, acTop + baseHeight);
      ctx.lineTo(acLeft + r, acTop + baseHeight);
      ctx.quadraticCurveTo(acLeft, acTop + baseHeight, acLeft, acTop + baseHeight - r);
      ctx.lineTo(acLeft, acTop + r);
      ctx.quadraticCurveTo(acLeft, acTop, acLeft + r, acTop);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Top air intake grille
      ctx.fillStyle = '#E5E7EB';
      ctx.fillRect(acLeft + 20 * scale, acTop + 8 * scale, baseWidth - 40 * scale, 6 * scale);

      // Bottom louvre flap line
      ctx.fillStyle = '#D1D5DB';
      ctx.fillRect(acLeft + 15 * scale, acTop + baseHeight - 16 * scale, baseWidth - 30 * scale, 3 * scale);

      // Brand Logo Text
      ctx.fillStyle = '#1E3A8A';
      ctx.font = `bold ${Math.round(15 * scale)}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(currentProduct.brand.toUpperCase(), acLeft + 25 * scale, acTop + baseHeight - 32 * scale);

      // 5-Star BEE Badge
      ctx.fillStyle = '#DC2626';
      ctx.font = `bold ${Math.round(10 * scale)}px sans-serif`;
      ctx.fillText(`★ ${currentProduct.star_rating} STAR BEE`, acLeft + 25 * scale, acTop + 32 * scale);

      // LED Temperature Display (Glowing)
      ctx.save();
      ctx.fillStyle = '#059669';
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 8;
      ctx.font = `bold ${Math.round(24 * scale)}px monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(`${temperature}°C`, acLeft + baseWidth - 25 * scale, acTop + baseHeight / 2 + 8 * scale);
      ctx.restore();

      // Draw Watermark / Branding Footer Card in Snapshot
      ctx.fillStyle = 'rgba(17, 17, 17, 0.9)';
      const cardW = 460;
      const cardH = 90;
      const cardX = 30;
      const cardY = canvas.height - cardH - 30;
      
      // Card Background with rounded corners
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 16);
      ctx.fill();

      // Golden accent stripe on watermark card
      ctx.fillStyle = '#C8A96B';
      ctx.fillRect(cardX, cardY, 6, cardH);

      // Watermark text
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      ctx.fillText('COOLING HUB • PARSHWA ENTERPRISE', cardX + 22, cardY + 30);

      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#C8A96B';
      ctx.fillText(`AR Wall Visualizer: ${currentProduct.title}`, cardX + 22, cardY + 52);

      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`₹${currentProduct.price.toLocaleString()} • Ph: +91 94260 03525`, cardX + 22, cardY + 74);

      // Trigger automatic PNG download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `CoolingHub_${currentProduct.brand}_Room_Preview.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      showToast({
        type: 'success',
        title: 'Room Snapshot Saved!',
        message: 'Your customized room preview has been downloaded to your device.'
      });
    } catch (err) {
      console.error('Snapshot failed', err);
      showToast({ type: 'warning', title: 'Download Notice', message: 'Could not export snapshot directly due to image restrictions. You can take a screenshot of your wall preview!' });
    } finally {
      setIsExporting(false);
    }
  };

  // WhatsApp Inquiry
  const handleWhatsAppConsult = () => {
    const text = encodeURIComponent(
      `Hello Parshwa Enterprise! I used your Room Visualizer to preview the ${currentProduct.title} (₹${currentProduct.price.toLocaleString()}) on my room wall. Could you confirm installation availability and conduct a site survey?`
    );
    window.open(`https://wa.me/919426003525?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#2E2E2E] rounded-3xl shadow-2xl max-w-6xl w-full max-h-[96vh] flex flex-col overflow-hidden my-auto">
        
        {/* Modal Top Header */}
        <div className="px-5 py-4 bg-[#F7F6F2] dark:bg-[#252525] border-b border-[#E2E0DB] dark:border-[#2E2E2E] flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#111111] dark:bg-[#C8A96B] text-[#C8A96B] dark:text-[#111111] flex items-center justify-center font-bold shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-[#111111] dark:text-white text-base sm:text-lg">
                  AC Room Wall Visualizer (AR Preview)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#C8A96B]/20 text-[#111111] dark:text-[#C8A96B] text-[10px] font-black uppercase tracking-wider">
                  Interactive
                </span>
              </div>
              <p className="text-xs text-[#555555] dark:text-[#858585]">
                Upload your room photo, reposition the AC unit, test airflow, and see how it fits your wall before buying.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#555555] hover:text-[#111111] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
              title="Close Visualizer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split into Interactive Wall Canvas (Top/Left) & Controls/Switcher (Bottom/Right) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Main Visualizer Stage */}
          <div className="flex-1 flex flex-col bg-[#0F0F0F] relative min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] select-none overflow-hidden">
            
            {/* Top Canvas Action Overlay Bar */}
            <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              
              {/* Active Product Pill */}
              <div className="pointer-events-auto bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white text-xs font-semibold flex items-center space-x-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-[#C8A96B]">{currentProduct.brand}</span>
                <span>• {currentProduct.tonnage} Ton</span>
                <span className="text-white/60">|</span>
                <span className="font-bold text-white">₹{currentProduct.price.toLocaleString()}</span>
              </div>

              {/* Quick Canvas Helpers */}
              <div className="pointer-events-auto flex items-center space-x-1.5 bg-black/75 backdrop-blur-md p-1 rounded-2xl border border-white/20 shadow-lg">
                <button
                  onClick={() => setAirflowEnabled(!airflowEnabled)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center space-x-1 transition ${
                    airflowEnabled 
                      ? 'bg-[#C8A96B] text-[#111111]' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  title="Toggle Cooling Breeze Stream"
                >
                  <Wind className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Airflow</span>
                </button>

                <button
                  onClick={() => setShowClearanceGuides(!showClearanceGuides)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center space-x-1 transition ${
                    showClearanceGuides 
                      ? 'bg-white/25 text-white' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  title="Toggle Ceiling & Wall Clearance Guides"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Guides</span>
                </button>

                <button
                  onClick={handleResetPosition}
                  className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
                  title="Reset Position to Center"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* Room Wall Viewport Canvas */}
            <div 
              ref={containerRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex-1 relative w-full h-full overflow-hidden flex items-center justify-center cursor-crosshair transition-all ${
                isDraggingOver ? 'ring-4 ring-[#C8A96B] ring-inset' : ''
              }`}
            >
              {/* Room Background Photo */}
              <img
                src={roomImage}
                alt="Room Wall"
                className={`w-full h-full object-cover transition-all duration-300 pointer-events-none ${
                  lightingMode === 'warm' ? 'sepia-[0.3] brightness-95' : ''
                } ${
                  lightingMode === 'night' ? 'brightness-[0.4] contrast-125' : ''
                }`}
              />

              {/* Ceiling & Wall Clearance Guides (Dashed Lines) */}
              {showClearanceGuides && (
                <div className="absolute inset-0 pointer-events-none z-10 transition-opacity">
                  {/* Ceiling Clearance Line */}
                  <div 
                    className="absolute left-0 right-0 border-b-2 border-dashed border-[#C8A96B]/60 flex items-center justify-center"
                    style={{ top: `${Math.max(4, position.y - 12)}%` }}
                  >
                    <span className="bg-black/80 text-[#C8A96B] text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold tracking-wide -translate-y-1/2">
                      ↑ Min 15 cm Ceiling Air-Intake Clearance Recommended
                    </span>
                  </div>

                  {/* Horizontal Wall Alignment Guide */}
                  <div 
                    className="absolute left-0 right-0 border-b border-white/20"
                    style={{ top: `${position.y}%` }}
                  />

                  {/* Center Vertical Guideline */}
                  <div 
                    className="absolute top-0 bottom-0 border-r border-white/20"
                    style={{ left: `${position.x}%` }}
                  />
                </div>
              )}

              {/* Draggable AC Indoor Unit */}
              <div
                onMouseDown={handlePointerDown}
                onTouchStart={handlePointerDown}
                className="absolute z-20 cursor-grab active:cursor-grabbing transition-transform"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: `translate(-50%, -50%) scale(${scale})`,
                  touchAction: 'none'
                }}
              >
                
                {/* Visualizer Mode: 3D Realistic Chassis or Catalog Image */}
                {viewMode === 'catalog' ? (
                  <div className="relative rounded-2xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] border border-white/20 bg-white">
                    <img 
                      src={currentProduct.image} 
                      alt={currentProduct.title}
                      className="w-[280px] sm:w-[360px] md:w-[420px] h-[130px] sm:h-[160px] object-cover pointer-events-none"
                      onError={(e) => { e.target.src = '/images/products/daikin_split.jpg'; }}
                    />
                  </div>
                ) : (
                  /* Realistic 3D Indoor Split AC Unit Chassis */
                  <div 
                    className="relative w-[300px] sm:w-[380px] md:w-[430px] h-[95px] sm:h-[110px] rounded-2xl bg-gradient-to-b from-[#FFFFFF] via-[#F8F9FA] to-[#E5E7EB] border border-[#D1D5DB] shadow-[0_25px_45px_-10px_rgba(0,0,0,0.65),0_10px_20px_-5px_rgba(0,0,0,0.4)] flex flex-col justify-between p-3.5 overflow-visible select-none group"
                  >
                    
                    {/* Top Air Intake Grille Lines */}
                    <div className="w-full flex flex-col space-y-1 opacity-70">
                      <div className="h-1 bg-[#E2E8F0] rounded-full w-full shadow-inner" />
                      <div className="h-0.5 bg-[#CBD5E1] rounded-full w-11/12 mx-auto" />
                    </div>

                    {/* Front Chassis Face: Brand Badge, Energy Star, Digital Temp */}
                    <div className="flex items-center justify-between px-2 pt-1">
                      
                      {/* Brand Logo Display */}
                      <div className="flex flex-col">
                        <span className="font-black text-sm tracking-widest text-[#1E3A8A] uppercase">
                          {currentProduct.brand}
                        </span>
                        <span className="text-[8px] font-extrabold text-[#64748B] tracking-tight uppercase -mt-0.5">
                          {currentProduct.is_inverter ? 'AI Dual Inverter' : 'Heavy Duty'}
                        </span>
                      </div>

                      {/* Center Energy Star Logo */}
                      <div className="px-2 py-0.5 bg-gradient-to-r from-red-600 to-amber-500 text-white rounded text-[9px] font-extrabold tracking-tight flex items-center space-x-1 shadow-sm">
                        <span>★ {currentProduct.star_rating} STAR</span>
                      </div>

                      {/* Concealed LED Temperature Display */}
                      <div className="flex items-center space-x-1.5 bg-[#0F172A] px-2.5 py-1 rounded-lg border border-[#334155] shadow-inner">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-mono font-bold text-base text-emerald-400 tracking-wider">
                          {temperature}°C
                        </span>
                      </div>

                    </div>

                    {/* Bottom Motorized Louvre Flap */}
                    <div className="relative w-full pt-1">
                      <div className="h-2.5 bg-gradient-to-b from-[#E2E8F0] to-[#CBD5E1] rounded-full shadow-inner border-t border-[#94A3B8]/30 flex items-center justify-end px-3">
                        <span className="text-[7px] text-[#64748B] font-mono">COOLING VANE</span>
                      </div>
                    </div>

                    {/* Drag Move Handle Indicator (Hover/Touch) */}
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-[#C8A96B] px-3 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition shadow-lg pointer-events-none">
                      <Move className="w-3 h-3" />
                      <span>Drag to move on wall</span>
                    </div>

                  </div>
                )}

                {/* Animated Cooling Breeze Waves (Discharges downwards from louvres) */}
                {airflowEnabled && (
                  <div className="absolute top-[95%] left-0 right-0 pointer-events-none overflow-visible flex flex-col items-center">
                    
                    {/* Breeze Stream SVG */}
                    <svg 
                      className={`w-[340px] sm:w-[440px] h-[160px] sm:h-[220px] transition-opacity ${
                        airflowSpeed === 'turbo' ? 'opacity-90' : 'opacity-70'
                      }`}
                      viewBox="0 0 400 200" 
                      fill="none"
                    >
                      <defs>
                        <linearGradient id="breezeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
                          <stop offset="40%" stopColor="#818CF8" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="#C8A96B" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Flowing Wave Paths */}
                      <path
                        d="M 60 5 C 90 60, 40 120, 10 190"
                        stroke="url(#breezeGradient)"
                        strokeWidth="3"
                        strokeDasharray="16 12"
                        className="breeze-line"
                      />
                      <path
                        d="M 140 8 C 160 70, 130 130, 90 195"
                        stroke="url(#breezeGradient)"
                        strokeWidth="4"
                        strokeDasharray="20 14"
                        className="breeze-line"
                      />
                      <path
                        d="M 200 10 C 200 80, 200 140, 200 200"
                        stroke="url(#breezeGradient)"
                        strokeWidth="5"
                        strokeDasharray="24 16"
                        className="breeze-line"
                      />
                      <path
                        d="M 260 8 C 240 70, 270 130, 310 195"
                        stroke="url(#breezeGradient)"
                        strokeWidth="4"
                        strokeDasharray="20 14"
                        className="breeze-line"
                      />
                      <path
                        d="M 340 5 C 310 60, 360 120, 390 190"
                        stroke="url(#breezeGradient)"
                        strokeWidth="3"
                        strokeDasharray="16 12"
                        className="breeze-line"
                      />
                    </svg>

                    {/* Breeze Status Tag */}
                    <span className="text-[10px] font-mono font-bold text-sky-300 bg-black/60 px-2 py-0.5 rounded-full -mt-4 backdrop-blur-xs">
                      {airflowSpeed === 'turbo' ? '⚡ 4-Way Jet Cool Active' : '🍃 Gentle 3D Airflow'}
                    </span>
                  </div>
                )}

              </div>

              {/* Upload Drop Hint Overlay if dragging a photo */}
              {isDraggingOver && (
                <div className="absolute inset-0 bg-[#C8A96B]/20 backdrop-blur-xs flex items-center justify-center z-40 border-4 border-dashed border-[#C8A96B]">
                  <div className="bg-black/90 text-white p-6 rounded-3xl text-center space-y-2 shadow-2xl">
                    <Upload className="w-12 h-12 text-[#C8A96B] mx-auto animate-bounce" />
                    <h4 className="text-lg font-bold">Drop Room Photo Here</h4>
                    <p className="text-xs text-white/70">JPG, PNG, or WebP photo of your wall</p>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Floating Bar on Canvas: Upload Photo CTA & Sample Room Switcher */}
            <div className="p-3 bg-black/85 backdrop-blur-md border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-white z-30">
              
              {/* Photo Upload Triggers */}
              <div className="flex items-center space-x-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-emerald-primary px-3.5 py-2 text-xs font-bold flex items-center space-x-1.5 shadow-md"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Your Wall Photo</span>
                </button>

                {isCustomUpload && (
                  <span className="text-[11px] text-emerald-400 font-semibold truncate max-w-[140px] sm:max-w-[200px]">
                    ✓ {uploadFileName}
                  </span>
                )}
              </div>

              {/* Sample Room Presets Bar */}
              <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
                <span className="text-[11px] text-white/60 font-semibold mr-1 hidden sm:inline">
                  Or pick template:
                </span>
                {SAMPLE_ROOMS.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => {
                      setRoomImage(room.image);
                      setIsCustomUpload(false);
                      setUploadFileName('');
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      roomImage === room.image
                        ? 'bg-[#C8A96B] text-[#111111] font-bold shadow-sm'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {room.name}
                  </button>
                ))}
              </div>

            </div>

          </div>

          {/* Right Control & Customization Sidebar */}
          <div className="w-full lg:w-96 bg-[#FAF7F0] dark:bg-[#1A1A1A] border-t lg:border-t-0 lg:border-l border-[#E2E0DB] dark:border-[#2E2E2E] flex flex-col justify-between overflow-y-auto p-5 space-y-5">
            
            <div className="space-y-5">
              
              {/* Active Product Specs Card */}
              <div className="p-4 bg-white dark:bg-[#252525] rounded-2xl border border-[#E2E0DB] dark:border-[#2E2E2E] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-[#C8A96B] tracking-wider">
                    {currentProduct.brand} • {currentProduct.tonnage} Ton
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 text-[10px] font-bold rounded-md">
                    ★ {currentProduct.star_rating} Star BEE
                  </span>
                </div>

                <h4 className="font-black text-sm text-[#111111] dark:text-white line-clamp-2 leading-snug">
                  {currentProduct.title}
                </h4>

                <div className="flex items-baseline space-x-2 pt-1 border-t border-[#E2E0DB] dark:border-[#2E2E2E]">
                  <span className="text-xl font-black text-[#111111] dark:text-white">
                    ₹{currentProduct.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-[#555555] line-through">
                    ₹{currentProduct.original_price?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Wall Size & Dimension Adjustments */}
              <div className="space-y-3 p-4 bg-white dark:bg-[#252525] rounded-2xl border border-[#E2E0DB] dark:border-[#2E2E2E]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#111111] dark:text-white flex items-center space-x-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#C8A96B]" />
                    <span>AC Scale / Wall Distance</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-[#C8A96B]">
                    {Math.round(scale * 100)}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0.6"
                  max="1.5"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full accent-[#C8A96B] cursor-pointer"
                />

                <div className="flex items-center justify-between text-[11px] text-[#555555] dark:text-[#858585]">
                  <span>Far Wall (Smaller)</span>
                  <span>Close Wall (Larger)</span>
                </div>

                {/* Real-world dimension reference */}
                <div className="pt-2 border-t border-[#E2E0DB] dark:border-[#2E2E2E] flex items-center justify-between text-[11px]">
                  <span className="text-[#555555]">Real Dimensions:</span>
                  <span className="font-bold text-[#111111] dark:text-white">
                    88 cm (W) × 29 cm (H) × 21 cm (D)
                  </span>
                </div>
              </div>

              {/* Temperature & Breeze Controls */}
              <div className="space-y-3 p-4 bg-white dark:bg-[#252525] rounded-2xl border border-[#E2E0DB] dark:border-[#2E2E2E]">
                <label className="text-xs font-bold text-[#111111] dark:text-white flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Wind className="w-3.5 h-3.5 text-[#C8A96B]" />
                    <span>AC Digital Display Temp</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {temperature}°C
                  </span>
                </label>

                <div className="grid grid-cols-4 gap-2">
                  {[18, 20, 24, 26].map((temp) => (
                    <button
                      key={temp}
                      onClick={() => setTemperature(temp)}
                      className={`py-1.5 rounded-xl text-xs font-bold transition ${
                        temperature === temp
                          ? 'bg-[#111111] text-white shadow-sm'
                          : 'bg-[#F7F6F2] dark:bg-[#1E1E1E] text-[#555555] dark:text-[#858585] hover:bg-[#E2E0DB]'
                      }`}
                    >
                      {temp}°C
                    </button>
                  ))}
                </div>

                {/* Breeze Speed */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-[#555555]">Airflow Mode:</span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setAirflowSpeed('breeze')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                        airflowSpeed === 'breeze' 
                          ? 'bg-[#C8A96B] text-[#111111]' 
                          : 'bg-[#F7F6F2] dark:bg-[#1E1E1E] text-[#555555]'
                      }`}
                    >
                      Gentle
                    </button>
                    <button
                      onClick={() => setAirflowSpeed('turbo')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                        airflowSpeed === 'turbo' 
                          ? 'bg-[#C8A96B] text-[#111111]' 
                          : 'bg-[#F7F6F2] dark:bg-[#1E1E1E] text-[#555555]'
                      }`}
                    >
                      Turbo Jet
                    </button>
                  </div>
                </div>
              </div>

              {/* Room Lighting Mode Filter */}
              <div className="p-4 bg-white dark:bg-[#252525] rounded-2xl border border-[#E2E0DB] dark:border-[#2E2E2E] space-y-2.5">
                <label className="text-xs font-bold text-[#111111] dark:text-white flex items-center space-x-1.5">
                  <Sun className="w-3.5 h-3.5 text-[#C8A96B]" />
                  <span>Room Ambience Lighting</span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setLightingMode('day')}
                    className={`py-1.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition ${
                      lightingMode === 'day'
                        ? 'bg-[#111111] text-white shadow-sm'
                        : 'bg-[#F7F6F2] dark:bg-[#1E1E1E] text-[#555555]'
                    }`}
                  >
                    <Sun className="w-3 h-3 text-amber-500" />
                    <span>Daylight</span>
                  </button>

                  <button
                    onClick={() => setLightingMode('warm')}
                    className={`py-1.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition ${
                      lightingMode === 'warm'
                        ? 'bg-[#111111] text-white shadow-sm'
                        : 'bg-[#F7F6F2] dark:bg-[#1E1E1E] text-[#555555]'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Warm</span>
                  </button>

                  <button
                    onClick={() => setLightingMode('night')}
                    className={`py-1.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition ${
                      lightingMode === 'night'
                        ? 'bg-[#111111] text-white shadow-sm'
                        : 'bg-[#F7F6F2] dark:bg-[#1E1E1E] text-[#555555]'
                    }`}
                  >
                    <Moon className="w-3 h-3 text-indigo-400" />
                    <span>Night Glow</span>
                  </button>
                </div>
              </div>

              {/* Model Switcher Carousel: Test different brands on your wall */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#111111] dark:text-white">
                    Compare Other Models On This Wall:
                  </label>
                  <span className="text-[10px] text-[#555555]">
                    {products.length} Models
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {products.map((p) => {
                    const isSelected = p.id === currentProduct.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProduct(p)}
                        className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                          isSelected
                            ? 'bg-white dark:bg-[#252525] border-[#C8A96B] ring-2 ring-[#C8A96B]/30 shadow-sm'
                            : 'bg-white/60 dark:bg-[#202020] border-[#E2E0DB] dark:border-[#2E2E2E] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-[#C8A96B]">
                            {p.brand}
                          </span>
                          <span className="text-[9px] font-bold text-[#555555]">
                            ★ {p.star_rating}★
                          </span>
                        </div>
                        <h5 className="text-[11px] font-bold text-[#111111] dark:text-white line-clamp-1 mt-1">
                          {p.title}
                        </h5>
                        <span className="text-[11px] font-black text-[#111111] dark:text-white mt-1">
                          ₹{p.price.toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Bottom Actions CTA Bar */}
            <div className="space-y-2.5 pt-4 border-t border-[#E2E0DB] dark:border-[#2E2E2E]">
              
              <div className="grid grid-cols-2 gap-2">
                {/* Download Snapshot Button */}
                <button
                  onClick={handleDownloadSnapshot}
                  disabled={isExporting}
                  className="btn-emerald-secondary py-3 text-xs font-bold flex items-center justify-center space-x-1.5"
                  title="Export Room Design to PNG"
                >
                  <Download className="w-4 h-4 text-[#C8A96B]" />
                  <span>{isExporting ? 'Saving...' : 'Save Snapshot'}</span>
                </button>

                {/* WhatsApp Consultation */}
                <button
                  onClick={handleWhatsAppConsult}
                  className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-sm"
                  title="Consult Parshwa Enterprise on WhatsApp"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>WhatsApp Survey</span>
                </button>
              </div>

              {/* Add To Cart & Order Button */}
              <button
                onClick={() => {
                  addToCart(currentProduct);
                  showToast({
                    type: 'success',
                    title: 'Added to Cart',
                    message: `${currentProduct.title} added to your shopping cart!`
                  });
                  onClose();
                }}
                className="btn-emerald-primary w-full py-3.5 text-sm font-bold flex items-center justify-center space-x-2 shadow-lg"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Order This Model • ₹{currentProduct.price.toLocaleString()}</span>
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

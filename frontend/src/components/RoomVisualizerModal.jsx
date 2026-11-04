import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Upload, Camera, Wind, Zap, ShoppingCart, 
  Download, RotateCcw, Share2, Sparkles, Check, 
  Eye, Move, SlidersHorizontal, Sun, Moon, Info,
  ChevronLeft, ChevronRight, PhoneCall, RefreshCw,
  CheckCircle2, AlertCircle, Image as ImageIcon
} from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { usePopup } from '../context/PopupContext';

export default function RoomVisualizerModal({ isOpen, onClose, initialProduct = null }) {
  const { addToCart } = useCart();
  const { showToast } = usePopup();

  // Products list for in-modal switcher
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(initialProduct);

  // Room photo state (null by default so user can directly click or upload their real wall photo)
  const [roomImage, setRoomImage] = useState(null);
  const [isCustomUpload, setIsCustomUpload] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Live Camera Viewfinder state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('environment'); // 'environment' | 'user'
  const [cameraLoading, setCameraLoading] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // AC Placement state (percentages of wall container 0-100)
  const [position, setPosition] = useState({ x: 50, y: 22 });
  const [scale, setScale] = useState(1.0); // 0.6x to 1.6x
  const [temperature, setTemperature] = useState(24);
  const [airflowEnabled, setAirflowEnabled] = useState(true);
  const [airflowSpeed, setAirflowSpeed] = useState('breeze'); // 'breeze' | 'turbo'
  const [showClearanceGuides, setShowClearanceGuides] = useState(true);
  const [lightingMode, setLightingMode] = useState('day'); // 'day' | 'warm' | 'night'
  const [isExporting, setIsExporting] = useState(false);

  // Dragging interaction state
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartOffsetRef = useRef({ x: 0, y: 0 });

  // Cleanup camera stream
  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try { track.stop(); } catch (e) { /* ignore */ }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCameraLoading(false);
  };

  const handleClose = () => {
    stopLiveCamera();
    onClose();
  };

  useEffect(() => {
    return () => {
      stopLiveCamera();
    };
  }, []);

  // Live Camera stream initiator
  const startLiveCamera = async (facing = cameraFacing) => {
    stopLiveCamera();
    setIsCameraActive(true);
    setCameraLoading(true);
    setCameraFacing(facing);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera streaming not supported by browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraLoading(false);
    } catch (err) {
      console.warn("Live camera stream error, attempting direct camera input fallback:", err);
      setCameraLoading(false);
      setIsCameraActive(false);

      // Automatic fallback to native camera file input
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      } else {
        showToast({
          type: 'warning',
          title: 'Camera Access Needed',
          message: 'Could not access live camera. You can upload a photo of your wall directly.'
        });
      }
    }
  };

  // Re-attach video stream if active and video element mounts
  useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [isCameraActive]);

  // Click shutter to capture photo from live video stream
  const captureLivePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setRoomImage(dataUrl);
    setIsCustomUpload(true);
    setUploadFileName(`Live_Wall_${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.jpg`);
    stopLiveCamera();

    showToast({
      type: 'success',
      title: 'Wall Photo Captured!',
      message: 'Your live room photo is now set! Drag the AC to preview fit & airflow.'
    });
  };

  // Switch between front/rear camera
  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    startLiveCamera(nextFacing);
  };

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

  const getProductTransparentImage = (prod) => {
    if (!prod || !prod.image) return '/images/products/daikin_split.png';
    if (prod.image.endsWith('.png')) return prod.image;
    return prod.image.replace(/\.jpg$/i, '.png');
  };

  const currentProduct = selectedProduct || products[0] || {
    id: 1,
    title: 'Daikin 1.5 Ton 5 Star Inverter Split AC',
    brand: 'Daikin',
    tonnage: 1.5,
    star_rating: 5,
    price: 45490,
    original_price: 52000,
    ac_type: 'Split',
    image: '/images/products/daikin_split.png'
  };

  // Handle room photo upload via file input
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
      e.target.value = '';
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
      setUploadFileName(file.name || 'Custom_Room_Wall.jpg');
      stopLiveCamera();
      showToast({ 
        type: 'success', 
        title: 'Wall Photo Ready', 
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

      // Draw real AC product photo (transparent cutout) from store catalog
      const acImg = new Image();
      acImg.crossOrigin = 'anonymous';
      await new Promise((resolve) => {
        acImg.onload = resolve;
        acImg.onerror = resolve;
        acImg.src = getProductTransparentImage(currentProduct);
      });

      // Maintain aspect ratio of transparent AC image
      const acAspect = (acImg.width && acImg.height) ? (acImg.width / acImg.height) : 2.8;
      const baseWidth = 440 * scale;
      const baseHeight = baseWidth / acAspect;
      const acLeft = acCenterX - baseWidth / 2;
      const acTop = acCenterY - baseHeight / 2;

      // Draw AC unit realistic wall shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      ctx.shadowBlur = 25 * scale;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 15 * scale;

      if (acImg.width) {
        ctx.drawImage(acImg, acLeft, acTop, baseWidth, baseHeight);
      }
      ctx.restore();

      // Brand & Star badge floating above product
      ctx.fillStyle = 'rgba(17, 17, 17, 0.85)';
      ctx.beginPath();
      ctx.roundRect(acLeft + 8 * scale, acTop - 18 * scale, 120 * scale, 20 * scale, 6 * scale);
      ctx.fill();
      ctx.fillStyle = '#C8A96B';
      ctx.font = `bold ${Math.round(11 * scale)}px sans-serif`;
      ctx.fillText(`${currentProduct.brand} ★${currentProduct.star_rating}★`, acLeft + 15 * scale, acTop - 4 * scale);

      // LED Temperature Display (Glowing on right panel)
      ctx.save();
      ctx.fillStyle = '#10B981';
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 8;
      ctx.font = `bold ${Math.round(16 * scale)}px monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(`${temperature}°C`, acLeft + baseWidth - 22 * scale, acTop + baseHeight - 16 * scale);
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
              onClick={handleClose}
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
            
            {isCameraActive ? (
              /* LIVE CAMERA VIEWFINDER OVERLAY */
              <div className="flex-1 relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
                {/* Live Video Stream from Camera */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Camera Connecting Indicator */}
                {cameraLoading && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center space-y-3 z-30">
                    <div className="w-10 h-10 border-3 border-[#C8A96B] border-t-transparent rounded-full animate-spin" />
                    <p className="text-white text-xs font-bold">Connecting to camera...</p>
                  </div>
                )}

                {/* Live Viewfinder Alignment Overlay */}
                <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-6">
                  
                  {/* Top Banner */}
                  <div className="flex items-center justify-between pointer-events-auto">
                    <div className="bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white text-xs font-semibold flex items-center space-x-2 shadow-lg">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="font-bold">Live Wall Viewfinder</span>
                      <span className="text-white/40">|</span>
                      <span className="text-[#C8A96B] text-[11px]">Frame your room wall</span>
                    </div>

                    <button
                      onClick={stopLiveCamera}
                      className="p-2 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 transition shadow-lg cursor-pointer"
                      title="Exit Camera View"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Target Framing Box for AC Placement */}
                  <div className="w-11/12 max-w-lg mx-auto h-36 sm:h-44 rounded-2xl border-2 border-dashed border-[#C8A96B] flex flex-col items-center justify-center bg-[#C8A96B]/15 backdrop-blur-xs text-center p-3">
                    <Camera className="w-8 h-8 text-[#C8A96B] mb-1.5 animate-bounce" />
                    <span className="text-white text-xs sm:text-sm font-extrabold drop-shadow-md">
                      Aim camera directly at your room wall
                    </span>
                    <span className="text-[11px] text-[#C8A96B] font-medium mt-0.5">
                      Tap the gold shutter button below to click & use immediately
                    </span>
                  </div>

                  {/* Bottom Controls: Flip, Snap, or Native Camera */}
                  <div className="flex items-center justify-center space-x-5 pointer-events-auto pb-2">
                    {/* Flip Camera */}
                    <button
                      onClick={toggleCameraFacing}
                      className="p-3.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/30 transition shadow-lg cursor-pointer"
                      title="Switch Front / Rear Camera"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>

                    {/* Large Shutter Button */}
                    <button
                      onClick={captureLivePhoto}
                      disabled={cameraLoading}
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#C8A96B] hover:bg-[#d8bb7f] border-4 border-white shadow-[0_0_35px_rgba(200,169,107,0.7)] flex items-center justify-center active:scale-95 transition-all group cursor-pointer"
                      title="Click to Snap & Use Wall Photo"
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[#111111]/30 flex items-center justify-center">
                        <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-[#111111] group-hover:scale-110 transition-transform" />
                      </div>
                    </button>

                    {/* Alternative: Device Native Camera */}
                    <button
                      onClick={() => {
                        stopLiveCamera();
                        cameraInputRef.current?.click();
                      }}
                      className="px-3.5 py-3 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/30 text-xs font-bold transition shadow-lg flex items-center space-x-1.5 cursor-pointer"
                      title="Open Device Native Camera"
                    >
                      <span>Phone Cam</span>
                    </button>
                  </div>

                </div>
              </div>
            ) : (
              <>
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
              className={`flex-1 relative w-full h-full overflow-hidden flex items-center justify-center transition-all ${
                roomImage ? 'cursor-crosshair' : 'cursor-default'
              } ${isDraggingOver ? 'ring-4 ring-[#C8A96B] ring-inset' : ''}`}
            >
              {!roomImage ? (
                /* Initial Setup State: Instant Camera Click or Photo Upload (No Templates) */
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#181818] via-[#111111] to-[#0A0A0A] select-none">
                  {/* Subtle ambient glow & grid pattern */}
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C8A96B_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#C8A96B]/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative max-w-md w-full bg-[#1A1A1A]/95 backdrop-blur-md border border-[#C8A96B]/30 rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] space-y-5 animate-in fade-in zoom-in-95 duration-200">
                    
                    {/* Header */}
                    <div className="space-y-2">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#C8A96B] to-[#9E7D3B] text-[#111111] flex items-center justify-center shadow-lg shadow-[#C8A96B]/25">
                        <Camera className="w-7 h-7" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                        Preview on Your Real Wall
                      </h3>
                      <p className="text-xs text-[#A3A3A3] leading-relaxed">
                        Snap a photo of your wall right now or upload one to see how the{' '}
                        <span className="text-[#C8A96B] font-bold">{currentProduct.brand} {currentProduct.tonnage} Ton AC</span>{' '}
                        looks and fits before buying.
                      </p>
                    </div>

                    {/* Two Prominent Action Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      
                      {/* Card 1: Click Live Photo */}
                      <button
                        onClick={() => startLiveCamera()}
                        className="group relative p-4 rounded-2xl bg-gradient-to-b from-[#C8A96B] to-[#A38343] hover:from-[#d8bb7f] hover:to-[#b39352] text-[#111111] font-bold text-left transition-all duration-200 shadow-lg hover:shadow-[0_0_25px_rgba(200,169,107,0.4)] hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between h-32"
                      >
                        <div className="w-9 h-9 rounded-xl bg-black/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Camera className="w-5 h-5 text-[#111111]" />
                        </div>
                        <div>
                          <span className="block text-sm font-black text-[#111111]">Click Live Photo</span>
                          <span className="block text-[11px] text-[#111111]/80 mt-0.5 font-medium">Camera Viewfinder</span>
                        </div>
                      </button>

                      {/* Card 2: Upload Wall Photo */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="group relative p-4 rounded-2xl bg-[#242424] hover:bg-[#2C2C2C] border border-white/10 hover:border-[#C8A96B]/60 text-white font-bold text-left transition-all duration-200 shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between h-32"
                      >
                        <div className="w-9 h-9 rounded-xl bg-white/10 text-[#C8A96B] flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="block text-sm font-black text-white group-hover:text-[#C8A96B] transition-colors">Upload Photo</span>
                          <span className="block text-[11px] text-[#888888] mt-0.5 font-medium">Gallery or PC Files</span>
                        </div>
                      </button>

                    </div>

                    {/* Drag & Drop Hint */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-center space-x-2 text-[11px] text-white/50">
                      <ImageIcon className="w-3.5 h-3.5 text-[#C8A96B]" />
                      <span>Or drag & drop any room wall photo directly here</span>
                    </div>

                  </div>
                </div>
              ) : (
                /* Active Room Wall AR View */
                <>
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

                  {/* Draggable AC Indoor Unit - Authentic Store Product Photo */}
                  <div
                    onMouseDown={handlePointerDown}
                    onTouchStart={handlePointerDown}
                    className="absolute z-20 cursor-grab active:cursor-grabbing transition-transform group"
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                      transform: `translate(-50%, -50%) scale(${scale})`,
                      touchAction: 'none'
                    }}
                  >
                    {/* Realistic Wall Mounted AC Unit (No white background container) */}
                    <div className="relative select-none filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.65)]">
                      
                      {/* Transparent Cutout AC Image (Only the AC body, zero white margins) */}
                      <img 
                        src={getProductTransparentImage(currentProduct)} 
                        alt={currentProduct.title}
                        className="w-[280px] sm:w-[390px] md:w-[460px] h-auto object-contain select-none pointer-events-none block"
                        onError={(e) => { 
                          e.target.src = currentProduct.image || '/images/products/daikin_split.png'; 
                        }}
                      />

                      {/* Brand & Star Rating Badge - Floating cleanly above the top-left edge */}
                      <div className="absolute -top-3 left-2 px-2.5 py-0.5 rounded-full bg-black/85 backdrop-blur-md text-white text-[10px] font-bold flex items-center space-x-1.5 border border-white/15 shadow-md pointer-events-none">
                        <span className="text-[#C8A96B] font-extrabold tracking-wider uppercase">{currentProduct.brand}</span>
                        <span className="text-amber-400">★{currentProduct.star_rating}★</span>
                      </div>

                      {/* Concealed Realistic Digital Temperature LED Glow on the unit */}
                      <div className="absolute bottom-2.5 right-4 sm:right-6 px-2 py-0.5 rounded-md bg-[#0F172A]/85 backdrop-blur-xs border border-[#334155]/60 shadow-inner flex items-center space-x-1 pointer-events-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-mono font-bold text-xs sm:text-sm text-emerald-400 tracking-wider">
                          {temperature}°C
                        </span>
                      </div>

                      {/* Drag Move Handle Pill on Hover */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-md text-[#C8A96B] px-3 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition shadow-lg pointer-events-none whitespace-nowrap">
                        <Move className="w-3 h-3" />
                        <span>Drag anywhere on wall</span>
                      </div>
                    </div>

                    {/* Animated Cooling Breeze Waves */}
                    {airflowEnabled && (
                      <div className="absolute top-[96%] left-0 right-0 pointer-events-none overflow-visible flex flex-col items-center">
                        <svg 
                          className={`w-[340px] sm:w-[440px] h-[150px] sm:h-[210px] transition-opacity ${
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

                          <path d="M 60 5 C 90 60, 40 120, 10 190" stroke="url(#breezeGradient)" strokeWidth="3" strokeDasharray="16 12" className="breeze-line" />
                          <path d="M 140 8 C 160 70, 130 130, 90 195" stroke="url(#breezeGradient)" strokeWidth="4" strokeDasharray="20 14" className="breeze-line" />
                          <path d="M 200 10 C 200 80, 200 140, 200 200" stroke="url(#breezeGradient)" strokeWidth="5" strokeDasharray="24 16" className="breeze-line" />
                          <path d="M 260 8 C 240 70, 270 130, 310 195" stroke="url(#breezeGradient)" strokeWidth="4" strokeDasharray="20 14" className="breeze-line" />
                          <path d="M 340 5 C 310 60, 360 120, 390 190" stroke="url(#breezeGradient)" strokeWidth="3" strokeDasharray="16 12" className="breeze-line" />
                        </svg>

                        <span className="text-[10px] font-mono font-bold text-sky-300 bg-black/60 px-2 py-0.5 rounded-full -mt-4 backdrop-blur-xs">
                          {airflowSpeed === 'turbo' ? '⚡ 4-Way Jet Cool Active' : '🍃 Gentle 3D Airflow'}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}

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
          </>
        )}

        {/* Bottom Floating Bar on Canvas: Direct Click Camera & Upload Photo CTAs (NO templates) */}
        <div className="p-3 bg-black/85 backdrop-blur-md border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-white z-30">
          
          {/* Photo Input Actions */}
          <div className="flex items-center space-x-2">
            {/* Hidden file input for Photo Upload (Gallery / Files) */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />

            {/* Hidden file input for Direct Native Camera Capture */}
            <input 
              type="file" 
              ref={cameraInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
            />
            
            {/* Button 1: Click Live Photo with Camera */}
            <button
              onClick={() => startLiveCamera()}
              className="btn-emerald-primary px-3.5 py-2 text-xs font-bold flex items-center space-x-1.5 shadow-md cursor-pointer"
              title="Click live photo directly from camera"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{roomImage ? 'Click New Photo' : 'Click Live Photo'}</span>
            </button>

            {/* Button 2: Upload Photo from Gallery/Device */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-bold flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
              title="Upload photo of your room or wall from files"
            >
              <Upload className="w-3.5 h-3.5 text-[#C8A96B]" />
              <span>{roomImage ? 'Upload Different' : 'Upload Wall Photo'}</span>
            </button>

            {roomImage && (
              <span className="text-[11px] text-emerald-400 font-semibold truncate max-w-[130px] sm:max-w-[180px] hidden sm:inline">
                ✓ {uploadFileName || 'Wall Active'}
              </span>
            )}
          </div>

          {/* Right side actions in bottom bar */}
          <div className="flex items-center space-x-2">
            {roomImage && (
              <button
                onClick={() => {
                  setRoomImage(null);
                  setIsCustomUpload(false);
                  setUploadFileName('');
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs font-medium transition cursor-pointer flex items-center space-x-1.5"
                title="Change or reset wall photo"
              >
                <RotateCcw className="w-3 h-3 text-[#C8A96B]" />
                <span>Change Wall</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Right Control & Customization Sidebar */}
      <div className="w-full lg:w-96 bg-[#FAF7F0] dark:bg-[#1A1A1A] border-t lg:border-t-0 lg:border-l border-[#E2E0DB] dark:border-[#2E2E2E] flex flex-col justify-between overflow-y-auto p-5 space-y-5">
        
        <div className="space-y-5">

          {/* Room Wall Source Selection: Direct Click Camera or Upload Photo */}
          <div className="p-4 bg-white dark:bg-[#252525] rounded-2xl border border-[#E2E0DB] dark:border-[#2E2E2E] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#111111] dark:text-white flex items-center space-x-1.5">
                <Camera className="w-3.5 h-3.5 text-[#C8A96B]" />
                <span>Your Room Wall Photo</span>
              </label>
              {roomImage ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 text-[10px] font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Wall Photo Active</span>
                </span>
              ) : (
                <span className="text-[10px] text-[#858585] font-semibold">
                  Awaiting Wall Photo
                </span>
              )}
            </div>

            {/* Two Main Option Cards: Click Live Photo & Upload Wall Photo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Option 1: Direct Click Photo with Camera */}
              <button
                onClick={() => startLiveCamera()}
                className="p-3 rounded-xl bg-gradient-to-r from-[#111111] to-[#252525] text-white border border-[#C8A96B]/50 hover:border-[#C8A96B] hover:shadow-md transition text-left flex items-center space-x-2.5 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-[#C8A96B] text-[#111111] flex items-center justify-center font-bold shrink-0 group-hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-extrabold text-xs text-white">Click Live Photo</span>
                  <span className="block text-[10px] text-[#C8A96B]">Snap from Camera</span>
                </div>
              </button>

              {/* Option 2: Upload Photo from Gallery/Files */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-xl bg-white dark:bg-[#1E1E1E] text-[#111111] dark:text-white border border-[#E2E0DB] dark:border-[#383838] hover:border-[#C8A96B] hover:shadow-md transition text-left flex items-center space-x-2.5 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-[#FAF7F0] dark:bg-[#2A2A2A] text-[#111111] dark:text-[#C8A96B] flex items-center justify-center font-bold shrink-0 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5 text-[#C8A96B]" />
                </div>
                <div>
                  <span className="block font-extrabold text-xs text-[#111111] dark:text-white">Upload Room Photo</span>
                  <span className="block text-[10px] text-[#555555] dark:text-[#858585]">Gallery or PC Files</span>
                </div>
              </button>
            </div>

            {/* Status info & Reset */}
            {roomImage && (
              <div className="pt-2 border-t border-[#E2E0DB] dark:border-[#2E2E2E] flex items-center justify-between text-xs">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-[170px]">
                  ✓ {uploadFileName || 'Custom Wall'}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => startLiveCamera()}
                    className="text-[11px] font-bold text-[#C8A96B] hover:underline cursor-pointer"
                  >
                    Retake
                  </button>
                  <span className="text-gray-400">•</span>
                  <button
                    onClick={() => {
                      setRoomImage(null);
                      setIsCustomUpload(false);
                      setUploadFileName('');
                    }}
                    className="text-[11px] font-medium text-rose-500 hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
          </div>


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

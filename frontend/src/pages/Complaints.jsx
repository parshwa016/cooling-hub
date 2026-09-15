import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, Search, Clock, CheckCircle2, 
  Wrench, Upload, ArrowRight, ShieldAlert, FileText,
  User, Phone, MapPin, Calendar, Check, Camera, Image, X, Eye, Loader2,
  ChevronDown, Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { usePopup } from '../context/PopupContext';
import LuxurySelect from '../components/LuxurySelect';

const getStatusBadge = (status) => {
  switch (status) {
    case 'Pending':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700';
    case 'Confirmed':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700';
    case 'Assigned':
      return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700';
    case 'In Progress':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-700 animate-pulse';
    case 'Completed':
    case 'Closed':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700';
    default:
      return 'bg-rose-500/10 text-rose-600 border-rose-300';
  }
};

function ServiceTrackingTimeline({ status, technicianName, createdAt, acceptedAt, completedAt }) {
  const getStage = (st) => {
    switch (st) {
      case 'Pending': return 1;
      case 'Confirmed': return 2;
      case 'Assigned': return 3;
      case 'In Progress': return 4;
      case 'Completed': case 'Closed': return 5;
      default: return 1;
    }
  };

  const stage = getStage(status);
  const tech = technicianName || 'Rajesh Kumar (Senior Technician)';

  const steps = [
    {
      num: 1,
      title: 'Request Submitted',
      sub: createdAt ? `Submitted on ${new Date(createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}` : 'Logged into Cooling Hub dispatch system'
    },
    {
      num: 2,
      title: 'Request Confirmed',
      sub: stage >= 2 
        ? (acceptedAt ? `Confirmed on ${new Date(acceptedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}` : 'Confirmed & scheduled by Admin') 
        : 'Awaiting admin dispatch approval'
    },
    {
      num: 3,
      title: `Service Man Assigned (${tech})`,
      sub: stage >= 3 
        ? `Assigned: ${tech} • Ready for doorstep service` 
        : stage === 2 
          ? 'Admin assigning technician for slot' 
          : 'Pending prior confirmation'
    },
    {
      num: 4,
      title: 'Service In Progress',
      sub: stage >= 4 
        ? (stage === 4 ? 'Technician is actively servicing your AC on-site' : 'On-site service completed') 
        : 'Technician will start on arrival'
    },
    {
      num: 5,
      title: 'Service Completed',
      sub: stage >= 5 
        ? (completedAt ? `Completed on ${new Date(completedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} • Quality verified` : 'Doorstep service completed & certified') 
        : 'Final service completion & sign-off'
    }
  ];

  return (
    <div className="space-y-0 relative pl-1 py-1.5">
      {steps.map((step, idx) => {
        const isDone = stage > step.num;
        const isCurrent = stage === step.num;
        const isPastOrCurrent = stage >= step.num;
        const isLast = idx === steps.length - 1;

        return (
          <div key={step.num} className="flex items-start gap-3 relative pb-3.5 last:pb-0">
            {/* Step Icon & Vertical Connecting Line */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-sm transition-all duration-200 z-10 ${
                  isPastOrCurrent
                    ? 'bg-[#111111] dark:bg-[#C8A96B] text-[#C8A96B] dark:text-[#111111] ring-2 ring-[#C8A96B]/30'
                    : 'bg-[#FAF7F0] dark:bg-[#252525] text-[#858585] border border-[#E2E0DB] dark:border-[#333333]'
                } ${isCurrent && status !== 'Completed' ? 'ring-4 ring-[#C8A96B]/25 animate-pulse' : ''}`}
              >
                {isPastOrCurrent ? '✓' : step.num}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 min-h-[22px] my-0.5 transition-colors duration-200 ${
                    stage > step.num ? 'bg-[#C8A96B]' : 'bg-[#E2E0DB] dark:bg-[#333333]'
                  }`}
                />
              )}
            </div>

            {/* Step Label & Detail */}
            <div className="-mt-0.5 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1.5">
                <span
                  className={`text-xs font-bold block truncate ${
                    isPastOrCurrent
                      ? 'text-[#111111] dark:text-white'
                      : 'text-[#858585] dark:text-[#777777]'
                  }`}
                >
                  {step.title}
                </span>
                {isCurrent && status !== 'Completed' && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#C8A96B]/15 text-[#C8A96B] border border-[#C8A96B]/30 shrink-0 animate-pulse">
                    Active
                  </span>
                )}
                {isDone && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                    Done
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#858585] mt-0.5 leading-relaxed">
                {step.sub}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Complaints({ setActiveTab }) {
  const { currentUser, openAuthModal } = useAuth();
  const { showModal, showToast } = usePopup();
  
  // Customer info state
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerAddress, setCustomerAddress] = useState(currentUser?.address || '');
  const [preferredSlot, setPreferredSlot] = useState('Tomorrow Morning (9 AM - 12 PM)');

  // Raise form state
  const [acBrand, setAcBrand] = useState('LG 1.5T Inverter Split AC');
  const [issueCat, setIssueCat] = useState('Water Leakage');
  const [priority, setPriority] = useState('High');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track ticket state
  const [trackTicketId, setTrackTicketId] = useState('');
  const [trackedComplaint, setTrackedComplaint] = useState(null);
  const [trackError, setTrackError] = useState('');

  // User tickets list & hover state
  const [myComplaints, setMyComplaints] = useState([]);
  const [hoveredRecentId, setHoveredRecentId] = useState(null);
  const [pinnedRecentId, setPinnedRecentId] = useState(null);

  useEffect(() => {
    if (currentUser) {
      if (!customerName) setCustomerName(currentUser.name || '');
      if (!customerPhone) setCustomerPhone(currentUser.phone || '');
      if (!customerAddress) setCustomerAddress(currentUser.address || '');
    }
  }, [currentUser]);

  const loadUserComplaints = () => {
    if (currentUser?.id) {
      api.getUserComplaints(currentUser.id)
        .then((data) => {
          setMyComplaints(data);
          if (data.length > 0 && !trackTicketId) {
            setTrackTicketId(data[0].ticket_id);
            setTrackedComplaint(data[0]);
          }
        })
        .catch(console.error);
    } else {
      setMyComplaints([]);
    }
  };

  useEffect(() => {
    loadUserComplaints();
  }, [currentUser?.id]);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast({
        type: 'error',
        title: 'Invalid File Type',
        message: 'Please select an image file (JPG, PNG, WebP).'
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast({
        type: 'error',
        title: 'File Too Large',
        message: 'Problem photo must be smaller than 10MB.'
      });
      return;
    }

    setPhotoFile(file);
    const localUrl = URL.createObjectURL(file);
    setPhotoPreview(localUrl);
    setIsUploadingPhoto(true);

    try {
      const res = await api.uploadComplaintPhoto(file);
      setPhotoUrl(res.url);
      setIsUploadingPhoto(false);
      showToast({
        type: 'success',
        title: 'Photo Attached',
        message: 'AC problem photo uploaded successfully.'
      });
    } catch (err) {
      console.warn('Direct upload error, generating local preview:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result);
        setIsUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    setPhotoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRaiseSubmit = async (e) => {
    e.preventDefault();
    if (!description) return;

    if (!currentUser) {
      openAuthModal('prompt');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.raiseComplaint({
        user_id: currentUser.id,
        customer_name: customerName || currentUser.name,
        customer_phone: customerPhone || currentUser.phone || '+91 9800011223',
        customer_address: customerAddress || currentUser.address || 'Standard Address',
        preferred_slot: preferredSlot,
        ac_brand_model: acBrand,
        issue_category: issueCat,
        priority: priority,
        description: description,
        photo_url: photoUrl || undefined
      });
      setIsSubmitting(false);
      setDescription('');
      handleRemovePhoto();
      loadUserComplaints();
      setTrackTicketId(res.ticket_id);
      setTrackedComplaint(res);
      showModal({
        type: 'success',
        title: 'Complaint Ticket Registered!',
        badge: 'Pending Admin Approval',
        message: 'Your AC service complaint ticket has been submitted to dispatch. Our administrative team is reviewing your ticket and will assign a certified technician.',
        details: {
          'Ticket Number': res.ticket_id,
          'AC Product': acBrand,
          'Issue Reported': issueCat,
          'Priority Level': priority,
          'Preferred Slot': preferredSlot,
          'Current Status': 'Pending Admin Approval'
        },
        confirmText: 'View Ticket Timeline'
      });
    } catch (err) {
      setIsSubmitting(false);
      showToast({
        type: 'error',
        title: 'Submission Failed',
        message: err.message
      });
    }
  };

  const handleTrackSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!trackTicketId) return;
    setTrackError('');
    try {
      const res = await api.trackComplaint(trackTicketId.trim());
      setTrackedComplaint(res);
    } catch (err) {
      setTrackedComplaint(null);
      setTrackError(`Ticket ID '${trackTicketId}' not found in database.`);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* Header */}
      <div className="bg-[#111111] text-white p-5 sm:p-6 rounded-2xl border border-[#292929] shadow-sm space-y-2.5">
        <span className="px-2.5 py-0.5 bg-[#C8A96B] text-[#111111] text-[11px] font-black rounded-full uppercase tracking-wider">
          FAST-TRACK REPAIR DISPATCH
        </span>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">📢 Complaint & Escalation Desk</h1>
        <p className="text-xs text-[#858585] max-w-2xl font-normal leading-relaxed">
          Experiencing cooling issues, water leakage, or electrical compressor tripping? Register your service complaint for priority technician dispatch within 4 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Form: Raise Complaint */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1A1A1A] p-6 sm:p-10 rounded-3xl border border-[#E2E0DB] dark:border-[#2E2E2E] shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-[#111111] dark:text-white">Register AC Complaint Ticket</h2>
            <p className="text-xs sm:text-sm text-[#555555] dark:text-[#858585]">
              Provide your AC details and contact info. Our admin dispatch will assign a technician immediately.
            </p>
          </div>

          <form onSubmit={handleRaiseSubmit} className="space-y-5 text-xs sm:text-sm">
            
            {/* Customer Contact & Address */}
            <div className="p-4 bg-[#FAF7F0] dark:bg-[#252525] rounded-2xl border border-[#E2E0DB] dark:border-[#333333] space-y-4">
              <span className="font-extrabold text-[#111111] dark:text-white text-xs uppercase tracking-wider block">
                1. Customer & Service Location
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#111111] dark:text-white mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full p-2.5 bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#333333] rounded-xl text-[#111111] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111111] dark:text-white mb-1">Contact Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full p-2.5 bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#333333] rounded-xl text-[#111111] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#111111] dark:text-white mb-1">Complete Service Address</label>
                <input
                  type="text"
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="House/Flat No., Apartment, Street, Locality, Pincode"
                  className="w-full p-2.5 bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#333333] rounded-xl text-[#111111] dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-[#111111] dark:text-white mb-1">Preferred Service Time Slot</label>
                <LuxurySelect
                  value={preferredSlot}
                  onChange={(e) => setPreferredSlot(e.target.value)}
                  options={[
                    'Today Evening (4 PM - 7 PM)',
                    'Tomorrow Morning (9 AM - 12 PM)',
                    'Tomorrow Afternoon (12 PM - 3 PM)',
                    'Tomorrow Evening (4 PM - 7 PM)',
                    'Weekend Priority Slot (10 AM - 2 PM)'
                  ]}
                  size="sm"
                />
              </div>
            </div>

            {/* AC Unit & Issue Details */}
            <span className="font-extrabold text-[#111111] dark:text-white text-xs uppercase tracking-wider block pt-1">
              2. AC Unit & Problem Symptoms
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#111111] dark:text-white mb-1">AC Brand & Model</label>
                <input
                  type="text"
                  value={acBrand}
                  onChange={(e) => setAcBrand(e.target.value)}
                  placeholder="e.g. Daikin 1.5T 5-Star Split AC"
                  className="w-full p-2.5 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#333333] rounded-xl text-[#111111] dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#111111] dark:text-white mb-1">Issue Category</label>
                <LuxurySelect
                  value={issueCat}
                  onChange={(e) => setIssueCat(e.target.value)}
                  options={[
                    'Cooling Problem (Blowing Warm Air)',
                    'Water Leakage from Indoor Unit',
                    'Loud Rattling / Vibrating Noise',
                    'Refrigerant Gas Leakage',
                    'Compressor Tripping Electrical Circuit',
                    'Remote Control / Sensor Error'
                  ]}
                  size="sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#111111] dark:text-white mb-1">Priority Level</label>
              <LuxurySelect
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                options={[
                  { value: 'Normal', label: 'Normal (Response within 24 Hrs)', badge: 'Standard' },
                  { value: 'High', label: 'High (Response within 6 Hrs)', badge: 'Fast' },
                  { value: 'Emergency', label: 'Emergency (Immediate 2-4 Hrs Response)', badge: 'Urgent' }
                ]}
                size="sm"
              />
            </div>

            {/* Problem Photo Attachment */}
            <div>
              <label className="block font-bold text-[#111111] dark:text-white mb-1">
                Attach Photo of the Problem (Optional)
              </label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                accept="image/*"
                className="hidden"
              />

              {!photoPreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group border-2 border-dashed border-[#E2E0DB] dark:border-[#333333] hover:border-[#C8A96B] dark:hover:border-[#C8A96B] bg-[#F7F6F2] dark:bg-[#252525] hover:bg-[#FAF7F0] dark:hover:bg-[#2A2A2A] rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#333333] group-hover:border-[#C8A96B] flex items-center justify-center transition shadow-sm">
                    <Camera className="w-5 h-5 text-[#C8A96B]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#111111] dark:text-white group-hover:text-[#C8A96B] transition">
                      Click to attach photo of the problem
                    </span>
                    <p className="text-[11px] text-[#858585] mt-0.5">
                      Upload photo of leak, error code, outdoor unit, or damaged coil (PNG, JPG, WebP up to 10MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[#FAF7F0] dark:bg-[#252525] border border-[#C8A96B]/40 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black/5 dark:bg-black/40 border border-[#E2E0DB] dark:border-[#333333] shrink-0">
                      <img
                        src={photoPreview}
                        alt="AC Issue Preview"
                        className="w-full h-full object-cover"
                      />
                      {isUploadingPhoto && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                          <Loader2 className="w-4 h-4 text-[#C8A96B] animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#111111] dark:text-white truncate">
                          {photoFile?.name || 'Problem Photo'}
                        </span>
                        {!isUploadingPhoto && photoUrl && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Attached
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#858585] mt-0.5">
                        {photoFile ? `${(photoFile.size / 1024).toFixed(0)} KB` : 'Problem photo'} • {isUploadingPhoto ? 'Uploading to server...' : 'Saved to ticket'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-bold text-[#111111] dark:text-white hover:text-[#C8A96B] bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#333333] rounded-xl transition shadow-sm"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                      title="Remove photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-[#111111] dark:text-white mb-1">Problem Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happens when you turn on the AC (e.g. water dripping on floor after 20 minutes, compressor fan not rotating)..."
                rows={3}
                className="w-full p-2.5 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#333333] rounded-xl text-[#111111] dark:text-white resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-emerald-primary w-full py-3.5 text-sm font-bold"
            >
              {isSubmitting ? 'Logging Ticket...' : 'Generate Emergency Complaint Ticket'}
            </button>
          </form>
        </div>

        {/* Right Tracker & Active Tickets */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Tracker Card */}
          <div className="bg-white dark:bg-[#1A1A1A] text-[#111111] dark:text-white p-6 sm:p-8 rounded-3xl border border-[#E2E0DB] dark:border-[#292929] shadow-sm space-y-5">
            <h3 className="font-bold text-base flex items-center space-x-2 text-[#111111] dark:text-[#C8A96B]">
              <Search className="w-4 h-4 text-[#C8A96B]" />
              <span>Live Complaint Tracker</span>
            </h3>

            <form onSubmit={handleTrackSubmit} className="flex items-center space-x-2">
              <input
                type="text"
                value={trackTicketId}
                onChange={(e) => setTrackTicketId(e.target.value)}
                placeholder="Enter Ticket ID (e.g. CMP-2026-8941)"
                className="flex-1 px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#333333] rounded-xl text-xs sm:text-sm text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C8A96B]"
              />
              <button
                type="submit"
                className="btn-emerald-primary px-5 py-2.5 text-xs sm:text-sm font-bold"
              >
                Track
              </button>
            </form>

            {trackError && <p className="text-xs text-rose-500 font-semibold">{trackError}</p>}

            {trackedComplaint && (
              <div className="p-5 bg-[#F7F6F2] dark:bg-[#252525] rounded-2xl border border-[#E2E0DB] dark:border-[#292929] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-black text-base text-[#111111] dark:text-[#C8A96B]">{trackedComplaint.ticket_id}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    trackedComplaint.status === 'Pending'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700'
                      : trackedComplaint.status === 'Confirmed'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700'
                        : trackedComplaint.status === 'Assigned'
                          ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700'
                          : trackedComplaint.status === 'In Progress'
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-700 animate-pulse'
                            : trackedComplaint.status === 'Completed'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-300'
                  }`}>
                    {trackedComplaint.status === 'Pending' ? 'Pending Admin Approval' : trackedComplaint.status}
                  </span>
                </div>

                {/* Status-specific informative banner */}
                {trackedComplaint.status === 'Pending' && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 space-y-0.5">
                    <strong className="block font-bold">Service Request Submitted</strong>
                    <p>Your service request has been submitted and is waiting for admin confirmation.</p>
                  </div>
                )}
                {trackedComplaint.status === 'Confirmed' && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs text-blue-900 dark:text-blue-200 space-y-0.5">
                    <strong className="block font-bold">Service Request Confirmed</strong>
                    <p>Your service request has been accepted by the admin. Awaiting service man assignment.</p>
                  </div>
                )}
                {trackedComplaint.status === 'Assigned' && (
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-xs text-indigo-900 dark:text-indigo-200 space-y-0.5">
                    <strong className="block font-bold">Service Man Assigned</strong>
                    <p>Technician {trackedComplaint.technician_name} has been assigned for your preferred slot ({trackedComplaint.preferred_slot}).</p>
                  </div>
                )}
                {trackedComplaint.status === 'In Progress' && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 rounded-xl text-xs text-purple-900 dark:text-purple-200 space-y-0.5">
                    <strong className="block font-bold">Service In Progress</strong>
                    <p>Technician {trackedComplaint.technician_name} is actively working on your AC unit.</p>
                  </div>
                )}

                <div className="text-xs text-[#555555] dark:text-[#858585] space-y-1">
                  <p><strong className="text-[#111111] dark:text-white">AC:</strong> {trackedComplaint.ac_brand_model}</p>
                  <p><strong className="text-[#111111] dark:text-white">Issue:</strong> {trackedComplaint.issue_category}</p>
                  {trackedComplaint.preferred_slot && (
                    <p><strong className="text-[#111111] dark:text-white">Slot:</strong> {trackedComplaint.preferred_slot}</p>
                  )}
                  {trackedComplaint.technician_name && (
                    <p><strong className="text-[#111111] dark:text-[#C8A96B]">Assigned Tech:</strong> {trackedComplaint.technician_name}</p>
                  )}
                </div>

                {/* Attached Problem Photo */}
                {trackedComplaint.photo_url && (
                  <div className="pt-2 border-t border-[#E2E0DB] dark:border-[#292929]">
                    <span className="text-[11px] font-extrabold text-[#858585] uppercase tracking-wider block mb-2">
                      Attached Problem Photo
                    </span>
                    <a
                      href={trackedComplaint.photo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block w-full h-36 rounded-2xl overflow-hidden border border-[#E2E0DB] dark:border-[#333333] bg-black/5 hover:border-[#C8A96B] transition shadow-sm"
                    >
                      <img
                        src={trackedComplaint.photo_url}
                        alt="Attached Problem"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-[1px]">
                        <Eye className="w-4 h-4 text-[#C8A96B]" />
                        <span>View Full Size Photo</span>
                      </div>
                    </a>
                  </div>
                )}

                {/* 5-Step Dedicated Service Status Timeline */}
                <div className="pt-3 border-t border-[#E2E0DB] dark:border-[#292929] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-[#858585] uppercase tracking-wider block">
                      5-Step Live Service Tracking
                    </span>
                    <span className="text-[10px] text-[#C8A96B] font-bold">
                      Stage {trackedComplaint.status === 'Completed' || trackedComplaint.status === 'Closed' ? 5 : trackedComplaint.status === 'In Progress' ? 4 : trackedComplaint.status === 'Assigned' ? 3 : trackedComplaint.status === 'Confirmed' ? 2 : 1} of 5
                    </span>
                  </div>
                  
                  <ServiceTrackingTimeline
                    status={trackedComplaint.status}
                    technicianName={trackedComplaint.technician_name}
                    createdAt={trackedComplaint.created_at}
                    acceptedAt={trackedComplaint.accepted_at}
                    completedAt={trackedComplaint.completed_at}
                  />
                </div>

                {/* Technician Contact Card when assigned */}
                {['Assigned', 'In Progress', 'Completed', 'Closed'].includes(trackedComplaint.status) && (
                  <div className="p-3 bg-[#111111] text-white rounded-xl border border-[#C8A96B]/40 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#C8A96B] text-[#111111] flex items-center justify-center font-black text-xs shadow-sm">
                        {(trackedComplaint.technician_name || 'Rajesh Kumar').charAt(0)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block leading-tight">
                          {trackedComplaint.technician_name || 'Rajesh Kumar (Senior Technician)'}
                        </span>
                        <span className="text-[10px] text-[#C8A96B] block">Assigned Doorstep Service Man</span>
                      </div>
                    </div>
                    <a
                      href={`tel:${trackedComplaint.technician_phone || '+91 9811223344'}`}
                      className="px-3 py-1.5 bg-[#222222] hover:bg-[#C8A96B] hover:text-[#111111] text-[#C8A96B] rounded-lg text-xs font-bold transition flex items-center space-x-1.5 border border-[#C8A96B]/30 shadow-sm"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call Tech</span>
                    </a>
                  </div>
                )}

                {/* Completion Summary */}
                {['Completed', 'Closed'].includes(trackedComplaint.status) && (trackedComplaint.service_notes || trackedComplaint.resolution_notes) && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300">
                    <strong className="block font-bold">✅ Service Report:</strong>
                    <p className="mt-0.5">{trackedComplaint.service_notes || trackedComplaint.resolution_notes}</p>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* User Complaint History list */}
          <div className="bg-white dark:bg-[#1A1A1A] p-6 sm:p-8 rounded-3xl border border-[#E2E0DB] dark:border-[#292929] space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#111111] dark:text-white text-base flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#C8A96B]" />
                <span>Your Recent Complaints ({myComplaints.length})</span>
              </h3>
              {myComplaints.length > 0 && (
                <span className="text-[11px] text-[#858585] hidden sm:flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#C8A96B]" />
                  Hover to extend details
                </span>
              )}
            </div>

            {myComplaints.length === 0 ? (
              <p className="text-xs text-[#858585]">No active complaints logged.</p>
            ) : (
              <div className="space-y-3">
                {myComplaints.map((c) => {
                  const isExpanded = hoveredRecentId === c.id || pinnedRecentId === c.id;
                  const isSelected = trackTicketId === c.ticket_id;
                  const st = c.status;
                  const stage = st === 'Completed' || st === 'Closed' ? 5 : st === 'In Progress' ? 4 : st === 'Assigned' ? 3 : st === 'Confirmed' ? 2 : 1;
                  const techName = c.technician_name || 'Rajesh Kumar (Senior Technician)';
                  const techPhone = c.technician_phone || '+91 9811223344';

                  return (
                    <div 
                      key={c.id}
                      onMouseEnter={() => setHoveredRecentId(c.id)}
                      onMouseLeave={() => setHoveredRecentId(null)}
                      onClick={() => {
                        setPinnedRecentId(pinnedRecentId === c.id ? null : c.id);
                        setTrackTicketId(c.ticket_id);
                        setTrackedComplaint(c);
                      }}
                      className={`group rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                        isSelected || isExpanded
                          ? 'bg-gradient-to-b from-white to-[#FAF7F0] dark:from-[#1E1E1E] dark:to-[#181818] border-[#C8A96B] shadow-xl ring-2 ring-[#C8A96B]/25 p-4'
                          : 'bg-[#F7F6F2] dark:bg-[#252525] border-[#E2E0DB] dark:border-[#2E2E2E] hover:border-[#C8A96B]/80 hover:shadow-md p-3.5'
                      }`}
                    >
                      {/* Top Bar: Ticket ID & Status Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-xs sm:text-sm text-[#111111] dark:text-[#C8A96B]">
                            {c.ticket_id}
                          </span>
                          {isSelected && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#C8A96B]/15 text-[#C8A96B] border border-[#C8A96B]/30 shrink-0">
                              Active
                            </span>
                          )}
                          <ChevronDown className={`w-4 h-4 text-[#858585] transition-transform duration-300 ${
                            isExpanded ? 'rotate-180 text-[#C8A96B]' : 'group-hover:text-[#C8A96B]'
                          }`} />
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${getStatusBadge(st)}`}>
                          {st === 'Pending' ? 'Pending Admin Approval' : st}
                        </span>
                      </div>

                      {/* Brief Info */}
                      <div className="flex items-center justify-between text-xs text-[#555555] dark:text-[#858585] pt-1.5">
                        <span className="truncate max-w-[220px] font-medium text-[#111111] dark:text-[#E2E0DB]">
                          {c.ac_brand_model}
                        </span>
                        <span className="px-2 py-0.5 bg-[#FAF7F0] dark:bg-[#151515] border border-[#E2E0DB] dark:border-[#333333] rounded text-[10px] font-bold text-[#111111] dark:text-[#C8A96B] shrink-0">
                          {c.issue_category}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#858585] pt-0.5">
                        <span>🕒 {c.preferred_slot || 'Doorstep Slot'}</span>
                        {c.photo_url && (
                          <span className="text-[10px] text-[#C8A96B] font-semibold flex items-center gap-1">
                            <Camera className="w-3 h-3" /> Photo Attached
                          </span>
                        )}
                      </div>

                      {/* Mini Stepper when collapsed */}
                      {!isExpanded && (
                        <div className="pt-2 border-t border-[#E2E0DB]/60 dark:border-[#333333]/60 mt-2">
                          <div className="flex items-center justify-between text-[10px] text-[#858585] mb-1">
                            <span>Stage {stage} of 5: <strong className="text-[#111111] dark:text-white">{stage === 5 ? 'Completed' : stage === 4 ? 'In Progress' : stage === 3 ? 'Tech Assigned' : stage === 2 ? 'Confirmed' : 'Submitted'}</strong></span>
                            <span className="text-[#C8A96B] font-bold group-hover:underline flex items-center gap-0.5">
                              Hover to extend details ▾
                            </span>
                          </div>
                          <div className="grid grid-cols-5 gap-1.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <div
                                key={s}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  stage >= s
                                    ? (s === 5 ? 'bg-emerald-500' : 'bg-[#C8A96B]')
                                    : 'bg-[#E2E0DB] dark:bg-[#333333]'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* EXTENDED DETAILS REVEALED ON HOVER / CLICK */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-[#E2E0DB] dark:border-[#2E2E2E] space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                          
                          {/* Photo Thumbnail if attached */}
                          {c.photo_url && (
                            <div className="rounded-xl overflow-hidden border border-[#E2E0DB] dark:border-[#333333] relative h-28 bg-black/5">
                              <img
                                src={c.photo_url}
                                alt="Attached Problem"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white rounded text-[9px] font-bold">
                                Attached Problem Photo
                              </div>
                            </div>
                          )}

                          {/* Problem description if provided */}
                          {c.description && (
                            <div className="p-2.5 bg-[#FAF7F0] dark:bg-[#151515] rounded-xl border border-[#E2E0DB] dark:border-[#333333] text-xs text-[#555555] dark:text-[#858585]">
                              <strong className="block text-[#111111] dark:text-white font-semibold text-[11px] mb-0.5">Issue Description:</strong>
                              <p className="line-clamp-2">{c.description}</p>
                            </div>
                          )}

                          {/* 5-Step Timeline */}
                          <div className="pt-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#858585] block mb-2">
                              5-Step Service Timeline
                            </span>
                            <ServiceTrackingTimeline
                              status={st}
                              technicianName={techName}
                              createdAt={c.created_at}
                              acceptedAt={c.accepted_at}
                              completedAt={c.completed_at}
                            />
                          </div>

                          {/* Technician Card if assigned */}
                          {stage >= 3 && (
                            <div className="p-2.5 bg-[#111111] text-white rounded-xl border border-[#C8A96B]/40 flex items-center justify-between">
                              <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#C8A96B] text-[#111111] flex items-center justify-center font-black text-xs shadow-sm">
                                  {techName.charAt(0)}
                                </div>
                                <div>
                                  <span className="text-xs font-bold text-white block leading-tight">{techName}</span>
                                  <span className="text-[10px] text-[#C8A96B] block">Assigned Doorstep Service Man</span>
                                </div>
                              </div>
                              <a
                                href={`tel:${techPhone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="px-3 py-1.5 bg-[#222222] hover:bg-[#C8A96B] hover:text-[#111111] text-[#C8A96B] rounded-lg text-xs font-bold transition flex items-center space-x-1.5 border border-[#C8A96B]/30 shadow-sm"
                              >
                                <Phone className="w-3 h-3" />
                                <span>Call Tech</span>
                              </a>
                            </div>
                          )}

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Package, Calendar, Wrench, AlertTriangle, ShieldCheck, 
  FileText, Clock, Printer, User, RefreshCw, CheckCircle2,
  ChevronDown, Phone, MapPin, Check, Info, Sparkles, Eye, ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import InvoiceModal from '../components/InvoiceModal';

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

export default function CustomerDashboard({ setActiveTab }) {
  const { currentUser, openAuthModal } = useAuth();
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [amcSubs, setAmcSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Service appointment hover / expansion state
  const [hoveredBookingId, setHoveredBookingId] = useState(null);
  const [pinnedBookingId, setPinnedBookingId] = useState(null);

  // Complaints hover / expansion state
  const [hoveredComplaintId, setHoveredComplaintId] = useState(null);
  const [pinnedComplaintId, setPinnedComplaintId] = useState(null);

  // Selected order for invoice view
  const [selectedOrderInvoice, setSelectedOrderInvoice] = useState(null);

  const fetchUserData = (silent = false) => {
    if (!currentUser?.id) return;
    if (!silent) setLoading(true);
    Promise.all([
      api.getUserOrders(currentUser.id),
      api.getUserBookings(currentUser.id),
      api.getUserComplaints(currentUser.id),
      api.getUserAMC(currentUser.id)
    ]).then(([ords, bks, cmps, amcs]) => {
      setOrders(ords || []);
      setBookings(bks || []);
      setComplaints(cmps || []);
      setAmcSubs(amcs || []);
    }).catch(console.error).finally(() => {
      if (!silent) setLoading(false);
    });
  };

  useEffect(() => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }
    fetchUserData(false);
    // Polling every 4 seconds to sync live status updates from admin
    const interval = setInterval(() => {
      fetchUserData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  if (!currentUser) {
    return (
      <div className="py-14 flex flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-[#111111] text-[#C8A96B] flex items-center justify-center font-bold text-lg shadow-md border border-[#C8A96B]/30">
          <User className="w-6 h-6 text-[#C8A96B]" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-[#111111] dark:text-white">Customer Portal Sign In</h2>
          <p className="text-xs text-[#858585] leading-relaxed">
            Please sign in or create an account to view your past orders, active AMC contracts, and service tickets.
          </p>
        </div>
        <div className="flex gap-2.5 w-full pt-1">
          <button
            onClick={() => openAuthModal('login')}
            className="btn-emerald-primary flex-1 py-2.5 text-xs font-bold"
          >
            Sign In
          </button>
          <button
            onClick={() => openAuthModal('signup')}
            className="btn-emerald-secondary flex-1 py-2.5 text-xs font-bold"
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* User Header */}
      <div className="bg-white dark:bg-[#1A1A1A] p-4 sm:p-5 rounded-2xl border border-[#E2E0DB] dark:border-[#292929] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#111111] border border-[#C8A96B]/40 text-[#C8A96B] flex items-center justify-center font-black text-base shadow-sm">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C8A96B]">Customer Portal</span>
            <h1 className="text-lg sm:text-xl font-black text-[#111111] dark:text-white tracking-tight">{currentUser.name}</h1>
            <p className="text-xs text-[#858585]">{currentUser.email} • {currentUser.phone}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('shop')}
            className="btn-emerald-primary px-3.5 py-2 text-xs font-bold"
          >
            + Buy New AC
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className="btn-emerald-secondary px-3.5 py-2 text-xs font-bold"
          >
            + Book Service
          </button>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Orders & Invoices */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Orders Section */}
          <div className="bg-white dark:bg-[#1A1A1A] p-4 sm:p-5 rounded-2xl border border-[#E2E0DB] dark:border-[#292929] shadow-sm space-y-3.5">
            <h2 className="text-sm sm:text-base font-bold text-[#111111] dark:text-white flex items-center space-x-2">
              <Package className="w-4 h-4 text-[#C8A96B]" />
              <span>My AC Orders & Invoices ({orders.length})</span>
            </h2>

            {loading ? (
              <div className="py-6 text-center text-[#858585] text-xs">Loading orders...</div>
            ) : orders.length === 0 ? (
              <p className="text-xs text-[#858585] py-2">No AC purchase orders found.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-3.5 bg-[#F7F6F2] dark:bg-[#252525] rounded-xl border border-[#E2E0DB] dark:border-[#292929] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-[#111111] dark:text-[#C8A96B]">{ord.order_number}</span>
                        <p className="text-[11px] text-[#858585] mt-0.5">{new Date(ord.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-[#FAF7F0] dark:bg-[#1A1A1A] text-[#111111] dark:text-[#C8A96B] border border-[#C8A96B]/40 rounded-full font-bold text-[10px]">
                        {ord.order_status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E2E0DB] dark:border-[#292929]">
                      <div>
                        <span className="text-[#858585] block text-[10px]">Total Paid</span>
                        <span className="font-bold text-sm text-[#111111] dark:text-white">₹{ord.total_amount.toLocaleString()}</span>
                      </div>
                      <button
                        onClick={() => setSelectedOrderInvoice(ord)}
                        className="btn-emerald-secondary px-3 py-1.5 text-xs font-semibold"
                      >
                        <Printer className="w-3.5 h-3.5 mr-1" />
                        <span>View Invoice</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AMC Subscriptions */}
          <div className="bg-white dark:bg-[#1A1A1A] p-4 sm:p-5 rounded-2xl border border-[#E2E0DB] dark:border-[#292929] shadow-sm space-y-3.5">
            <h2 className="text-sm sm:text-base font-bold text-[#111111] dark:text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#C8A96B]" />
              <span>Active AMC Contracts ({amcSubs.length})</span>
            </h2>

            {amcSubs.length === 0 ? (
              <div className="p-3.5 bg-[#F7F6F2] dark:bg-[#252525] rounded-xl text-xs text-[#858585] space-y-2 border border-[#E2E0DB] dark:border-[#292929]">
                <p>You don't have an active Annual Maintenance Contract (AMC).</p>
                <button
                  onClick={() => setActiveTab('amc')}
                  className="btn-emerald-primary px-3 py-1.5 text-xs font-bold"
                >
                  Explore AMC Protection Plans
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {amcSubs.map((sub) => (
                  <div key={sub.id} className="p-3.5 bg-[#111111] text-white rounded-xl border border-[#C8A96B]/40 space-y-2.5 shadow-md">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs sm:text-sm text-[#C8A96B]">{sub.ac_brand_model}</h4>
                      <span className="px-2 py-0.5 bg-[#C8A96B] text-[#111111] rounded-full font-bold text-[10px]">
                        {sub.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-[#858585]">
                      <p><strong className="text-white">Total Covered Visits:</strong> {sub.visits_total}</p>
                      <p><strong className="text-white">Completed Visits:</strong> {sub.visits_completed}</p>
                      <p><strong className="text-white">Visits Remaining:</strong> {sub.visits_total - sub.visits_completed}</p>
                      <p><strong className="text-white">Expires On:</strong> {new Date(sub.end_date).toLocaleDateString()}</p>
                    </div>

                    <div className="pt-2 border-t border-[#292929] flex justify-end">
                      <button
                        onClick={() => setActiveTab('services')}
                        className="btn-emerald-secondary px-3 py-1 text-xs font-bold bg-white text-[#111111]"
                      >
                        Schedule Free AMC Service
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Bookings & Complaints */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Service Appointments */}
          <div className="bg-white dark:bg-[#1A1A1A] p-4 sm:p-5 rounded-2xl border border-[#E2E0DB] dark:border-[#292929] shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-[#111111] dark:text-white flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-[#C8A96B]" />
                <span>Service Appointments ({bookings.length})</span>
              </h2>
              <button
                onClick={() => setActiveTab('services')}
                className="text-xs font-bold text-[#111111] dark:text-[#C8A96B] hover:underline"
              >
                + Book Service
              </button>
            </div>

            <p className="text-[11px] text-[#858585] flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C8A96B] shrink-0" />
              <span>Hover on any appointment to extend the 5-step live tracking details.</span>
            </p>

            {bookings.length === 0 ? (
              <p className="text-xs text-[#858585] py-2">No scheduled service appointments.</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => {
                  const isExpanded = hoveredBookingId === b.id || pinnedBookingId === b.id;
                  const st = b.status;
                  const stage = st === 'Completed' || st === 'Closed' ? 5 : st === 'In Progress' ? 4 : st === 'Assigned' ? 3 : st === 'Confirmed' ? 2 : 1;
                  const techName = b.technician_name || b.technician?.name || (b.technician_id === 2 ? 'Rajesh Kumar (Senior Technician)' : b.technician_id === 3 ? 'Amit Sharma (HVAC Specialist)' : 'Rajesh Kumar (Senior Technician)');
                  const techPhone = b.technician_phone || b.technician?.phone || '+91 9811223344';

                  return (
                    <div 
                      key={b.id} 
                      onMouseEnter={() => setHoveredBookingId(b.id)}
                      onMouseLeave={() => setHoveredBookingId(null)}
                      onClick={() => setPinnedBookingId(pinnedBookingId === b.id ? null : b.id)}
                      className={`group rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                        isExpanded
                          ? 'bg-gradient-to-b from-white to-[#FAF7F0] dark:from-[#1E1E1E] dark:to-[#181818] border-[#C8A96B] shadow-xl ring-2 ring-[#C8A96B]/25 p-4'
                          : 'bg-[#F7F6F2] dark:bg-[#252525] border-[#E2E0DB] dark:border-[#2E2E2E] hover:border-[#C8A96B]/80 hover:shadow-md p-3.5'
                      }`}
                    >
                      {/* Top Bar: Booking ID & Status Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-xs sm:text-sm text-[#111111] dark:text-[#C8A96B]">
                            {b.booking_number}
                          </span>
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
                          {b.service?.title || 'Comprehensive AC Doorstep Service'}
                        </span>
                        <span className="font-bold text-[#111111] dark:text-[#C8A96B] ml-2 shrink-0">
                          ₹{b.price}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#858585] pt-0.5">
                        <span>📅 {b.service_date} ({b.service_time_slot})</span>
                        {b.technician_name && (
                          <span className="text-[#C8A96B] font-bold truncate max-w-[150px]">
                            👨‍🔧 {b.technician_name.split(' ')[0]}
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

                      {/* EXTENDED DETAILS REVEALED ON HOVER */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-[#E2E0DB] dark:border-[#2E2E2E] space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                          
                          {/* Live Status Guidance Banner */}
                          {st === 'Pending' && (
                            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                              <strong className="block font-bold">Service Request Submitted</strong>
                              <p className="mt-0.5">Your service appointment has been submitted to dispatch and is awaiting admin confirmation.</p>
                            </div>
                          )}
                          {st === 'Confirmed' && (
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                              <strong className="block font-bold">Service Request Confirmed</strong>
                              <p className="mt-0.5">Your appointment has been approved by admin. A certified technician is being assigned for your slot.</p>
                            </div>
                          )}
                          {st === 'Assigned' && (
                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                              <strong className="block font-bold">Service Man Assigned</strong>
                              <p className="mt-0.5">Technician {techName} has been assigned for your doorstep service.</p>
                            </div>
                          )}
                          {st === 'In Progress' && (
                            <div className="p-2.5 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 rounded-xl text-xs text-purple-900 dark:text-purple-200 leading-relaxed">
                              <strong className="block font-bold">Service In Progress</strong>
                              <p className="mt-0.5">Technician is actively servicing your air conditioner on-site.</p>
                            </div>
                          )}
                          {st === 'Completed' && (
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                              <strong className="block font-bold">Service Completed</strong>
                              <p className="mt-0.5">Doorstep service has been completed and verified. Thank you for choosing Cooling Hub!</p>
                            </div>
                          )}

                          {/* Specifics Box */}
                          <div className="p-3 bg-white dark:bg-[#202020] rounded-xl border border-[#E2E0DB] dark:border-[#333333] text-xs space-y-1.5 shadow-sm">
                            <div className="flex justify-between">
                              <span className="text-[#858585]">Service Package:</span>
                              <strong className="text-[#111111] dark:text-white">{b.service?.title || 'AC Doorstep Service'}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#858585]">Scheduled Slot:</span>
                              <span className="font-semibold text-[#111111] dark:text-white">{b.service_date} ({b.service_time_slot})</span>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-[#858585]">Service Address:</span>
                              <span className="font-medium text-[#111111] dark:text-white text-right max-w-[200px]">
                                {b.address}
                              </span>
                            </div>
                          </div>

                          {/* 5-Step Detailed Progress Timeline */}
                          <div className="pt-1">
                            <span className="text-[11px] font-extrabold text-[#C8A96B] uppercase tracking-wider block mb-2">
                              5-Step Service Timeline
                            </span>
                            <ServiceTrackingTimeline
                              status={st}
                              technicianName={techName}
                              createdAt={b.created_at}
                              acceptedAt={b.accepted_at}
                              completedAt={b.completed_at}
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

          {/* My Complaints & Service Requests */}
          <div className="bg-white dark:bg-[#1A1A1A] p-4 sm:p-5 rounded-2xl border border-[#E2E0DB] dark:border-[#292929] shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-[#111111] dark:text-white flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-[#C8A96B]" />
                <span>My Complaints & Service Requests ({complaints.length})</span>
              </h2>
              <button
                onClick={() => setActiveTab('complaints')}
                className="text-xs font-bold text-[#111111] dark:text-[#C8A96B] hover:underline"
              >
                + Raise New
              </button>
            </div>

            <p className="text-[11px] text-[#858585] flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C8A96B] shrink-0" />
              <span>Hover on any ticket to extend the 5-step live tracking details.</span>
            </p>

            {complaints.length === 0 ? (
              <p className="text-xs text-[#858585] py-2">No complaints or service requests logged.</p>
            ) : (
              <div className="space-y-3">
                {complaints.map((c) => {
                  const isExpanded = hoveredComplaintId === c.id || pinnedComplaintId === c.id;
                  const st = c.status;
                  const stage = st === 'Completed' || st === 'Closed' ? 5 : st === 'In Progress' ? 4 : st === 'Assigned' ? 3 : st === 'Confirmed' ? 2 : 1;
                  const techName = c.technician_name || (c.technician_id === 2 ? 'Rajesh Kumar (Senior Technician)' : c.technician_id === 3 ? 'Amit Sharma (HVAC Specialist)' : 'Rajesh Kumar (Senior Technician)');
                  const techPhone = c.technician_phone || '+91 9811223344';

                  return (
                    <div 
                      key={c.id} 
                      onMouseEnter={() => setHoveredComplaintId(c.id)}
                      onMouseLeave={() => setHoveredComplaintId(null)}
                      onClick={() => setPinnedComplaintId(pinnedComplaintId === c.id ? null : c.id)}
                      className={`group rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                        isExpanded
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
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF7F0] dark:bg-[#222222] text-[#C8A96B] border border-[#C8A96B]/30 shrink-0">
                          {c.issue_category}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#858585] pt-0.5">
                        <span>🕒 Logged on {new Date(c.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        {c.photo_url && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            📷 Photo Attached
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

                      {/* EXTENDED DETAILS REVEALED ON HOVER */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-[#E2E0DB] dark:border-[#2E2E2E] space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                          
                          {/* Status Guidance Banner */}
                          {st === 'Pending' && (
                            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                              <strong className="block font-bold">Service Request Submitted</strong>
                              <p className="mt-0.5">Your service request has been registered and is currently pending admin review & approval.</p>
                            </div>
                          )}
                          {st === 'Confirmed' && (
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                              <strong className="block font-bold">Service Request Confirmed</strong>
                              <p className="mt-0.5">Your request has been approved by admin. A certified service man is being assigned.</p>
                            </div>
                          )}
                          {st === 'Assigned' && (
                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                              <strong className="block font-bold">Service Man Assigned</strong>
                              <p className="mt-0.5">Technician {techName} has been assigned for your service request.</p>
                            </div>
                          )}
                          {st === 'In Progress' && (
                            <div className="p-2.5 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 rounded-xl text-xs text-purple-900 dark:text-purple-200 leading-relaxed">
                              <strong className="block font-bold">Service In Progress</strong>
                              <p className="mt-0.5">Technician is actively repairing / servicing your AC unit on site.</p>
                            </div>
                          )}
                          {st === 'Completed' && (
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                              <strong className="block font-bold">Service Completed</strong>
                              <p className="mt-0.5">Your complaint has been resolved and verified by our technician.</p>
                            </div>
                          )}

                          {/* Specifics Card */}
                          <div className="p-3 bg-white dark:bg-[#202020] rounded-xl border border-[#E2E0DB] dark:border-[#333333] text-xs space-y-1.5 shadow-sm">
                            <div className="flex justify-between">
                              <span className="text-[#858585]">AC Unit:</span>
                              <strong className="text-[#111111] dark:text-white">{c.ac_brand_model}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#858585]">Reported Issue:</span>
                              <strong className="text-rose-600 dark:text-rose-400">{c.issue_category}</strong>
                            </div>
                            {c.preferred_slot && (
                              <div className="flex justify-between">
                                <span className="text-[#858585]">Preferred Slot:</span>
                                <span className="font-semibold text-[#111111] dark:text-white">{c.preferred_slot}</span>
                              </div>
                            )}
                            {c.description && (
                              <div className="pt-1 border-t border-[#E2E0DB] dark:border-[#333333]">
                                <span className="text-[#858585] block text-[10px]">Problem Description:</span>
                                <p className="text-[#555555] dark:text-[#E2E0DB] italic line-clamp-2 mt-0.5">
                                  "{c.description}"
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Attached Photo Preview if available */}
                          {c.photo_url && (
                            <div className="p-2.5 bg-white dark:bg-[#202020] rounded-xl border border-[#E2E0DB] dark:border-[#333333] space-y-1.5 shadow-sm">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#858585] block">
                                Attached Problem Photo:
                              </span>
                              <a
                                href={c.photo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="group/photo relative block w-full h-32 rounded-lg overflow-hidden border border-[#E2E0DB] dark:border-[#333333]"
                              >
                                <img
                                  src={c.photo_url}
                                  alt="Attached Problem"
                                  className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                                  <Eye className="w-3.5 h-3.5 text-[#C8A96B]" /> View Full Image
                                </div>
                              </a>
                            </div>
                          )}

                          {/* 5-Step Detailed Progress Timeline */}
                          <div className="pt-1">
                            <span className="text-[11px] font-extrabold text-[#C8A96B] uppercase tracking-wider block mb-2">
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

                          {/* Link to Full Complaints Desk */}
                          <div className="pt-1 flex justify-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab('complaints');
                              }}
                              className="text-[11px] font-bold text-[#C8A96B] hover:underline flex items-center gap-1"
                            >
                              <span>Open in Complaints Desk</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>

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

      <InvoiceModal
        order={selectedOrderInvoice}
        isOpen={!!selectedOrderInvoice}
        onClose={() => setSelectedOrderInvoice(null)}
      />

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Wrench, Calendar, Clock, MapPin, CheckCircle2, 
  ShieldCheck, AlertCircle, RefreshCw, ArrowRight 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { usePopup } from '../context/PopupContext';
import LuxurySelect from '../components/LuxurySelect';

export default function Services({ setActiveTab }) {
  const { showModal, showToast } = usePopup();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, openAuthModal } = useAuth();
  const { pincode, setPincode } = useCart();

  const [checkPin, setCheckPin] = useState(pincode);
  const [pinResult, setPinResult] = useState(null);

  // Booking Modal state
  const [selectedService, setSelectedService] = useState(null);
  const [serviceDate, setServiceDate] = useState('2026-09-10');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 12:00 PM');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getServices()
      .then((data) => setServices(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePincodeCheck = async (e) => {
    e.preventDefault();
    if (!checkPin) return;
    const res = await api.checkPincode(checkPin);
    setPinResult(res);
    if (res.serviceable) setPincode(checkPin);
  };

  const handleBookServiceSubmit = async (e) => {
    e.preventDefault();
    if (!selectedService) return;

    if (!currentUser) {
      openAuthModal('prompt');
      return;
    }

    if (pinResult && !pinResult.serviceable) {
      showToast({
        type: 'error',
        title: 'Area Not Serviceable',
        message: 'Cooling Hub services are currently only available in Ahmedabad. Please enter an Ahmedabad pincode.'
      });
      return;
    }

    setIsBooking(true);

    try {
      const res = await api.bookService({
        user_id: currentUser.id,
        service_id: selectedService.id,
        pincode: checkPin,
        service_date: serviceDate,
        service_time_slot: timeSlot,
        address: address || currentUser.address || 'Satellite, Ahmedabad, Gujarat',
        notes
      });
      setIsBooking(false);
      setSelectedService(null);
      await showModal({
        type: 'success',
        title: 'Doorstep Service Booked!',
        badge: 'Pending Admin Approval',
        message: 'Your service request has been received. Our admin team will review and confirm your booking shortly before dispatching a certified technician in Ahmedabad.',
        details: {
          'Booking Number': res.booking_number,
          'Service Package': selectedService.title,
          'Scheduled Date': serviceDate,
          'Preferred Slot': timeSlot,
          'Service Pincode': checkPin,
          'City': 'Ahmedabad',
          'Total Flat Rate': `₹${selectedService.price}`,
          'Initial Status': 'Pending Admin Approval'
        },
        confirmText: 'View in Customer Dashboard'
      });
      setActiveTab('dashboard');
    } catch (err) {
      setIsBooking(false);
      showToast({
        type: 'error',
        title: 'Booking Failed',
        message: err.message
      });
    }
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Header */}
      <div className="bg-[#111111] text-white p-5 sm:p-6 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 bg-[#C8A96B] text-[#111111] text-[11px] font-black rounded-full uppercase tracking-wider">
            30-DAY SERVICE WARRANTY
          </span>
          <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold rounded-full flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>EXCLUSIVELY SERVICING AHMEDABAD</span>
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black flex items-center space-x-2">
          <Wrench className="w-6 h-6 text-[#C8A96B]" />
          <span>Doorstep AC Services & Repairs</span>
        </h1>
        <p className="text-xs text-[#E2E0DB] max-w-2xl font-normal leading-relaxed">
          Background-verified certified HVAC engineers serving homes and offices across Ahmedabad. High-pressure foam jet wash, installation, dismantling, gas refill, and rapid breakdown troubleshooting.
        </p>

        {/* Pincode verification bar */}
        <form onSubmit={handlePincodeCheck} className="max-w-md flex items-center space-x-2 pt-1">
          <div className="relative flex-1">
            <MapPin className="w-4 h-4 text-[#C8A96B] absolute left-3 top-3" />
            <input
              type="text"
              value={checkPin}
              onChange={(e) => setCheckPin(e.target.value)}
              placeholder="Enter Ahmedabad Pincode (e.g. 380015, 380054)"
              maxLength={6}
              className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-[#E2E0DB]/70 focus:outline-none focus:ring-2 focus:ring-[#C8A96B]"
            />
          </div>
          <button
            type="submit"
            className="btn-emerald-secondary px-4 py-2 text-xs"
          >
            Check Serviceability
          </button>
        </form>

        {pinResult && (
          <div className={`p-4 rounded-2xl text-xs max-w-lg transition-all animate-in fade-in duration-200 border ${
            pinResult.serviceable 
              ? 'bg-[#C8A96B]/15 border-[#C8A96B] text-[#FAF7F0]' 
              : 'bg-rose-950/40 border-rose-500/80 text-rose-200'
          }`}>
            <div className="flex items-start space-x-3">
              {pinResult.serviceable ? (
                <CheckCircle2 className="w-5 h-5 text-[#C8A96B] shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1.5">
                <p className="font-bold text-sm text-white">
                  {pinResult.serviceable ? 'Service Available in Your Area' : 'Service Not Available Here'}
                </p>
                <p className="text-xs leading-relaxed opacity-95">{pinResult.message}</p>
                {pinResult.serviceable && pinResult.delivery_time && (
                  <div className="flex items-center space-x-1.5 text-[11px] text-[#C8A96B] font-bold pt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{pinResult.delivery_time}</span>
                  </div>
                )}
                {!pinResult.serviceable && (
                  <p className="text-[11px] text-rose-300/90 font-medium pt-0.5">
                    📍 Cooling Hub technicians are currently stationed exclusively across Ahmedabad (e.g. Vastrapur 380015, SG Highway 380054, Navrangpura 380009, Bopal 380058, Maninagar 380008, etc.).
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Services Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-[#111111] dark:text-white">Select AC Service</h2>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#555555] space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#C8A96B]" />
            <span>Loading service offerings...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((srv) => (
              <div 
                key={srv.id}
                className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E2E0DB] dark:border-[#2E2E2E] p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#C8A96B] hover:-translate-y-1 transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-[#FAF7F0] dark:bg-[#252525] text-[#111111] dark:text-[#C8A96B] border border-[#C8A96B]/30 font-bold text-[10px] rounded-full uppercase">
                      {srv.category}
                    </span>
                    <span className="text-xs font-bold text-[#555555] dark:text-[#858585] flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-[#C8A96B]" />
                      <span>{srv.estimated_time}</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-[#111111] dark:text-white text-base sm:text-lg">{srv.title}</h3>
                  <p className="text-xs sm:text-sm text-[#555555] dark:text-[#858585] leading-relaxed">{srv.description}</p>

                  {/* Included list */}
                  {srv.includes && (
                    <div className="space-y-2 pt-3 border-t border-[#E2E0DB] dark:border-[#2E2E2E]">
                      <span className="text-[10px] font-bold text-[#555555] uppercase">Includes:</span>
                      {srv.includes.split(',').map((inc, i) => (
                        <div key={i} className="flex items-center space-x-2 text-xs text-[#111111] dark:text-[#E2E0DB]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#C8A96B] flex-shrink-0" />
                          <span>{inc.trim()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-6 mt-6 border-t border-[#E2E0DB] dark:border-[#2E2E2E] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#555555] block">Flat Rate</span>
                    <span className="text-xl sm:text-2xl font-black text-[#111111] dark:text-[#C8A96B]">₹{srv.price}</span>
                  </div>
                  <button
                    onClick={() => setSelectedService(srv)}
                    className="btn-emerald-primary px-4 py-2.5 text-xs sm:text-sm font-bold"
                  >
                    Schedule Booking
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Form Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#2E2E2E] rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-6">
            
            <div className="flex items-center justify-between border-b border-[#E2E0DB] dark:border-[#2E2E2E] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#C8A96B] uppercase">Service Booking Wizard</span>
                <h3 className="font-bold text-[#111111] dark:text-white text-base">{selectedService.title}</h3>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="text-[#555555] hover:text-[#111111] text-xs font-bold"
              >
                Close ✕
              </button>
            </div>

            <form onSubmit={handleBookServiceSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#111111] dark:text-[#E2E0DB] mb-1">Preferred Date</label>
                  <input
                    type="date"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#2E2E2E] rounded-xl text-[#111111] dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#111111] dark:text-[#E2E0DB] mb-1">Time Slot</label>
                  <LuxurySelect
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    options={[
                      '09:00 AM - 11:00 AM',
                      '11:00 AM - 01:00 PM',
                      '02:00 PM - 04:00 PM',
                      '04:00 PM - 06:00 PM'
                    ]}
                    size="sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#111111] dark:text-[#E2E0DB] mb-1">Service Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#2E2E2E] rounded-xl text-[#111111] dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#111111] dark:text-[#E2E0DB] mb-1">Special Notes / AC Model</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Daikin Split AC in 2nd floor bedroom"
                  className="w-full p-2.5 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#2E2E2E] rounded-xl text-[#111111] dark:text-white"
                />
              </div>

              <div className="p-3 bg-[#F7F6F2] dark:bg-[#252525] rounded-xl flex items-center justify-between border border-[#E2E0DB] dark:border-[#2E2E2E]">
                <span className="font-semibold text-[#111111] dark:text-[#E2E0DB]">Total Service Price:</span>
                <span className="text-lg font-black text-[#111111] dark:text-[#C8A96B]">₹{selectedService.price}</span>
              </div>

              <button
                type="submit"
                disabled={isBooking}
                className="btn-emerald-primary w-full py-3 text-xs"
              >
                {isBooking ? 'Confirming Appointment...' : 'Confirm Service Appointment'}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

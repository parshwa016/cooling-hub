import React, { useState, useEffect } from 'react';
import { 
  Wrench, Calendar, Clock, MapPin, CheckCircle2, 
  ShieldCheck, AlertCircle, RefreshCw, ArrowRight 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Services({ setActiveTab }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { pincode, setPincode } = useCart();

  const [checkPin, setCheckPin] = useState(pincode);
  const [pinResult, setPinResult] = useState(null);

  // Booking Modal state
  const [selectedService, setSelectedService] = useState(null);
  const [serviceDate, setServiceDate] = useState('2026-09-10');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 12:00 PM');
  const [address, setAddress] = useState(currentUser.address || '');
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
    setIsBooking(true);

    try {
      const res = await api.bookService({
        user_id: currentUser.id,
        service_id: selectedService.id,
        pincode: checkPin,
        service_date: serviceDate,
        service_time_slot: timeSlot,
        address,
        notes
      });
      setIsBooking(false);
      setSelectedService(null);
      setActiveTab('dashboard');
      alert(`🎉 Service Booked Successfully! Booking Number: ${res.booking_number}`);
    } catch (err) {
      setIsBooking(false);
      alert("Error booking service: " + err.message);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-cool-600 via-cyan-600 to-slate-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl space-y-4">
        <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full">30-DAY SERVICE WARRANTY</span>
        <h1 className="text-3xl sm:text-4xl font-black">🔧 Doorstep AC Services & Repairs</h1>
        <p className="text-xs sm:text-sm text-cyan-100 max-w-2xl">
          Background-verified certified HVAC engineers for high-pressure foam jet wash, installation, dismantling, gas refill, and rapid breakdown troubleshooting.
        </p>

        {/* Pincode verification bar */}
        <form onSubmit={handlePincodeCheck} className="max-w-md flex items-center space-x-2 pt-2">
          <div className="relative flex-1">
            <MapPin className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
            <input
              type="text"
              value={checkPin}
              onChange={(e) => setCheckPin(e.target.value)}
              placeholder="Enter Pincode (e.g. 110001)"
              maxLength={6}
              className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-cyan-200 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-white text-cool-700 font-bold rounded-xl text-xs hover:bg-cyan-50 transition"
          >
            Check Serviceability
          </button>
        </form>

        {pinResult && (
          <div className={`p-3 rounded-xl text-xs font-semibold max-w-md ${pinResult.serviceable ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-200' : 'bg-rose-500/20 border border-rose-400 text-rose-200'}`}>
            {pinResult.message}
          </div>
        )}
      </div>

      {/* Services Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Select AC Service</h2>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-cyan-500" />
            <span>Loading service offerings...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((srv) => (
              <div 
                key={srv.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-cyan-500/50 transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-cyan-50 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 font-bold text-[10px] rounded-full uppercase">
                      {srv.category}
                    </span>
                    <span className="text-xs font-bold text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{srv.estimated_time}</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{srv.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{srv.description}</p>

                  {/* Included list */}
                  {srv.includes && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Includes:</span>
                      {srv.includes.split(',').map((inc, i) => (
                        <div key={i} className="flex items-center space-x-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span>{inc.trim()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Flat Rate</span>
                    <span className="text-xl font-black text-cyan-600 dark:text-cyan-400">₹{srv.price}</span>
                  </div>
                  <button
                    onClick={() => setSelectedService(srv)}
                    className="px-4 py-2.5 bg-cool-600 text-white font-bold rounded-xl text-xs hover:bg-cool-700 transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-cyan-600 uppercase">Service Booking Wizard</span>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{selectedService.title}</h3>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Close ✕
              </button>
            </div>

            <form onSubmit={handleBookServiceSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Preferred Date</label>
                  <input
                    type="date"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Time Slot</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                  >
                    <option>09:00 AM - 11:00 AM</option>
                    <option>11:00 AM - 01:00 PM</option>
                    <option>02:00 PM - 04:00 PM</option>
                    <option>04:00 PM - 06:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Service Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Special Notes / AC Model</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Daikin Split AC in 2nd floor bedroom"
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                <span>Total Service Price:</span>
                <span className="text-lg font-black text-cyan-600 dark:text-cyan-400">₹{selectedService.price}</span>
              </div>

              <button
                type="submit"
                disabled={isBooking}
                className="w-full py-3 bg-gradient-to-r from-cool-600 to-cyan-600 text-white font-bold rounded-xl hover:opacity-90 transition"
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

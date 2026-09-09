import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Search, Clock, CheckCircle2, 
  Wrench, Upload, ArrowRight, ShieldAlert, FileText 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Complaints({ setActiveTab }) {
  const { currentUser } = useAuth();
  
  // Raise form state
  const [acBrand, setAcBrand] = useState('LG 1.5T Inverter Split AC');
  const [issueCat, setIssueCat] = useState('Water Leakage');
  const [priority, setPriority] = useState('High');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track ticket state
  const [trackTicketId, setTrackTicketId] = useState('CMP-2026-8941');
  const [trackedComplaint, setTrackedComplaint] = useState(null);
  const [trackError, setTrackError] = useState('');

  // User tickets list
  const [myComplaints, setMyComplaints] = useState([]);

  const loadUserComplaints = () => {
    api.getUserComplaints(currentUser.id)
      .then(setMyComplaints)
      .catch(console.error);
  };

  useEffect(() => {
    loadUserComplaints();
    if (trackTicketId) handleTrackSubmit();
  }, [currentUser.id]);

  const handleRaiseSubmit = async (e) => {
    e.preventDefault();
    if (!description) return;
    setIsSubmitting(true);

    try {
      const res = await api.raiseComplaint({
        user_id: currentUser.id,
        ac_brand_model: acBrand,
        issue_category: issueCat,
        priority: priority,
        description: description,
        photo_url: photoUrl
      });
      setIsSubmitting(false);
      setDescription('');
      loadUserComplaints();
      setTrackTicketId(res.ticket_id);
      setTrackedComplaint(res);
      alert(`📢 Complaint Ticket Logged! Your Ticket ID: ${res.ticket_id}`);
    } catch (err) {
      setIsSubmitting(false);
      alert("Error raising complaint: " + err.message);
    }
  };

  const handleTrackSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!trackTicketId) return;
    setTrackError('');
    try {
      const res = await api.trackComplaint(trackTicketId);
      setTrackedComplaint(res);
    } catch (err) {
      setTrackedComplaint(null);
      setTrackError(`Ticket ID '${trackTicketId}' not found in database.`);
    }
  };

  const complaintSteps = ['Logged', 'Technician Assigned', 'Under Inspection', 'Resolved'];

  return (
    <div className="space-y-12 pb-16">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-slate-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl space-y-3">
        <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full">FAST-TRACK REPAIR DISPATCH</span>
        <h1 className="text-3xl sm:text-4xl font-black">📢 Complaint & Escalation Desk</h1>
        <p className="text-xs sm:text-sm text-rose-100 max-w-2xl">
          Experiencing non-cooling, gas leakage, or strange compressor noise? Register your complaint for priority technician dispatch within 4 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: Raise Complaint */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <span>Raise New AC Complaint</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Fill in issue details for swift ticket generation.</p>
          </div>

          <form onSubmit={handleRaiseSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">AC Brand & Model</label>
                <input
                  type="text"
                  value={acBrand}
                  onChange={(e) => setAcBrand(e.target.value)}
                  placeholder="e.g. Daikin 1.5T Split AC"
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Issue Category</label>
                <select
                  value={issueCat}
                  onChange={(e) => setIssueCat(e.target.value)}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                >
                  <option>Cooling Problem (Blowing Warm Air)</option>
                  <option>Water Leakage from Indoor Unit</option>
                  <option>Loud Rattling / Vibrating Noise</option>
                  <option>Refrigerant Gas Leakage</option>
                  <option>Compressor Tripping Electrical Circuit</option>
                  <option>Remote Control / Sensor Error</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-rose-500"
                >
                  <option value="Normal">Normal (Response within 24 Hrs)</option>
                  <option value="High">High (Response within 6 Hrs)</option>
                  <option value="Emergency">Emergency (Immediate 2-4 Hrs Response)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Photo Attachment URL (Optional)</label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://... (image link of leakage or error code)"
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Problem Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happens when you turn on the AC (e.g. error code E4 displayed, water dripping on floor after 20 mins)..."
                rows={4}
                className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white font-bold rounded-xl shadow-lg hover:opacity-95 transition text-sm"
            >
              {isSubmitting ? 'Logging Ticket...' : 'Generate Emergency Complaint Ticket'}
            </button>
          </form>
        </div>

        {/* Right Tracker & Active Tickets */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Tracker Card */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-sm flex items-center space-x-2 text-cyan-400">
              <Search className="w-4 h-4" />
              <span>Live Complaint Tracker</span>
            </h3>

            <form onSubmit={handleTrackSubmit} className="flex items-center space-x-2">
              <input
                type="text"
                value={trackTicketId}
                onChange={(e) => setTrackTicketId(e.target.value)}
                placeholder="Enter Ticket ID (e.g. CMP-2026-8941)"
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 font-bold rounded-xl text-xs hover:bg-cyan-500 transition"
              >
                Track
              </button>
            </form>

            {trackError && <p className="text-xs text-rose-400 font-semibold">{trackError}</p>}

            {trackedComplaint && (
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-cyan-300">{trackedComplaint.ticket_id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    trackedComplaint.priority === 'Emergency' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950'
                  }`}>
                    {trackedComplaint.priority} Priority
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <p><strong>AC:</strong> {trackedComplaint.ac_brand_model}</p>
                  <p><strong>Issue:</strong> {trackedComplaint.issue_category}</p>
                  <p><strong>Logged On:</strong> {new Date(trackedComplaint.created_at).toLocaleString()}</p>
                </div>

                {/* Progress Timeline */}
                <div className="pt-3 border-t border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Status Timeline:</span>
                  <div className="flex items-center justify-between text-[10px]">
                    {complaintSteps.map((step, idx) => {
                      const currentIdx = complaintSteps.indexOf(trackedComplaint.status);
                      const isDone = idx <= currentIdx;
                      return (
                        <div key={idx} className="flex flex-col items-center text-center space-y-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                            isDone ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-400'
                          }`}>
                            {isDone ? '✓' : idx + 1}
                          </div>
                          <span className={isDone ? 'text-emerald-400 font-bold' : 'text-slate-500'}>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* User Complaint History list */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cyan-600" />
              <span>Your Recent Complaints ({myComplaints.length})</span>
            </h3>

            {myComplaints.length === 0 ? (
              <p className="text-xs text-slate-400">No active complaints logged.</p>
            ) : (
              <div className="space-y-3">
                {myComplaints.map((c) => (
                  <div 
                    key={c.id}
                    onClick={() => { setTrackTicketId(c.ticket_id); setTrackedComplaint(c); }}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-cyan-500 transition flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{c.ticket_id}</span>
                      <p className="text-slate-500 text-[11px]">{c.ac_brand_model} • {c.issue_category}</p>
                    </div>
                    <span className="px-2 py-1 bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-bold rounded-lg text-[10px]">
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

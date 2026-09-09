import React, { useState, useEffect } from 'react';
import { 
  Wrench, CheckCircle2, Clock, Phone, MapPin, 
  FileCheck, AlertTriangle, RefreshCw, Star, Upload 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TechnicianPortal() {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected job for updating report
  const [selectedJob, setSelectedJob] = useState(null);
  const [status, setStatus] = useState('In Progress');
  const [diagnosis, setDiagnosis] = useState('');
  const [partsUsed, setPartsUsed] = useState('');
  const [beforePhoto, setBeforePhoto] = useState('');
  const [afterPhoto, setAfterPhoto] = useState('');
  const [customerSig, setCustomerSig] = useState('Signed by Customer');
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('Satisfied with service.');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchJobs = () => {
    setLoading(true);
    api.getTechnicianJobs(currentUser.id)
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, [currentUser.id]);

  const handleOpenModal = (job) => {
    setSelectedJob(job);
    setStatus(job.status || 'In Progress');
    setDiagnosis(job.diagnosis || '');
    setPartsUsed(job.parts_used || '');
    setBeforePhoto(job.before_photo || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80');
    setAfterPhoto(job.after_photo || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&auto=format&fit=crop&q=80');
  };

  const handleUpdateJobSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;
    setIsUpdating(true);

    try {
      await api.updateTechnicianJob(selectedJob.id, {
        status,
        diagnosis,
        parts_used: partsUsed,
        before_photo: beforePhoto,
        after_photo: afterPhoto,
        customer_signature: customerSig,
        rating: Number(rating),
        feedback
      });
      setIsUpdating(false);
      setSelectedJob(null);
      fetchJobs();
      alert("✅ Job Status & Service Report Updated!");
    } catch (e) {
      setIsUpdating(false);
      alert("Error updating job: " + e.message);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-slate-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl space-y-3">
        <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full">CERTIFIED HVAC TECHNICIAN WORKSPACE</span>
        <h1 className="text-3xl sm:text-4xl font-black">👨‍🔧 Technician Field Portal</h1>
        <p className="text-xs sm:text-sm text-amber-100 max-w-2xl">
          Welcome back, {currentUser.name}! Track assigned service & repair jobs, update job status, log diagnosis & spare parts, and generate digital service reports.
        </p>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
          <Wrench className="w-5 h-5 text-amber-500" />
          <span>Assigned Jobs Queue ({jobs.length})</span>
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
            <span>Fetching technician job queue...</span>
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-xs text-slate-400 py-8">No field jobs assigned currently.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <div 
                key={job.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] rounded-full uppercase">
                      {job.job_type}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      job.status === 'Completed' ? 'bg-emerald-500 text-slate-950' : 'bg-blue-600 text-white'
                    }`}>
                      {job.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                    Customer: {job.customer_name}
                  </h3>

                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl">
                    <p className="flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-amber-500" />
                      <span><strong>Contact:</strong> {job.customer_phone}</span>
                    </p>
                    <p className="flex items-start space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 mt-0.5" />
                      <span><strong>Address:</strong> {job.address}</span>
                    </p>
                    {job.issue && <p><strong>Issue Category:</strong> {job.issue}</p>}
                    {job.description && <p className="italic">"{job.description}"</p>}
                  </div>

                  {job.diagnosis && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      <p><strong>Diagnosis:</strong> {job.diagnosis}</p>
                      {job.parts_used && <p><strong>Parts Used:</strong> {job.parts_used}</p>}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => handleOpenModal(job)}
                    className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition"
                  >
                    Update Job & Service Report
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Update Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase">Field Work Order</span>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Digital Service Report</h3>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-xs font-bold text-slate-400">✕ Close</button>
            </div>

            <form onSubmit={handleUpdateJobSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Job Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  <option value="Accepted">Job Accepted</option>
                  <option value="In Progress">In Progress (Diagnosing)</option>
                  <option value="Completed">Completed & Verified</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Diagnosis & Work Done</label>
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Cleaned clogged drain tray, refilled 200g R32 gas..."
                  rows={2}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Spare Parts Used</label>
                <input
                  type="text"
                  value={partsUsed}
                  onChange={(e) => setPartsUsed(e.target.value)}
                  placeholder="e.g. 1.5m Copper Pipe, Capacitor 45uF"
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Before Service Photo URL</label>
                  <input
                    type="text"
                    value={beforePhoto}
                    onChange={(e) => setBeforePhoto(e.target.value)}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">After Service Photo URL</label>
                  <input
                    type="text"
                    value={afterPhoto}
                    onChange={(e) => setAfterPhoto(e.target.value)}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Digital Customer Sign-off</label>
                <input
                  type="text"
                  value={customerSig}
                  onChange={(e) => setCustomerSig(e.target.value)}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-emerald-600"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-3 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 transition"
              >
                {isUpdating ? 'Saving...' : 'Submit Digital Report & Close Job'}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

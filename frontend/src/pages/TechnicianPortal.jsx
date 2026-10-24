import React, { useState, useEffect } from 'react';
import { 
  Wrench, CheckCircle2, Clock, Phone, MapPin, 
  FileCheck, AlertTriangle, RefreshCw, Star, Upload, X, Check,
  Calendar, ShieldCheck, User, ArrowRight, Eye, Camera
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { usePopup } from '../context/PopupContext';

export default function TechnicianPortal() {
  const { currentUser } = useAuth();
  const { showToast } = usePopup();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected job for completing report
  const [selectedJobForComplete, setSelectedJobForComplete] = useState(null);
  const [problemIdentified, setProblemIdentified] = useState('');
  const [workPerformed, setWorkPerformed] = useState('');
  const [partsReplaced, setPartsReplaced] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const fetchJobs = () => {
    if (!currentUser?.id) return;
    setLoading(true);
    api.getTechnicianJobs(currentUser.id)
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, [currentUser?.id]);

  // Handle Start Service (Assigned -> In Progress)
  const handleStartService = async (job) => {
    try {
      await api.updateTechnicianJob(job.id, {
        status: 'In Progress'
      });
      showToast({
        type: 'success',
        title: 'Service Started',
        message: `Work started for ${job.customer_name}. Customer status updated to 'In Progress'.`
      });
      fetchJobs();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Failed to Start Service',
        message: err.message
      });
    }
  };

  // Open Complete Modal
  const handleOpenCompleteModal = (job) => {
    setSelectedJobForComplete(job);
    setProblemIdentified(job.issue || 'Evaporator coil choked / gas pressure low');
    setWorkPerformed('High pressure chemical cleaning, leak detection, and precision refrigerant top-up.');
    setPartsReplaced('Refrigerant R32 (450g), Copper flare nut');
    setAdditionalNotes('AC temperature output calibrated to 14.5°C at indoor grille. Customer satisfied.');
  };

  // Handle Complete Service & Log Report
  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJobForComplete) return;

    setIsSubmittingReport(true);
    try {
      await api.updateTechnicianJob(selectedJobForComplete.id, {
        status: 'Completed',
        problem_identified: problemIdentified,
        work_performed: workPerformed,
        parts_replaced: partsReplaced,
        additional_notes: additionalNotes,
        diagnosis: `${problemIdentified}. Work: ${workPerformed}`
      });
      setIsSubmittingReport(false);
      setSelectedJobForComplete(null);
      showToast({
        type: 'success',
        title: 'Service Completed',
        message: 'Resolution report submitted successfully. Customer and Admin notified.'
      });
      fetchJobs();
    } catch (err) {
      setIsSubmittingReport(false);
      showToast({
        type: 'error',
        title: 'Failed to Complete Service',
        message: err.message
      });
    }
  };

  if (!currentUser) {
    return (
      <div className="py-20 text-center text-[#858585]">
        Please log in to access the Technician Field Portal.
      </div>
    );
  }

  if (currentUser.role !== 'technician' && currentUser.role !== 'admin') {
    return (
      <div className="py-20 text-center space-y-3">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-lg font-bold text-[#111111] dark:text-white">Restricted Access</h3>
        <p className="text-xs text-[#858585]">This portal is strictly reserved for certified Cooling Hub field service technicians.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="bg-[#111111] text-white p-5 sm:p-6 rounded-2xl border border-[#292929] shadow-sm space-y-2.5">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 bg-[#C8A96B] text-[#111111] text-[11px] font-black rounded-full uppercase tracking-wider">
            CERTIFIED HVAC TECHNICIAN WORKSPACE
          </span>
          <span className="text-[11px] text-[#858585] font-semibold">Service Man App</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">👨‍🔧 Service Man Field Portal</h1>
        <p className="text-xs text-[#858585] max-w-2xl font-normal leading-relaxed">
          Welcome back, <strong className="text-white">{currentUser.name}</strong>! View your assigned customer service calls, update job status in real time, and submit verified digital completion reports.
        </p>
      </div>

      {/* Jobs Queue */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-[#111111] dark:text-white flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-[#C8A96B]" />
            <span>My Assigned Service & Repair Jobs ({jobs.length})</span>
          </h2>
          <button
            onClick={fetchJobs}
            className="p-2 rounded-xl bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#292929] text-[#111111] dark:text-white hover:border-[#C8A96B]"
            title="Refresh Jobs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#858585] space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#C8A96B]" />
            <span>Fetching assigned complaints queue...</span>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white dark:bg-[#1A1A1A] p-12 text-center rounded-3xl border border-[#E2E0DB] dark:border-[#292929] space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-lg text-[#111111] dark:text-white">All Caught Up!</h3>
            <p className="text-xs sm:text-sm text-[#858585]">
              No pending service calls or repair complaints currently assigned to you.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {jobs.map((job) => {
              const isAssigned = job.status === 'Assigned';
              const isInProgress = job.status === 'In Progress';
              const isCompleted = job.status === 'Completed';

              return (
                <div
                  key={job.id}
                  className="bg-white dark:bg-[#1A1A1A] p-6 rounded-3xl border border-[#E2E0DB] dark:border-[#292929] shadow-sm flex flex-col justify-between space-y-5 hover:border-[#C8A96B]/50 transition-all"
                >
                  <div className="space-y-4">
                    
                    {/* Top Status Strip */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-[#C8A96B]">
                        {job.ticket_id || `JOB-${job.id}`}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        isAssigned 
                          ? 'bg-blue-500/10 text-blue-600 border-blue-300'
                          : isInProgress
                            ? 'bg-purple-500/10 text-purple-600 border-purple-300 animate-pulse'
                            : 'bg-emerald-500/10 text-emerald-600 border-emerald-300'
                      }`}>
                        {job.status}
                      </span>
                    </div>

                    {/* Customer Info Card */}
                    <div className="p-4 bg-[#FAF7F0] dark:bg-[#252525] rounded-2xl border border-[#E2E0DB] dark:border-[#292929] space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-[#111111] dark:text-white flex items-center space-x-1.5">
                          <User className="w-4 h-4 text-[#C8A96B]" />
                          <span>{job.customer_name}</span>
                        </h4>
                        {job.customer_phone && (
                          <a
                            href={`tel:${job.customer_phone}`}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#111111] text-white rounded-lg text-[11px] font-bold hover:bg-[#C8A96B] hover:text-[#111111] transition"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call</span>
                          </a>
                        )}
                      </div>

                      <p className="text-xs text-[#555555] dark:text-[#858585] flex items-start space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C8A96B] flex-shrink-0 mt-0.5" />
                        <span>{job.address}</span>
                      </p>

                      <div className="flex items-center space-x-1.5 text-xs text-[#858585]">
                        <Clock className="w-3.5 h-3.5 text-[#C8A96B]" />
                        <span>Slot: {job.time_slot}</span>
                      </div>
                    </div>

                    {/* AC & Complaint Details */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#858585]">AC Unit:</span>
                        <strong className="text-[#111111] dark:text-white">{job.ac_details || job.service_name}</strong>
                      </div>
                      {job.issue && (
                        <div className="flex justify-between">
                          <span className="text-[#858585]">Reported Issue:</span>
                          <span className="font-bold text-rose-600 dark:text-rose-400">{job.issue}</span>
                        </div>
                      )}
                      {job.description && (
                        <div className="pt-1">
                          <span className="text-[#858585] block text-[11px]">Customer Note:</span>
                          <p className="text-[#555555] dark:text-[#858585] italic line-clamp-2 mt-0.5">
                            "{job.description}"
                          </p>
                        </div>
                      )}

                      {job.photo_url && (
                        <div className="pt-2">
                          <span className="text-[#858585] block text-[11px] font-bold mb-1">Customer Problem Photo:</span>
                          <a
                            href={job.photo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative block w-full h-28 rounded-xl overflow-hidden border border-[#E2E0DB] dark:border-[#292929] bg-black/5 hover:border-[#C8A96B] transition shadow-sm"
                          >
                            <img
                              src={job.photo_url}
                              alt="Customer Problem"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                              <Eye className="w-3.5 h-3.5 text-[#C8A96B]" /> View Full Photo
                            </div>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Completion Notes if already completed */}
                    {isCompleted && job.service_notes && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300">
                        <strong>Logged Service Report:</strong>
                        <p className="mt-0.5">{job.service_notes}</p>
                      </div>
                    )}

                  </div>

                  {/* Actions according to Requirement 7: Assigned -> In Progress -> Completed */}
                  <div className="pt-3 border-t border-[#E2E0DB] dark:border-[#292929] flex flex-col sm:flex-row gap-2">
                    {isAssigned && (
                      <button
                        onClick={() => handleStartService(job)}
                        className="btn-emerald-primary w-full py-2.5 text-xs font-bold flex items-center justify-center space-x-1.5"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Start Service (In Progress)</span>
                      </button>
                    )}

                    {isInProgress && (
                      <button
                        onClick={() => handleOpenCompleteModal(job)}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center space-x-1.5 transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete Service & Log Notes</span>
                      </button>
                    )}

                    {isCompleted && (
                      <div className="w-full py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-center font-bold text-xs rounded-xl flex items-center justify-center space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Job Completed & Verified</span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ============================================================ */}
      {/* MODAL: COMPLETE SERVICE & LOG REPORT */}
      {/* ============================================================ */}
      {selectedJobForComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-xl rounded-3xl border border-[#E2E0DB] dark:border-[#292929] shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-[#E2E0DB] dark:border-[#292929] pb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-lg text-[#111111] dark:text-white">Service Completion Report</h3>
              </div>
              <button 
                onClick={() => setSelectedJobForComplete(null)}
                className="p-1 rounded-lg text-[#858585] hover:text-[#111111]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#858585]">
              Ticket #{selectedJobForComplete.ticket_id} for customer <strong>{selectedJobForComplete.customer_name}</strong>. Log field diagnosis and replaced parts to complete this job.
            </p>

            <form onSubmit={handleCompleteSubmit} className="space-y-4 text-xs sm:text-sm">
              
              {/* Problem Identified */}
              <div>
                <label className="block font-bold text-[#111111] dark:text-white mb-1">
                  1. Problem Identified
                </label>
                <input
                  type="text"
                  required
                  value={problemIdentified}
                  onChange={(e) => setProblemIdentified(e.target.value)}
                  placeholder="e.g. Capacitor blown, dirty filter choked cooling coil"
                  className="w-full px-3 py-2 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#292929] rounded-xl"
                />
              </div>

              {/* Work Performed */}
              <div>
                <label className="block font-bold text-[#111111] dark:text-white mb-1">
                  2. Work Performed
                </label>
                <textarea
                  rows="2"
                  required
                  value={workPerformed}
                  onChange={(e) => setWorkPerformed(e.target.value)}
                  placeholder="e.g. Chemical foam wash, replaced starting capacitor, checked 55 psi gas pressure."
                  className="w-full px-3 py-2 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#292929] rounded-xl resize-none"
                />
              </div>

              {/* Parts Replaced */}
              <div>
                <label className="block font-bold text-[#111111] dark:text-white mb-1">
                  3. Spare Parts Replaced (if any)
                </label>
                <input
                  type="text"
                  value={partsReplaced}
                  onChange={(e) => setPartsReplaced(e.target.value)}
                  placeholder="e.g. 50uF Heavy Duty Capacitor, R32 Gas Top-Up (300g)"
                  className="w-full px-3 py-2 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#292929] rounded-xl"
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block font-bold text-[#111111] dark:text-white mb-1">
                  4. Additional Notes / Customer Feedback
                </label>
                <input
                  type="text"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="e.g. Customer verified cooling temperature 15°C. System running smoothly."
                  className="w-full px-3 py-2 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#292929] rounded-xl"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-3 border-t border-[#E2E0DB] dark:border-[#292929]">
                <button
                  type="button"
                  onClick={() => setSelectedJobForComplete(null)}
                  className="btn-emerald-secondary px-5 py-2.5 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="py-2.5 px-6 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center space-x-1.5 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingReport ? 'Submitting Report...' : 'Submit & Complete Service'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

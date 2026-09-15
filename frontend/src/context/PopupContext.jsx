import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  CheckCircle2, AlertTriangle, AlertCircle, Info, X, 
  ArrowRight, ShieldCheck, Clock, Check
} from 'lucide-react';

const PopupContext = createContext(null);

export function PopupProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [activeModal, setActiveModal] = useState(null);

  // ----------------- TOAST NOTIFICATIONS -----------------
  const showToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    const newToast = { id, type, title, message, duration };

    setToasts(prev => [...prev.slice(-4), newToast]); // keep max 5

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ----------------- LUXURY MODAL POPUPS -----------------
  const showModal = useCallback(({
    type = 'success',
    title,
    message,
    badge,
    details = null, // { label, value } or string
    confirmText = 'Done',
    cancelText = 'Cancel',
    showCancel = false,
    onConfirm = null,
    onCancel = null
  }) => {
    return new Promise((resolve) => {
      setActiveModal({
        type,
        title,
        message,
        badge,
        details,
        confirmText,
        cancelText,
        showCancel,
        handleConfirm: () => {
          setActiveModal(null);
          if (onConfirm) onConfirm();
          resolve(true);
        },
        handleCancel: () => {
          setActiveModal(null);
          if (onCancel) onCancel();
          resolve(false);
        }
      });
    });
  }, []);

  const closeModal = useCallback(() => {
    if (activeModal?.handleCancel) {
      activeModal.handleCancel();
    } else {
      setActiveModal(null);
    }
  }, [activeModal]);

  return (
    <PopupContext.Provider value={{ showToast, showModal, dismissToast, closeModal }}>
      {children}

      {/* Floating Toast Container */}
      <div className="fixed top-5 right-5 z-[99999] flex flex-col space-y-3 pointer-events-none max-w-sm sm:max-w-md w-full px-4">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              className="pointer-events-auto bg-[#111111] text-white p-4 rounded-2xl shadow-2xl border border-[#C8A96B]/50 backdrop-blur-xl flex items-start space-x-3.5 animate-in slide-in-from-top-4 fade-in duration-300 transform transition-all hover:scale-[1.02]"
            >
              {/* Icon Aura */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isSuccess
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : isError
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : isWarning
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-[#C8A96B]/20 text-[#C8A96B] border border-[#C8A96B]/40'
              }`}>
                {isSuccess && <CheckCircle2 className="w-5 h-5" />}
                {isError && <AlertCircle className="w-5 h-5" />}
                {isWarning && <AlertTriangle className="w-5 h-5" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5" />}
              </div>

              {/* Text */}
              <div className="flex-1 pr-2 space-y-0.5">
                {toast.title && (
                  <h4 className="font-black text-sm text-[#FAF7F0] tracking-tight">
                    {toast.title}
                  </h4>
                )}
                <p className="text-xs text-[#C8C6BE] leading-relaxed">
                  {toast.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-[#858585] hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Luxury Modal Dialog */}
      {activeModal && (
        <div className="fixed inset-0 z-[99998] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-lg rounded-3xl border border-[#E2E0DB] dark:border-[#2E2E2E] shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-in zoom-in-95 duration-200 relative overflow-hidden">
            
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C8A96B] via-[#E5D2A4] to-[#C8A96B]" />

            {/* Glowing Icon */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                activeModal.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : activeModal.type === 'confirm' || activeModal.type === 'warning'
                    ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10'
                    : activeModal.type === 'error'
                      ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/30 shadow-lg shadow-rose-500/10'
                      : 'bg-[#C8A96B]/10 text-[#C8A96B] border border-[#C8A96B]/30 shadow-lg shadow-[#C8A96B]/10'
              }`}>
                {activeModal.type === 'success' && <CheckCircle2 className="w-10 h-10" />}
                {(activeModal.type === 'confirm' || activeModal.type === 'warning') && <AlertTriangle className="w-10 h-10" />}
                {activeModal.type === 'error' && <AlertCircle className="w-10 h-10" />}
                {activeModal.type === 'info' && <Info className="w-10 h-10" />}
              </div>
            </div>

            {/* Header Titles */}
            <div className="space-y-2">
              {activeModal.badge && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#FAF7F0] dark:bg-[#252525] border border-[#C8A96B]/40 text-[#111111] dark:text-[#C8A96B] rounded-full text-xs font-black uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-[#C8A96B]" />
                  <span>{activeModal.badge}</span>
                </span>
              )}
              <h3 className="text-2xl sm:text-3xl font-black text-[#111111] dark:text-white tracking-tight">
                {activeModal.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#555555] dark:text-[#858585] leading-relaxed max-w-md mx-auto">
                {activeModal.message}
              </p>
            </div>

            {/* Details Box */}
            {activeModal.details && (
              <div className="p-4 bg-[#FAF7F0] dark:bg-[#252525] rounded-2xl border border-[#E2E0DB] dark:border-[#333333] text-left space-y-2 text-xs">
                {typeof activeModal.details === 'object' && !Array.isArray(activeModal.details) ? (
                  Object.entries(activeModal.details).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center py-1 border-b border-[#E2E0DB]/50 dark:border-[#333333]/50 last:border-none">
                      <span className="text-[#858585] font-medium">{key}</span>
                      <strong className="text-[#111111] dark:text-white font-mono">{String(val)}</strong>
                    </div>
                  ))
                ) : (
                  <p className="font-medium text-[#111111] dark:text-white">{String(activeModal.details)}</p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              {activeModal.showCancel && (
                <button
                  type="button"
                  onClick={activeModal.handleCancel}
                  className="btn-emerald-secondary flex-1 py-3 text-xs sm:text-sm font-bold"
                >
                  {activeModal.cancelText}
                </button>
              )}
              <button
                type="button"
                onClick={activeModal.handleConfirm}
                className={`py-3 px-6 text-xs sm:text-sm font-bold flex-1 transition shadow-md ${
                  activeModal.type === 'confirm' && activeModal.showCancel
                    ? 'bg-rose-600 hover:bg-rose-700 text-white rounded-xl'
                    : 'btn-emerald-primary'
                }`}
              >
                {activeModal.confirmText}
              </button>
            </div>

          </div>
        </div>
      )}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
}

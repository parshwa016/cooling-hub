import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles, CheckCircle2 } from 'lucide-react';

const WHATSAPP_NUMBER = '919099991453'; // Parshwa Enterprise Ahmedabad

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const quickPrompts = [
    { label: '❄️ Buy New AC (Prices & Deals)', msg: 'Hi Parshwa Enterprise! I am interested in buying a 5-Star Inverter AC in Ahmedabad. Could you share current offers and installation details?' },
    { label: '👨‍🔧 Book Doorstep AC Jet Wash', msg: 'Hi! I would like to book a Doorstep AC Foam Jet Service in Ahmedabad. What slots are available?' },
    { label: '🛡️ AMC & Repair Inquiry', msg: 'Hello Parshwa Enterprise, I need assistance with AC repair / AMC protection for my home/office.' },
  ];

  const handleSend = (text) => {
    const messageToSend = text || customMsg || 'Hi Parshwa Enterprise (Cooling Hub), I have an inquiry about AC sales & services.';
    const encoded = encodeURIComponent(messageToSend);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-40 flex flex-col items-start">
      {/* Expanded Quick WhatsApp Chat Popover */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-3xl bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#2E2E2E] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                💬
              </div>
              <div>
                <h4 className="font-extrabold text-sm flex items-center space-x-1.5">
                  <span>Parshwa Enterprise</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200 fill-emerald-200" />
                </h4>
                <p className="text-[11px] text-emerald-100">
                  Official Daikin Dealer • Navrangpura, Ahmedabad
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 bg-[#FAF7F0] dark:bg-[#202020]">
            <div className="p-3 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E2E0DB] dark:border-[#2E2E2E] shadow-xs">
              <p className="text-xs text-[#333333] dark:text-[#E2E0DB] leading-relaxed">
                👋 Hello! Chat directly with our AC technical sales team on WhatsApp.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-[#858585] tracking-wider block">
                Quick Inquiries:
              </span>
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q.msg)}
                  className="w-full text-left p-2.5 rounded-xl bg-white dark:bg-[#1A1A1A] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-[#E2E0DB] dark:border-[#2E2E2E] text-xs font-semibold text-[#111111] dark:text-[#F7F6F2] hover:text-emerald-700 dark:hover:text-emerald-400 transition flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate mr-2">{q.label}</span>
                  <Send className="w-3.5 h-3.5 text-emerald-600 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="pt-2 flex items-center space-x-2">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#2E2E2E] text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={() => handleSend()}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm cursor-pointer"
                title="Send on WhatsApp"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center pt-1">
              <span className="text-[10px] text-[#858585]">
                Direct WhatsApp Desk • Parshwa Enterprise
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center space-x-2 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/30 cursor-pointer"
        title="Chat on WhatsApp with Parshwa Enterprise"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white animate-ping" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />
        
        {/* WhatsApp Official Style Icon */}
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>

        <span>WhatsApp Us</span>
      </button>
    </div>
  );
}

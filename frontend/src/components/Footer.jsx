import React from 'react';
import { Snowflake, Phone, Mail, MapPin, ShieldCheck, Clock, Award, PhoneCall } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="bg-[#111111] text-[#E2E0DB] pt-16 pb-8 border-t border-[#292929] transition-colors">
      <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        
        {/* Value Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-[#292929]">
          <div className="flex items-center space-x-3.5 bg-[#1A1A1A] p-5 rounded-2xl border border-[#2E2E2E]">
            <div className="p-3 bg-[#C8A96B]/15 text-[#C8A96B] rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm sm:text-base">100% Genuine ACs</h4>
              <p className="text-xs text-[#858585]">Direct brand warranty & bill</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 bg-[#1A1A1A] p-5 rounded-2xl border border-[#2E2E2E]">
            <div className="p-3 bg-[#C8A96B]/15 text-[#C8A96B] rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm sm:text-base">6-Hour Rapid Service</h4>
              <p className="text-xs text-[#858585]">Verified certified technicians</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 bg-[#1A1A1A] p-5 rounded-2xl border border-[#2E2E2E]">
            <div className="p-3 bg-[#C8A96B]/15 text-[#C8A96B] rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm sm:text-base">AMC Protection</h4>
              <p className="text-xs text-[#858585]">Zero maintenance stress</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 bg-[#1A1A1A] p-5 rounded-2xl border border-[#2E2E2E]">
            <div className="p-3 bg-[#C8A96B]/15 text-[#C8A96B] rounded-xl">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm sm:text-base">24/7 AI Assistance</h4>
              <p className="text-xs text-[#858585]">Coolie AI chatbot support</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] border border-[#C8A96B]/30 flex items-center justify-center text-white">
                <Snowflake className="w-5 h-5 text-[#C8A96B]" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">COOLING HUB</span>
            </div>
            <p className="text-xs text-[#858585] leading-relaxed mb-4">
              India's premier all-in-one platform for AC shopping, expert installation, maintenance, complaint resolution, and AMC care. Powered by FastAPI & modern Web Tech.
            </p>
            <div className="flex items-center space-x-2 text-xs text-[#E2E0DB]/80">
              <MapPin className="w-4 h-4 text-[#C8A96B]" />
              <span>Cooling Hub Tower, Sector 62, Noida, NCR</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-4">AC Shopping</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setActiveTab('shop')} className="hover:text-[#C8A96B] transition">Split ACs (1.0T, 1.5T, 2.0T)</button></li>
              <li><button onClick={() => setActiveTab('shop')} className="hover:text-[#C8A96B] transition">Window ACs</button></li>
              <li><button onClick={() => setActiveTab('shop')} className="hover:text-[#C8A96B] transition">5-Star Inverter ACs</button></li>
              <li><button onClick={() => setActiveTab('calculator')} className="hover:text-[#C8A96B] transition">Energy Calculator</button></li>
              <li><button onClick={() => setActiveTab('shop')} className="hover:text-[#C8A96B] transition">Product Comparison</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Services & Complaints</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setActiveTab('services')} className="hover:text-[#C8A96B] transition">AC Foam Jet Wash</button></li>
              <li><button onClick={() => setActiveTab('services')} className="hover:text-[#C8A96B] transition">AC Installation & Uninstallation</button></li>
              <li><button onClick={() => setActiveTab('services')} className="hover:text-[#C8A96B] transition">Gas Charging (R32 / R410A)</button></li>
              <li><button onClick={() => setActiveTab('complaints')} className="hover:text-[#C8A96B] transition">Raise Priority Complaint</button></li>
              <li><button onClick={() => setActiveTab('amc')} className="hover:text-[#C8A96B] transition">Annual Maintenance Contracts (AMC)</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Support & Contact</h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#C8A96B]" />
                <span>24/7 Helpline: +91 1800-COOL-HUB</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#C8A96B]" />
                <span>support@coolinghub.com</span>
              </div>
              <div className="pt-2">
                <span className="block text-[11px] font-semibold text-[#858585] mb-1">Simulated WhatsApp Support:</span>
                <a 
                  href="https://wa.me/919876543210?text=Hi%20Cooling%20Hub,%20I%20need%20assistance" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#C8A96B] hover:text-[#111111] text-white border border-[#C8A96B]/30 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm"
                >
                  <span>WhatsApp Helpdesk</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-[#292929] text-center text-xs text-[#858585]">
          © {new Date().getFullYear()} Cooling Hub Platform — Final Year Academic Project. Built with FastAPI, React 18, and Tailwind CSS.
        </div>
      </div>
    </footer>
  );
}

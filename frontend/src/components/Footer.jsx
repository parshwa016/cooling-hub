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
              <p className="text-xs text-[#858585]">Direct brand warranty & GST bill</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 bg-[#1A1A1A] p-5 rounded-2xl border border-[#2E2E2E]">
            <div className="p-3 bg-[#C8A96B]/15 text-[#C8A96B] rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm sm:text-base">Rapid Doorstep Service</h4>
              <p className="text-xs text-[#858585]">Verified technicians in Ahmedabad</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 bg-[#1A1A1A] p-5 rounded-2xl border border-[#2E2E2E]">
            <div className="p-3 bg-[#C8A96B]/15 text-[#C8A96B] rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm sm:text-base">Annual AMC Care</h4>
              <p className="text-xs text-[#858585]">Zero maintenance stress</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 bg-[#1A1A1A] p-5 rounded-2xl border border-[#2E2E2E]">
            <div className="p-3 bg-[#C8A96B]/15 text-[#C8A96B] rounded-xl">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm sm:text-base">24/7 AI & WhatsApp</h4>
              <p className="text-xs text-[#858585]">Instant WhatsApp & AI helpdesk</p>
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
              Authorized Daikin & premium multi-brand AC sales, expert installation, foam jet maintenance, complaint resolution, and AMC care by <strong>Parshwa Enterprise</strong>, Ahmedabad.
            </p>
            <div className="flex items-start space-x-2 text-xs text-[#E2E0DB]/80">
              <MapPin className="w-4 h-4 text-[#C8A96B] flex-shrink-0 mt-0.5" />
              <span>Parshwa Enterprise, Navrangpura, Ahmedabad, Gujarat - 380009</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-4">AC Shopping</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setActiveTab('shop')} className="hover:text-[#C8A96B] transition cursor-pointer">Split ACs (1.0T, 1.5T, 2.0T)</button></li>
              <li><button onClick={() => setActiveTab('shop')} className="hover:text-[#C8A96B] transition cursor-pointer">Window ACs</button></li>
              <li><button onClick={() => setActiveTab('shop')} className="hover:text-[#C8A96B] transition cursor-pointer">5-Star Inverter ACs</button></li>
              <li><button onClick={() => setActiveTab('calculator')} className="hover:text-[#C8A96B] transition cursor-pointer">Energy Calculator</button></li>
              <li><button onClick={() => setActiveTab('shop')} className="hover:text-[#C8A96B] transition cursor-pointer">Product Comparison</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Services & Complaints</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setActiveTab('services')} className="hover:text-[#C8A96B] transition cursor-pointer">AC Foam Jet Wash</button></li>
              <li><button onClick={() => setActiveTab('services')} className="hover:text-[#C8A96B] transition cursor-pointer">AC Installation & Uninstallation</button></li>
              <li><button onClick={() => setActiveTab('services')} className="hover:text-[#C8A96B] transition cursor-pointer">Gas Charging (R32 / R410A)</button></li>
              <li><button onClick={() => setActiveTab('complaints')} className="hover:text-[#C8A96B] transition cursor-pointer">Raise Priority Complaint</button></li>
              <li><button onClick={() => setActiveTab('amc')} className="hover:text-[#C8A96B] transition cursor-pointer">Annual Maintenance Contracts (AMC)</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Support & Contact</h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#C8A96B] flex-shrink-0" />
                <span>Direct Helpdesk: <strong>Parshwa Enterprise Support</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#C8A96B] flex-shrink-0" />
                <span>parshwaenterprise01@gmail.com</span>
              </div>
              <div className="pt-2">
                <span className="block text-[11px] font-semibold text-[#858585] mb-1">WhatsApp Direct Desk:</span>
                <a 
                  href="https://wa.me/919099991453?text=Hi%20Parshwa%20Enterprise,%20I%20have%20an%20inquiry%20regarding%20AC%20sales%20and%20service%20in%20Ahmedabad" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center space-x-2 px-3 py-1.5 bg-emerald-700/80 hover:bg-emerald-600 text-white border border-emerald-500/40 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm"
                >
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-[#292929] text-center text-xs text-[#858585]">
          © {new Date().getFullYear()} Cooling Hub Platform & Parshwa Enterprise. Authorized AC Sales & Doorstep Care in Ahmedabad, Gujarat.
        </div>
      </div>
    </footer>
  );
}

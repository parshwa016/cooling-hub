import React from 'react';
import { Snowflake, Phone, Mail, MapPin, ShieldCheck, Clock, Award, PhoneCall } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-center space-x-3 bg-slate-800/60 p-4 rounded-xl">
            <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">100% Genuine ACs</h4>
              <p className="text-xs text-slate-400">Direct brand warranty & bill</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-800/60 p-4 rounded-xl">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">6-Hour Rapid Service</h4>
              <p className="text-xs text-slate-400">Verified certified technicians</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-800/60 p-4 rounded-xl">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">AMC Protection</h4>
              <p className="text-xs text-slate-400">Zero maintenance stress</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-800/60 p-4 rounded-xl">
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-lg">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">24/7 AI Assistance</h4>
              <p className="text-xs text-slate-400">Coolie AI chatbot support</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-white">
                <Snowflake className="w-5 h-5" />
              </div>
              <span className="text-lg font-black text-white">COOLING HUB</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              India's premier all-in-one platform for AC shopping, expert installation, maintenance, complaint resolution, and AMC care. Powered by FastAPI & modern Web Tech.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Cooling Hub Tower, Sector 62, Noida, NCR</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-4">AC Shopping</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setActiveTab('shop')} className="hover:text-cyan-400 transition">Split ACs (1.0T, 1.5T, 2.0T)</button></li>
              <li><button onClick={() => setActiveTab('shop')} className="hover:text-cyan-400 transition">Window ACs</button></li>
              <li><button onClick={() => setActiveTab('shop')} className="hover:text-cyan-400 transition">5-Star Inverter ACs</button></li>
              <li><button onClick={() => setActiveTab('calculator')} className="hover:text-cyan-400 transition">Energy Calculator</button></li>
              <li><button onClick={() => setActiveTab('shop')} className="hover:text-cyan-400 transition">Product Comparison</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Services & Complaints</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setActiveTab('services')} className="hover:text-cyan-400 transition">AC Foam Jet Wash</button></li>
              <li><button onClick={() => setActiveTab('services')} className="hover:text-cyan-400 transition">AC Installation & Uninstallation</button></li>
              <li><button onClick={() => setActiveTab('services')} className="hover:text-cyan-400 transition">Gas Charging (R32 / R410A)</button></li>
              <li><button onClick={() => setActiveTab('complaints')} className="hover:text-cyan-400 transition">Raise Priority Complaint</button></li>
              <li><button onClick={() => setActiveTab('amc')} className="hover:text-cyan-400 transition">Annual Maintenance Contracts (AMC)</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Support & Contact</h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-cyan-400" />
                <span>24/7 Helpline: +91 1800-COOL-HUB</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>support@coolinghub.com</span>
              </div>
              <div className="pt-2">
                <span className="block text-[11px] font-semibold text-slate-400 mb-1">Simulated WhatsApp Support:</span>
                <a 
                  href="https://wa.me/919876543210?text=Hi%20Cooling%20Hub,%20I%20need%20assistance" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-semibold hover:bg-emerald-500 transition"
                >
                  <span>WhatsApp Helpdesk</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Cooling Hub Platform — Final Year Academic Project. Built with FastAPI, React 18, and Tailwind CSS.
        </div>
      </div>
    </footer>
  );
}

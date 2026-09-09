import React, { useState } from 'react';
import { 
  Snowflake, ShoppingCart, Heart, MapPin, 
  Sun, Moon, UserCheck, Wrench, ShieldCheck, ChevronDown, 
  Menu, X, Scale, User, Zap, AlertTriangle, Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ activeTab, setActiveTab, onOpenCart }) {
  const { currentUser, switchRole } = useAuth();
  const { cartItemCount, wishlist, compareItems, pincode, setPincode } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editingPincode, setEditingPincode] = useState(false);
  const [tempPin, setTempPin] = useState(pincode);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  const handlePincodeSubmit = (e) => {
    e.preventDefault();
    if (tempPin.length === 6) {
      setPincode(tempPin);
      setEditingPincode(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      
      {/* Top Thin Announcement Strip */}
      <div className="bg-brand-navy text-white text-[11px] py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center space-x-2">
        <span>🎉 Summer AC Offer! Get 10% OFF with code <strong className="text-brand-orange underline">COOL2026</strong> + Free Installation</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-2.5 cursor-pointer group flex-shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-navy flex items-center justify-center text-white shadow-md group-hover:bg-cyan-600 transition">
              <Snowflake className="w-5 h-5 text-cyan-300 group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-brand-navy dark:text-white">
                COOLING<span className="text-brand-orange">HUB</span>
              </span>
              <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-widest -mt-1">
                AC Shop & Services
              </span>
            </div>
          </div>

          {/* Clean Desktop Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold transition ${
                activeTab === 'home'
                  ? 'bg-slate-100 dark:bg-slate-800 text-brand-navy dark:text-cyan-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-brand-navy hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => setActiveTab('shop')}
              className={`px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold transition ${
                activeTab === 'shop' || activeTab === 'product_detail'
                  ? 'bg-slate-100 dark:bg-slate-800 text-brand-navy dark:text-cyan-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-brand-navy hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              AC Store
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold transition flex items-center space-x-1 ${
                activeTab === 'calculator'
                  ? 'bg-slate-100 dark:bg-slate-800 text-brand-navy dark:text-cyan-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-brand-navy hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-brand-orange" />
              <span>Savings Calc</span>
            </button>

            {/* Combined Services & Care Dropdown */}
            <div className="relative">
              <button
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                onMouseEnter={() => setServicesDropdownOpen(true)}
                className={`px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold transition flex items-center space-x-1 ${
                  ['services', 'complaints', 'amc'].includes(activeTab)
                    ? 'bg-slate-100 dark:bg-slate-800 text-brand-navy dark:text-cyan-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-brand-navy hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>Services & Care</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {servicesDropdownOpen && (
                <div 
                  onMouseLeave={() => setServicesDropdownOpen(false)}
                  className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <button
                    onClick={() => { setActiveTab('services'); setServicesDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 font-medium"
                  >
                    <Wrench className="w-4 h-4 text-cyan-600" />
                    <span>🔧 Book AC Service & Repair</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('complaints'); setServicesDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 font-medium"
                  >
                    <AlertTriangle className="w-4 h-4 text-brand-orange" />
                    <span>📢 Raise Complaint Ticket</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('amc'); setServicesDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 font-medium border-t border-slate-100 dark:border-slate-800 pt-2"
                  >
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>📅 AMC Maintenance Plans</span>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Icons Group */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Deliver Pincode Badge */}
            <div className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs text-slate-600 dark:text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-brand-orange" />
              <span className="text-[11px]">Pin:</span>
              {editingPincode ? (
                <form onSubmit={handlePincodeSubmit} className="flex items-center">
                  <input 
                    type="text" 
                    value={tempPin} 
                    onChange={(e) => setTempPin(e.target.value)}
                    maxLength={6}
                    className="w-14 px-1 bg-white dark:bg-slate-900 border rounded text-[11px] text-center"
                    autoFocus
                  />
                </form>
              ) : (
                <button 
                  onClick={() => setEditingPincode(true)}
                  className="font-bold underline text-brand-navy dark:text-cyan-400 hover:text-brand-orange"
                >
                  {pincode}
                </button>
              )}
            </div>

            {/* Compare Counter Badge (If active) */}
            {compareItems.length > 0 && (
              <button 
                onClick={() => setActiveTab('shop')}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 text-xs font-bold"
                title="Compare Selected ACs"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>({compareItems.length})</span>
              </button>
            )}

            {/* Shopping Cart Icon */}
            <button 
              onClick={onOpenCart}
              className="relative p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-brand-navy dark:text-white" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-brand-orange text-white rounded-full text-[10px] font-extrabold flex items-center justify-center px-1 shadow">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle Dark/Light Theme"
            >
              {theme === 'light' ? <Moon className="w-4.5 h-4.5 text-slate-700" /> : <Sun className="w-4.5 h-4.5 text-amber-400" />}
            </button>

            {/* Unified Account & Persona Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className="flex items-center space-x-1.5 p-1.5 sm:px-3 sm:py-1.5 bg-brand-navy text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-sm"
              >
                <User className="w-4 h-4 text-cyan-300" />
                <span className="hidden sm:inline">
                  {currentUser.role === 'customer' ? 'My Account' : currentUser.role === 'technician' ? 'Tech Portal' : 'Admin Panel'}
                </span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {accountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  
                  {/* Current Active Workspace Links */}
                  <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    {currentUser.role.toUpperCase()} WORKSPACE
                  </div>

                  {currentUser.role === 'customer' && (
                    <button
                      onClick={() => { setActiveTab('dashboard'); setAccountDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2"
                    >
                      <UserCheck className="w-4 h-4 text-cyan-600" />
                      <span>Customer Dashboard</span>
                    </button>
                  )}

                  {currentUser.role === 'technician' && (
                    <button
                      onClick={() => { setActiveTab('technician'); setAccountDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2"
                    >
                      <Wrench className="w-4 h-4 text-brand-orange" />
                      <span>Technician Field Jobs</span>
                    </button>
                  )}

                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => { setActiveTab('admin'); setAccountDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                      <span>Executive Admin Panel</span>
                    </button>
                  )}

                  {/* Demo Role Switcher Section */}
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    SWITCH DEMO ROLE
                  </div>
                  
                  <button
                    onClick={() => { switchRole('customer'); setActiveTab('dashboard'); setAccountDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between ${
                      currentUser.role === 'customer' ? 'font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span>👤 Customer (John)</span>
                    {currentUser.role === 'customer' && <span className="text-[10px]">Active</span>}
                  </button>

                  <button
                    onClick={() => { switchRole('technician'); setActiveTab('technician'); setAccountDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between ${
                      currentUser.role === 'technician' ? 'font-bold text-brand-orange bg-orange-50 dark:bg-orange-950/40' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span>👨‍🔧 Technician (Rajesh)</span>
                    {currentUser.role === 'technician' && <span className="text-[10px]">Active</span>}
                  </button>

                  <button
                    onClick={() => { switchRole('admin'); setActiveTab('admin'); setAccountDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between ${
                      currentUser.role === 'admin' ? 'font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span>🧑‍💼 Admin Director</span>
                    {currentUser.role === 'admin' && <span className="text-[10px]">Active</span>}
                  </button>

                </div>
              )}
            </div>

            {/* Mobile Drawer Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-5 space-y-2">
          <button
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold ${activeTab === 'home' ? 'bg-slate-100 dark:bg-slate-800 text-brand-navy dark:text-cyan-400' : 'text-slate-700 dark:text-slate-200'}`}
          >
            Home
          </button>
          <button
            onClick={() => { setActiveTab('shop'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold ${activeTab === 'shop' ? 'bg-slate-100 dark:bg-slate-800 text-brand-navy dark:text-cyan-400' : 'text-slate-700 dark:text-slate-200'}`}
          >
            🛒 AC Store
          </button>
          <button
            onClick={() => { setActiveTab('calculator'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold ${activeTab === 'calculator' ? 'bg-slate-100 dark:bg-slate-800 text-brand-navy dark:text-cyan-400' : 'text-slate-700 dark:text-slate-200'}`}
          >
            ⚡ Energy & Savings Calculator
          </button>
          <button
            onClick={() => { setActiveTab('services'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold ${activeTab === 'services' ? 'bg-slate-100 dark:bg-slate-800 text-brand-navy dark:text-cyan-400' : 'text-slate-700 dark:text-slate-200'}`}
          >
            🔧 AC Services & Repair
          </button>
          <button
            onClick={() => { setActiveTab('complaints'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold ${activeTab === 'complaints' ? 'bg-slate-100 dark:bg-slate-800 text-brand-navy dark:text-cyan-400' : 'text-slate-700 dark:text-slate-200'}`}
          >
            📢 Complaints & Escalation
          </button>
          <button
            onClick={() => { setActiveTab('amc'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold ${activeTab === 'amc' ? 'bg-slate-100 dark:bg-slate-800 text-brand-navy dark:text-cyan-400' : 'text-slate-700 dark:text-slate-200'}`}
          >
            📅 AMC Protection Plans
          </button>
        </div>
      )}
    </header>
  );
}

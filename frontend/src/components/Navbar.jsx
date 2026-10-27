import React, { useState, useEffect } from 'react';
import { 
  Snowflake, ShoppingCart, Heart, 
  Sun, Moon, UserCheck, Wrench, ShieldCheck, ChevronDown, 
  Menu, X, Scale, User, Zap, AlertTriangle, Calendar, LogOut,
  Bell, CheckCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

// Helper component to render letters individually for the Airflow Wave effect
function WavyWord({ text }) {
  return (
    <span className="inline-flex items-center">
      {text.split('').map((char, idx) => (
        <span
          key={idx}
          className="wavy-char"
          style={{ '--char-index': idx }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}

export default function Navbar({ activeTab, setActiveTab, onOpenCart }) {
  const { currentUser, logout, openAuthModal, switchRole } = useAuth();
  const isTechnician = currentUser?.role === 'technician';
  const { cartItemCount, compareItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navRef = React.useRef(null);
  const [navHeight, setNavHeight] = useState(108);

  const [notifications, setNotifications] = useState([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    try {
      const data = await api.getNotifications({ user_id: currentUser.id, role: currentUser.role });
      setNotifications(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 8000);
    return () => clearInterval(interval);
  }, [currentUser?.id, currentUser?.role]);

  const handleMarkAllNotifsRead = async () => {
    try {
      await api.markAllNotificationsRead({ user_id: currentUser?.id, role: currentUser?.role });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleNotifications = async () => {
    const nextState = !notifDropdownOpen;
    setNotifDropdownOpen(nextState);

    // Requirement 1: Once user clicks to see notifications, the unread badge number MUST disappear
    if (nextState && unreadCount > 0) {
      // Optimistically clear the unread badge immediately in the UI
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      // Persist to backend so it stays read across page reloads/polls
      try {
        await api.markAllNotificationsRead({ user_id: currentUser?.id, role: currentUser?.role });
      } catch (e) {
        console.error("Failed to mark notifications read:", e);
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Measure base navbar height so content is never hidden behind fixed navbar
  useEffect(() => {
    const updateHeight = () => {
      if (navRef.current) {
        const headerEl = navRef.current;
        const mainBar = headerEl.querySelector('.main-nav-bar');
        const announcement = headerEl.querySelector('.announcement-bar');
        const h = (mainBar ? mainBar.offsetHeight : 72) + (announcement ? announcement.offsetHeight : 36);
        if (h > 0) setNavHeight(h);
      }
    };

    updateHeight();

    let observer;
    if (typeof ResizeObserver !== 'undefined' && navRef.current) {
      observer = new ResizeObserver(updateHeight);
      observer.observe(navRef.current);
    }

    window.addEventListener('resize', updateHeight);
    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  // Track scroll position for navbar shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header 
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-md bg-white/95 dark:bg-[#111111]/95 border-b border-[#E2E0DB] dark:border-[#292929] transition-all duration-300 ${
          isScrolled ? 'navbar-scrolled shadow-md' : 'shadow-[0_2px_12px_rgba(17,17,17,0.03)]'
        }`}
      >
        
        {/* Top Announcement Strip */}
        <div className="announcement-bar bg-[#111111] text-white text-[11px] sm:text-xs py-2.5 px-4 sm:px-6 md:px-8 lg:px-12 text-center font-medium tracking-wide flex items-center justify-center space-x-2 border-b border-[#292929]/80">
          {isTechnician ? (
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[#FAF7F0] font-semibold">Service Man Duty Mode</span>
              <span className="text-[#858585]">|</span>
              <span className="text-[#C8A96B] font-bold">Field Service Workspace & Real-time Dispatch</span>
            </div>
          ) : (
            <span>🎉 Summer AC Offer! Get 10% OFF with code <strong className="text-[#C8A96B] underline font-bold">COOL2026</strong> + Free Installation</span>
          )}
        </div>

        <div className="main-nav-bar w-full max-w-[1536px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-3 sm:py-3.5 lg:py-4">
        <div className="flex items-center justify-between min-h-[52px] sm:min-h-[56px] gap-6">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab(isTechnician ? 'technician' : 'home')}
            className="flex items-center space-x-3 cursor-pointer group flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-[#111111] flex items-center justify-center text-white shadow-sm group-hover:bg-[#C8A96B] transition-colors duration-300">
              {isTechnician ? (
                <Wrench className="w-5 h-5 text-[#C8A96B] group-hover:text-[#111111] transition-all duration-300" />
              ) : (
                <Snowflake className="w-5 h-5 text-[#C8A96B] group-hover:text-[#111111] group-hover:rotate-45 transition-all duration-300" />
              )}
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-[#111111] dark:text-white">
                COOLING<span className="text-[#C8A96B]">HUB</span>
              </span>
              <span className="block text-[10px] text-[#555555] dark:text-[#858585] font-bold uppercase tracking-widest -mt-0.5">
                {isTechnician ? 'Field Service Portal' : 'AC Shop & Services'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Menu */}
          {isTechnician ? (
            <div className="hidden md:flex items-center space-x-2.5 px-4 py-2 rounded-full bg-[#FAF7F0] dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#2E2E2E]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-[#111111] dark:text-[#FAF7F0]">
                Technician Work Order Portal
              </span>
              <span className="text-[10px] bg-[#111111] text-[#C8A96B] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ml-1">
                Active Duty
              </span>
            </div>
          ) : (
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2.5">
              <button
                onClick={() => setActiveTab('home')}
                className={`nav-airflow-link text-sm lg:text-[15px] font-semibold px-3.5 py-2.5 ${
                  activeTab === 'home' ? 'active' : ''
                }`}
              >
                <WavyWord text="Home" />
              </button>

              <button
                onClick={() => setActiveTab('shop')}
                className={`nav-airflow-link text-sm lg:text-[15px] font-semibold px-3.5 py-2.5 ${
                  activeTab === 'shop' || activeTab === 'product_detail' ? 'active' : ''
                }`}
              >
                <WavyWord text="AC Store" />
              </button>

              <button
                onClick={() => setActiveTab('calculator')}
                className={`nav-airflow-link text-sm lg:text-[15px] font-semibold px-3.5 py-2.5 space-x-1.5 ${
                  activeTab === 'calculator' ? 'active' : ''
                }`}
              >
                <Zap className="w-4 h-4 text-[#C8A96B]" />
                <WavyWord text="Savings Calc" />
              </button>

              {/* Combined Services & Care Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                  onMouseEnter={() => setServicesDropdownOpen(true)}
                  className={`nav-airflow-link text-sm lg:text-[15px] font-semibold px-3.5 py-2.5 space-x-1 ${
                    ['services', 'complaints', 'amc'].includes(activeTab) ? 'active' : ''
                  }`}
                >
                  <WavyWord text="Services & Care" />
                  <ChevronDown className="w-3.5 h-3.5 opacity-60 text-[#555555]" />
                </button>

                {servicesDropdownOpen && (
                  <div 
                    onMouseLeave={() => setServicesDropdownOpen(false)}
                    className="dropdown-premium absolute top-full left-0 mt-1 w-56 bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#2E2E2E] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <button
                      onClick={() => { setActiveTab('services'); setServicesDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs text-[#111111] dark:text-[#F7F6F2] hover:bg-[#FAF7F0] dark:hover:bg-[#252525] hover:text-[#111111] flex items-center space-x-2.5 font-medium transition-colors"
                    >
                      <Wrench className="w-4 h-4 text-[#C8A96B]" />
                      <span>Book AC Service & Repair</span>
                    </button>

                    <button
                      onClick={() => { setActiveTab('complaints'); setServicesDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs text-[#111111] dark:text-[#F7F6F2] hover:bg-[#FAF7F0] dark:hover:bg-[#252525] hover:text-[#111111] flex items-center space-x-2.5 font-medium transition-colors"
                    >
                      <AlertTriangle className="w-4 h-4 text-[#C8A96B]" />
                      <span>Raise Complaint Ticket</span>
                    </button>

                    <button
                      onClick={() => { setActiveTab('amc'); setServicesDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs text-[#111111] dark:text-[#F7F6F2] hover:bg-[#FAF7F0] dark:hover:bg-[#252525] hover:text-[#111111] flex items-center space-x-2.5 font-medium border-t border-[#E2E0DB] dark:border-[#2E2E2E] pt-2 transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-[#C8A96B]" />
                      <span>AMC Maintenance Plans</span>
                    </button>
                  </div>
                )}
              </div>
            </nav>
          )}

          {/* Right Action Icons Group */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Compare Counter Badge */}
            {!isTechnician && compareItems.length > 0 && (
              <button 
                onClick={() => setActiveTab('shop')}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-[#FAF7F0] dark:bg-[#1A1A1A] text-[#111111] dark:text-[#C8A96B] border border-[#E2E0DB] dark:border-[#2E2E2E] text-xs font-bold hover:border-[#C8A96B] transition"
                title="Compare Selected ACs"
              >
                <Scale className="w-3.5 h-3.5 text-[#C8A96B]" />
                <span>({compareItems.length})</span>
              </button>
            )}

            {/* Shopping Cart Icon */}
            {!isTechnician && (
              <button 
                onClick={onOpenCart}
                className="relative p-2.5 rounded-xl text-[#111111] dark:text-[#F7F6F2] hover:bg-[#FAF7F0] dark:hover:bg-[#252525] transition duration-200"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5 text-[#111111] dark:text-[#F7F6F2]" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-[#C8A96B] text-[#111111] font-black rounded-full text-[10px] flex items-center justify-center px-1 shadow-sm">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            {/* Notification Bell */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={handleToggleNotifications}
                  className="relative p-2.5 rounded-xl text-[#111111] dark:text-[#F7F6F2] hover:bg-[#FAF7F0] dark:hover:bg-[#252525] transition duration-200"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5 text-[#111111] dark:text-[#F7F6F2]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C8A96B] text-[#111111] font-black rounded-full text-[10px] flex items-center justify-center shadow-sm animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div 
                    onMouseLeave={() => setNotifDropdownOpen(false)}
                    className="dropdown-premium absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#2E2E2E] rounded-2xl shadow-2xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="px-4 pb-2 border-b border-[#E2E0DB] dark:border-[#2E2E2E] flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-4 h-4 text-[#C8A96B]" />
                        <span className="font-bold text-xs sm:text-sm text-[#111111] dark:text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 bg-[#111111] text-[#C8A96B] text-[10px] font-bold rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <button
                        onClick={handleMarkAllNotifsRead}
                        className="text-[11px] font-semibold text-[#C8A96B] hover:underline flex items-center space-x-1"
                      >
                        <CheckCheck className="w-3 h-3" />
                        <span>Mark all read</span>
                      </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-[#E2E0DB]/50 dark:divide-[#2E2E2E]/50">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-xs text-[#858585]">No notifications at this time.</p>
                      ) : (
                        notifications.slice(0, 15).map((n) => (
                          <div 
                            key={n.id} 
                            onClick={async () => {
                              try {
                                await api.markNotificationRead(n.id);
                              } catch (err) {
                                console.error(err);
                              }
                              setNotifDropdownOpen(false);
                              if (currentUser?.role === 'admin') {
                                setActiveTab('admin');
                              } else if (currentUser?.role === 'technician') {
                                setActiveTab('technician');
                              } else {
                                setActiveTab('dashboard');
                              }
                              fetchNotifications();
                            }}
                            className={`p-3 text-xs space-y-1 transition cursor-pointer hover:bg-[#FAF7F0] dark:hover:bg-[#252525] ${n.is_read ? 'opacity-70' : 'bg-[#FAF7F0]/80 dark:bg-[#202020]'}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#111111] dark:text-white">{n.title}</span>
                              <span className="text-[10px] text-[#858585]">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-[#555555] dark:text-[#858585] leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-[#111111] dark:text-[#F7F6F2] hover:bg-[#FAF7F0] dark:hover:bg-[#252525] transition duration-200"
              title="Toggle Dark/Light Theme"
            >
              {theme === 'light' ? <Moon className="w-4.5 h-4.5 text-[#111111]" /> : <Sun className="w-4.5 h-4.5 text-[#C8A96B]" />}
            </button>

            {/* User Authentication Status / Menu */}
            {!currentUser ? (
              /* GUEST: Show "Sign Up / Login" */
              <button
                onClick={() => openAuthModal('prompt')}
                className="group flex items-center space-x-2 px-4 py-2.5 bg-[#111111] text-white hover:bg-[#C8A96B] hover:text-[#111111] rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 shadow-sm"
              >
                <User className="w-4 h-4 text-[#C8A96B] group-hover:text-[#111111] transition-colors" />
                <span>Sign Up / Login</span>
              </button>
            ) : (
              /* LOGGED IN: Show Logged-in User's Name + Dropdown */
              <div className="relative">
                <button
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="group flex items-center space-x-2 px-4 py-2.5 bg-[#111111] text-white hover:bg-[#C8A96B] hover:text-[#111111] rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 shadow-sm"
                >
                  <div className="w-5 h-5 rounded-full bg-[#C8A96B] text-[#111111] flex items-center justify-center text-[10px] font-black">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="max-w-[120px] truncate">{currentUser.name}</span>
                  <ChevronDown className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                </button>

                {accountDropdownOpen && (
                  <div 
                    onMouseLeave={() => setAccountDropdownOpen(false)}
                    className="dropdown-premium absolute right-0 mt-2 w-60 bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#2E2E2E] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    {/* User Identity Header */}
                    <div className="px-4 py-2 border-b border-[#E2E0DB] dark:border-[#2E2E2E] mb-1">
                      <span className="text-xs font-black text-[#111111] dark:text-white block truncate">{currentUser.name}</span>
                      <span className="text-[11px] text-[#858585] block truncate">{currentUser.email}</span>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-[#FAF7F0] dark:bg-[#252525] text-[#C8A96B] uppercase border border-[#C8A96B]/30">
                        {currentUser.role}
                      </span>
                    </div>

                    {/* Dedicated Portal Links Based on User Role */}
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => { setActiveTab('admin'); setAccountDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-[#111111] dark:text-[#F7F6F2] hover:bg-[#FAF7F0] dark:hover:bg-[#252525] flex items-center space-x-2.5 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#C8A96B]" />
                        <span>Admin Control Center</span>
                      </button>
                    )}

                    {currentUser.role === 'technician' && (
                      <button
                        onClick={() => { setActiveTab('technician'); setAccountDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-[#111111] dark:text-[#F7F6F2] hover:bg-[#FAF7F0] dark:hover:bg-[#252525] flex items-center space-x-2.5 transition-colors"
                      >
                        <Wrench className="w-4 h-4 text-[#C8A96B]" />
                        <span>Technician Field Portal</span>
                      </button>
                    )}

                    {currentUser.role !== 'admin' && currentUser.role !== 'technician' && (
                      <button
                        onClick={() => { setActiveTab('dashboard'); setAccountDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-[#111111] dark:text-[#F7F6F2] hover:bg-[#FAF7F0] dark:hover:bg-[#252525] hover:text-[#111111] flex items-center space-x-2.5 transition-colors"
                      >
                        <UserCheck className="w-4 h-4 text-[#C8A96B]" />
                        <span>Customer Portal & Complaints</span>
                      </button>
                    )}

                    {/* My Orders (Customer & Admin only) */}
                    {!isTechnician && (
                      <button
                        onClick={() => { 
                          setActiveTab('dashboard'); 
                          setAccountDropdownOpen(false); 
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-[#111111] dark:text-[#F7F6F2] hover:bg-[#FAF7F0] dark:hover:bg-[#252525] hover:text-[#111111] flex items-center space-x-2.5 transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4 text-[#C8A96B]" />
                        <span>My Orders</span>
                      </button>
                    )}

                    {/* Logout */}
                    <div className="pt-1.5 mt-1.5 border-t border-[#E2E0DB] dark:border-[#2E2E2E]">
                      <button
                        onClick={() => { 
                          logout(); 
                          setAccountDropdownOpen(false); 
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center space-x-2.5 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* Mobile Drawer Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#111111] dark:text-[#F7F6F2] hover:bg-[#FAF7F0] dark:hover:bg-[#252525]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#1A1A1A] border-b border-[#E2E0DB] dark:border-[#2E2E2E] px-4 pt-3 pb-5 space-y-2 max-h-[calc(100vh-100px)] overflow-y-auto shadow-2xl">
          
          {/* Mobile Auth Button */}
          {!currentUser ? (
            <button
              onClick={() => { openAuthModal('prompt'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold bg-[#111111] text-white flex items-center space-x-2 mb-2"
            >
              <User className="w-4 h-4 text-[#C8A96B]" />
              <span>Sign Up / Login</span>
            </button>
          ) : (
            <div className="p-3 bg-[#FAF7F0] dark:bg-[#252525] rounded-xl border border-[#E2E0DB] dark:border-[#2E2E2E] mb-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-[#111111] dark:text-white">{currentUser.name}</span>
                <span className="text-[10px] uppercase font-bold text-[#C8A96B]">{currentUser.role}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => { 
                    if (currentUser.role === 'admin') setActiveTab('admin');
                    else if (currentUser.role === 'technician') setActiveTab('technician');
                    else setActiveTab('dashboard');
                    setMobileMenuOpen(false); 
                  }}
                  className="btn-emerald-secondary py-1.5 text-xs text-center"
                >
                  {currentUser.role === 'admin' ? 'Admin Panel' : currentUser.role === 'technician' ? 'Field Portal' : 'My Profile'}
                </button>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="py-1.5 text-xs font-bold text-rose-600 bg-white dark:bg-[#111111] rounded-xl border border-rose-200 dark:border-rose-900"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          {isTechnician ? (
            <div className="space-y-2 pt-1">
              <div className="p-3 bg-[#FAF7F0] dark:bg-[#202020] rounded-xl border border-[#E2E0DB] dark:border-[#2E2E2E] text-xs text-[#555555] dark:text-[#858585] space-y-1">
                <div className="font-bold text-[#111111] dark:text-white flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Technician Field Workspace</span>
                </div>
                <p>Website shopping and customer tools are restricted during technician duty.</p>
              </div>
              <button
                onClick={() => { setActiveTab('technician'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold bg-[#111111] text-[#C8A96B] flex items-center space-x-2"
              >
                <Wrench className="w-4 h-4 text-[#C8A96B]" />
                <span>Service Man Field Portal</span>
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold ${activeTab === 'home' ? 'bg-[#FAF7F0] dark:bg-[#252525] text-[#111111] dark:text-[#C8A96B]' : 'text-[#111111] dark:text-[#F7F6F2]'}`}
              >
                Home
              </button>
              <button
                onClick={() => { setActiveTab('shop'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold flex items-center space-x-2.5 ${activeTab === 'shop' ? 'bg-[#FAF7F0] dark:bg-[#252525] text-[#111111] dark:text-[#C8A96B]' : 'text-[#111111] dark:text-[#F7F6F2]'}`}
              >
                <ShoppingCart className="w-4 h-4 text-[#C8A96B]" />
                <span>AC Store</span>
              </button>
              <button
                onClick={() => { setActiveTab('calculator'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold flex items-center space-x-2.5 ${activeTab === 'calculator' ? 'bg-[#FAF7F0] dark:bg-[#252525] text-[#111111] dark:text-[#C8A96B]' : 'text-[#111111] dark:text-[#F7F6F2]'}`}
              >
                <Zap className="w-4 h-4 text-[#C8A96B]" />
                <span>Energy & Savings Calculator</span>
              </button>
              <button
                onClick={() => { setActiveTab('services'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold flex items-center space-x-2.5 ${activeTab === 'services' ? 'bg-[#FAF7F0] dark:bg-[#252525] text-[#111111] dark:text-[#C8A96B]' : 'text-[#111111] dark:text-[#F7F6F2]'}`}
              >
                <Wrench className="w-4 h-4 text-[#C8A96B]" />
                <span>Book AC Service & Repair</span>
              </button>
              <button
                onClick={() => { setActiveTab('complaints'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold flex items-center space-x-2.5 ${activeTab === 'complaints' ? 'bg-[#FAF7F0] dark:bg-[#252525] text-[#111111] dark:text-[#C8A96B]' : 'text-[#111111] dark:text-[#F7F6F2]'}`}
              >
                <AlertTriangle className="w-4 h-4 text-[#C8A96B]" />
                <span>Raise Complaint Ticket</span>
              </button>
              <button
                onClick={() => { setActiveTab('amc'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold flex items-center space-x-2.5 ${activeTab === 'amc' ? 'bg-[#FAF7F0] dark:bg-[#252525] text-[#111111] dark:text-[#C8A96B]' : 'text-[#111111] dark:text-[#F7F6F2]'}`}
              >
                <Calendar className="w-4 h-4 text-[#C8A96B]" />
                <span>AMC Maintenance Plans</span>
              </button>
            </>
          )}
        </div>
      )}
    </header>
    {/* Spacer so page content is never hidden behind fixed navbar */}
    <div 
      style={{ height: `${navHeight}px` }} 
      className="w-full flex-shrink-0 pointer-events-none" 
      aria-hidden="true" 
    />
  </>
  );
}


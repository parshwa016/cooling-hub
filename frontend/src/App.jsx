import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { PopupProvider } from './context/PopupContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import RoomVisualizerModal from './components/RoomVisualizerModal';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Services from './pages/Services';
import Complaints from './pages/Complaints';
import AMC from './pages/AMC';
import EnergyCalcPage from './pages/EnergyCalcPage';
import CustomerDashboard from './pages/CustomerDashboard';
import TechnicianPortal from './pages/TechnicianPortal';
import AdminDashboard from './pages/AdminDashboard';

function MainAppContent() {
  const { currentUser } = useAuth();
  const isTechnician = currentUser?.role === 'technician';

  const [activeTab, setActiveTab] = useState(() => {
    try {
      const saved = localStorage.getItem('coolinghub_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.role === 'technician') return 'technician';
        if (u.role === 'admin') return 'admin';
      }
    } catch (e) {}
    return 'home';
  });

  const [selectedProductId, setSelectedProductId] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);
  const [visualizerProduct, setVisualizerProduct] = useState(null);

  const handleOpenVisualizer = (prod = null) => {
    if (isTechnician) return;
    setVisualizerProduct(prod);
    setIsVisualizerOpen(true);
  };
  const [scrollProgress, setScrollProgress] = useState(0);

  // Strictly lock technician to the Technician Field Portal
  useEffect(() => {
    if (isTechnician && activeTab !== 'technician') {
      setActiveTab('technician');
    }
  }, [isTechnician, activeTab]);

  // Track window scroll for top luxury progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(currentProgress);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelectProduct = (id) => {
    if (isTechnician) return;
    setSelectedProductId(id);
    setActiveTab('product_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab) => {
    // Technicians cannot leave the Field Portal
    if (isTechnician) {
      setActiveTab('technician');
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F2] dark:bg-[#111111] text-[#555555] dark:text-[#F7F6F2] transition-colors duration-200 relative overflow-x-clip bg-dot-grid">
      
      {/* Top Scroll Indicator */}
      <div 
        id="scroll-progress" 
        style={{ width: `${scrollProgress}%` }} 
      />

      {/* Ambient Atmosphere Glow Orbs in Champagne & Rich Black */}
      <div className="fixed top-[-140px] left-1/4 w-[650px] h-[650px] bg-[#C8A96B]/8 dark:bg-[#C8A96B]/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse-glow" />
      <div className="fixed bottom-[-100px] right-10 w-[550px] h-[550px] bg-[#111111]/5 dark:bg-[#C8A96B]/5 rounded-full blur-[130px] pointer-events-none -z-10 animate-pulse-glow" />
      <div className="fixed top-[45%] right-[-150px] w-[500px] h-[500px] bg-[#C8A96B]/5 dark:bg-[#C8A96B]/8 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Navigation Header */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange}
        onOpenCart={() => {
          if (!isTechnician) setIsCartOpen(true);
        }}
        onOpenVisualizer={handleOpenVisualizer}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1536px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 pt-6 pb-12 relative z-10 animate-in fade-in duration-300">
        {/* If user is technician, strictly render ONLY the Service Man Field Portal */}
        {isTechnician ? (
          <TechnicianPortal />
        ) : (
          <>
            {activeTab === 'home' && (
              <Home 
                setActiveTab={handleTabChange} 
                onSelectProduct={handleSelectProduct}
                onOpenVisualizer={handleOpenVisualizer}
              />
            )}

            {activeTab === 'shop' && (
              <Shop 
                setActiveTab={handleTabChange} 
                onSelectProduct={handleSelectProduct}
              />
            )}

            {activeTab === 'product_detail' && (
              <ProductDetail 
                productId={selectedProductId}
                setActiveTab={handleTabChange}
              />
            )}

            {activeTab === 'calculator' && (
              <EnergyCalcPage 
                setActiveTab={handleTabChange}
              />
            )}

            {activeTab === 'services' && (
              <Services 
                setActiveTab={handleTabChange}
              />
            )}

            {activeTab === 'complaints' && (
              <Complaints 
                setActiveTab={handleTabChange}
              />
            )}

            {activeTab === 'amc' && (
              <AMC 
                setActiveTab={handleTabChange}
              />
            )}

            {activeTab === 'dashboard' && (
              <CustomerDashboard 
                setActiveTab={handleTabChange}
              />
            )}

            {activeTab === 'technician' && (
              <TechnicianPortal />
            )}

            {activeTab === 'admin' && (
              <AdminDashboard />
            )}
          </>
        )}
      </main>

      {/* Footer: Hidden for technicians, shown for customers and admin */}
      {!isTechnician ? (
        <Footer setActiveTab={handleTabChange} />
      ) : (
        <footer className="w-full max-w-[1536px] mx-auto px-4 sm:px-8 py-5 border-t border-[#E2E0DB] dark:border-[#2E2E2E] text-xs text-[#858585] flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-[#111111] dark:text-white">Cooling Hub Technician Field Workspace</span>
          </div>
          <span>Dispatch Helpline: +91 98112 23344 • Authorized Personnel Only</span>
        </footer>
      )}

      {/* AI Assistant Chatbot: Hidden for technicians */}
      {!isTechnician && <Chatbot setActiveTab={handleTabChange} />}

      {/* Slide-over Cart Drawer: Hidden for technicians */}
      {!isTechnician && (
        <CartDrawer 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          setActiveTab={handleTabChange}
        />
      )}

      {!isTechnician && (
        <RoomVisualizerModal
          isOpen={isVisualizerOpen}
          onClose={() => setIsVisualizerOpen(false)}
          initialProduct={visualizerProduct}
        />
      )}

      {/* Authentication & Sign-in Requirement Modal */}
      <AuthModal />

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PopupProvider>
          <CartProvider>
            <MainAppContent />
          </CartProvider>
        </PopupProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

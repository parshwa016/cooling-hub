import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { PopupProvider } from './context/PopupContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';

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

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

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
    setSelectedProductId(id);
    setActiveTab('product_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <PopupProvider>
          <CartProvider>
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
              onOpenCart={() => setIsCartOpen(true)}
            />

            {/* Main Content Area — Full-width fluid screen utilization with max container */}
            <main className="flex-1 w-full max-w-[1536px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 pt-6 pb-12 relative z-10 animate-in fade-in duration-300">
              {activeTab === 'home' && (
                <Home 
                  setActiveTab={handleTabChange} 
                  onSelectProduct={handleSelectProduct}
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
            </main>

            {/* Footer */}
            <Footer setActiveTab={handleTabChange} />

            {/* AI Assistant Chatbot */}
            <Chatbot setActiveTab={handleTabChange} />

            {/* Slide-over Cart Drawer */}
            <CartDrawer 
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              setActiveTab={handleTabChange}
            />

            {/* Authentication & Sign-in Requirement Modal */}
            <AuthModal />

          </div>
          </CartProvider>
        </PopupProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

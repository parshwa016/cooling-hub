import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import CartDrawer from './components/CartDrawer';

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
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 relative overflow-x-hidden bg-dot-grid">
            
            {/* Top Scroll Indicator */}
            <div 
              id="scroll-progress" 
              style={{ width: `${scrollProgress}%` }} 
            />

            {/* Ambient Background Aurora Glowing Orbs */}
            <div className="fixed top-[-150px] left-1/4 w-[650px] h-[650px] bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse-glow" />
            <div className="fixed bottom-[-100px] right-10 w-[550px] h-[550px] bg-orange-500/10 dark:bg-orange-500/12 rounded-full blur-[130px] pointer-events-none -z-10 animate-pulse-glow" />
            <div className="fixed top-[45%] right-[-150px] w-[500px] h-[500px] bg-blue-600/8 dark:bg-blue-600/12 rounded-full blur-[130px] pointer-events-none -z-10" />

            {/* Navigation Header */}
            <Navbar 
              activeTab={activeTab} 
              setActiveTab={handleTabChange}
              onOpenCart={() => setIsCartOpen(true)}
            />

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10 animate-in fade-in duration-300">
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

          </div>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

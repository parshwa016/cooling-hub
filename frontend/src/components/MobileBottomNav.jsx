import React from 'react';
import { Home, Snowflake, Wrench, Camera, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function MobileBottomNav({ activeTab, setActiveTab, onOpenCart, onOpenVisualizer }) {
  const { cartItemCount } = useCart();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, action: () => setActiveTab('home') },
    { id: 'shop', label: 'AC Store', icon: Snowflake, action: () => setActiveTab('shop') },
    { id: 'services', label: 'Services', icon: Wrench, action: () => setActiveTab('services') },
    { id: 'visualizer', label: 'Wall AR', icon: Camera, action: () => onOpenVisualizer?.() },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, action: onOpenCart, isCart: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-md border-t border-[#E2E0DB] dark:border-[#2E2E2E] shadow-2xl safe-area-pb">
      <div className="grid grid-cols-5 items-center justify-around py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex flex-col items-center justify-center py-1 transition-all relative ${
                isActive 
                  ? 'text-[#111111] dark:text-[#C8A96B]' 
                  : 'text-[#858585] hover:text-[#111111] dark:hover:text-[#FAF7F0]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                {item.isCart && cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-black' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#C8A96B] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

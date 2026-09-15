import React from 'react';
import { X, Check, Scale, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCompareModal({ isOpen, onClose }) {
  const { compareItems, toggleCompare, addToCart } = useCart();

  if (!isOpen || compareItems.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#292929] rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-[#F7F6F2] dark:bg-[#252525] border-b border-[#E2E0DB] dark:border-[#292929] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-[#C8A96B]" />
            <h3 className="font-bold text-[#111111] dark:text-white text-base">
              Product Comparison ({compareItems.length} ACs selected)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#FAF7F0] dark:hover:bg-[#111111] text-[#858585] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Matrix Table */}
        <div className="flex-1 overflow-x-auto p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E0DB] dark:border-[#292929]">
                <th className="p-3 text-xs font-bold text-[#858585] uppercase w-48">Feature</th>
                {compareItems.map((item) => (
                  <th key={item.id} className="p-3 text-center min-w-[220px]">
                    <div className="relative group">
                      <button
                        onClick={() => toggleCompare(item)}
                        className="absolute top-0 right-0 p-1 bg-rose-100 text-rose-600 rounded-full hover:bg-rose-200 text-xs"
                        title="Remove from comparison"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-28 h-28 object-cover rounded-xl mx-auto mb-2 border border-[#E2E0DB] dark:border-[#292929]"
                      />
                      <h4 className="font-bold text-xs text-[#111111] dark:text-white line-clamp-2">{item.title}</h4>
                      <p className="text-[#111111] dark:text-[#C8A96B] font-black text-sm mt-1">₹{item.price.toLocaleString()}</p>
                      <button
                        onClick={() => addToCart(item)}
                        className="mt-2 btn-emerald-primary px-3 py-1.5 text-xs font-bold"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E0DB] dark:divide-[#292929] text-xs text-[#555555] dark:text-[#858585]">
              <tr>
                <td className="p-3 font-semibold text-[#858585]">Brand</td>
                {compareItems.map((item) => (
                  <td key={item.id} className="p-3 text-center font-bold text-[#111111] dark:text-white">{item.brand}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#858585]">AC Type</td>
                {compareItems.map((item) => (
                  <td key={item.id} className="p-3 text-center text-[#111111] dark:text-white">{item.ac_type} ({item.is_inverter ? 'Inverter' : 'Fixed Speed'})</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#858585]">Tonnage</td>
                {compareItems.map((item) => (
                  <td key={item.id} className="p-3 text-center font-semibold text-[#111111] dark:text-white">{item.tonnage} Ton</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#858585]">Energy Rating</td>
                {compareItems.map((item) => (
                  <td key={item.id} className="p-3 text-center">
                    <span className="px-2.5 py-1 bg-[#FAF7F0] dark:bg-[#111111] text-[#111111] dark:text-[#C8A96B] font-bold rounded-full border border-[#C8A96B]/40">
                      {'★'.repeat(item.star_rating)} ({item.star_rating} Star)
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#858585]">ISEER Rating</td>
                {compareItems.map((item) => (
                  <td key={item.id} className="p-3 text-center font-bold text-[#C8A96B]">{item.iseer_rating}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#858585]">Annual Power Cons.</td>
                {compareItems.map((item) => (
                  <td key={item.id} className="p-3 text-center text-[#111111] dark:text-white">{item.annual_power_kwh} kWh / year</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#858585]">Noise Level</td>
                {compareItems.map((item) => (
                  <td key={item.id} className="p-3 text-center text-[#111111] dark:text-white">{item.noise_level_db} dB (Ultra Quiet)</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#858585]">Key Features</td>
                {compareItems.map((item) => (
                  <td key={item.id} className="p-3 text-center leading-relaxed text-[11px] text-[#555555] dark:text-[#858585]">
                    {item.features || '100% Copper, PM2.5 Filter'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

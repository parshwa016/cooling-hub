import React from 'react';
import { X, Check, Scale, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCompareModal({ isOpen, onClose }) {
  const { compareItems, toggleCompare, addToCart } = useCart();

  if (!isOpen || compareItems.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
              Product Comparison ({compareItems.length} ACs selected)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Matrix Table */}
        <div className="flex-1 overflow-x-auto p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="p-3 text-xs font-bold text-slate-400 uppercase w-48">Feature</th>
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
                        className="w-28 h-28 object-cover rounded-xl mx-auto mb-2 border border-slate-200 dark:border-slate-700"
                      />
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 line-clamp-2">{item.title}</h4>
                      <p className="text-cyan-600 dark:text-cyan-400 font-extrabold text-sm mt-1">₹{item.price.toLocaleString()}</p>
                      <button
                        onClick={() => addToCart(item)}
                        className="mt-2 inline-flex items-center space-x-1 px-3 py-1.5 bg-cool-600 text-white rounded-lg text-xs font-semibold hover:bg-cool-700 transition"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <tr>
                <td className="p-3 font-semibold text-slate-400">Brand</td>
                {compareItems.map((item) => (
                  <td key={item.id} className="p-3 text-center font-bold text-slate-800 dark:text-slate-200">{item.brand}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-400">AC Type</td>
                {compareItems.map((item) => (
                  <td key={item.id} className="p-3 text-center">{item.ac_type} ({item.is_inverter ? 'Inverter' : 'Fixed Speed'})</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-400">Tonnage</td>
                {compareItems.map((item) => (
                  <td key={item.id} className="p-3 text-center font-semibold">{item.tonnage} Ton</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-400">Energy Rating</td>
                {compareItems.map((item) => (
                  <td key={item.id} className="p-3 text-center">
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-full">
                      {'★'.repeat(item.star_rating)} ({item.star_rating} Star)
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-400">ISEER Rating</td>
                {compareItems.map((item) => (
                  <td key={item.id} className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400">{item.iseer_rating}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-400">Annual Power Cons.</td>
                {compareItems.map((item) => (
                  <td key={item.id} className="p-3 text-center">{item.annual_power_kwh} kWh / year</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-400">Noise Level</td>
                {compareItems.map((item) => (
                  <td key={item.id} className="p-3 text-center">{item.noise_level_db} dB (Ultra Quiet)</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-400">Key Features</td>
                {compareItems.map((item) => (
                  <td key={item.id} className="p-3 text-center leading-relaxed text-[11px] text-slate-500 dark:text-slate-400">
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

import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Check, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function CartDrawer({ isOpen, onClose, setActiveTab }) {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { currentUser } = useAuth();

  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  if (!isOpen) return null;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode) return;
    try {
      const res = await api.validateCoupon(couponCode, cartTotal);
      if (res.valid) {
        setCouponDiscount(res.discount_amount);
        setAppliedCoupon(res.code);
        setCouponMsg(`Coupon ${res.code} applied! Saved ₹${res.discount_amount}`);
      } else {
        setCouponMsg(res.message);
      }
    } catch (err) {
      setCouponMsg("Failed to validate coupon");
    }
  };

  const finalTotal = Math.max(0, cartTotal - couponDiscount);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsPlacingOrder(true);

    try {
      const items = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price
      }));

      const orderData = {
        user_id: currentUser.id,
        items,
        total_amount: finalTotal,
        discount_amount: couponDiscount,
        coupon_used: appliedCoupon || null,
        shipping_address: currentUser.address || "Flat 402, Green Valley Apartments, Connaught Place, New Delhi",
        payment_method: "Online Payment (UPI/Card)"
      };

      const res = await api.checkout(orderData);
      clearCart();
      setIsPlacingOrder(false);
      onClose();
      setActiveTab('dashboard');
      alert(`🎉 Order Confirmed successfully! Order ID: ${res.order_number}`);
    } catch (e) {
      setIsPlacingOrder(false);
      alert("Error placing order: " + e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
          
          {/* Header */}
          <div className="p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                Your AC Shopping Cart ({cart.length})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-slate-500 font-semibold text-sm">Your cart is currently empty.</p>
                <button
                  onClick={() => { onClose(); setActiveTab('shop'); }}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold hover:bg-cyan-700 transition"
                >
                  Explore AC Catalog
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">{item.title}</h4>
                    <p className="text-cyan-600 dark:text-cyan-400 font-bold text-xs mt-0.5">₹{item.price.toLocaleString()}</p>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 font-bold text-xs flex items-center justify-center text-slate-700 dark:text-slate-200"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 font-bold text-xs flex items-center justify-center text-slate-700 dark:text-slate-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Checkout Footer */}
          {cart.length > 0 && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-3">
              
              {/* Promo code form */}
              <form onSubmit={handleApplyCoupon} className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter Coupon (e.g. COOL2026)"
                    className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-xl text-xs hover:bg-slate-700 transition"
                >
                  Apply
                </button>
              </form>

              {couponMsg && (
                <p className={`text-[11px] font-semibold ${appliedCoupon ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                  {couponMsg}
                </p>
              )}

              {/* Price summary */}
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">₹{cartTotal.toLocaleString()}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Coupon Discount ({appliedCoupon}):</span>
                    <span>-₹{couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Standard Installation & Delivery:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Total Amount:</span>
                  <span className="text-cyan-600 dark:text-cyan-400">₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isPlacingOrder}
                className="w-full py-3 bg-gradient-to-r from-cool-600 via-cyan-500 to-cool-700 text-white rounded-xl font-bold text-sm shadow-lg hover:opacity-95 transition flex items-center justify-center space-x-2"
              >
                <span>{isPlacingOrder ? 'Processing Order...' : 'Proceed to Checkout (UPI/Card)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center space-x-1 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>100% Secure Payment • 1-Year Comprehensive Warranty Included</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

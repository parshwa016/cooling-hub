import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Check, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { usePopup } from '../context/PopupContext';
import { api } from '../services/api';

export default function CartDrawer({ isOpen, onClose, setActiveTab }) {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { currentUser, openAuthModal } = useAuth();
  const { showModal, showToast } = usePopup();

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

    if (!currentUser) {
      openAuthModal('prompt');
      return;
    }

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
      await showModal({
        type: 'success',
        title: 'Order Confirmed!',
        badge: 'Order Placed',
        message: 'Your air conditioner purchase has been confirmed. Our logistics team will process dispatch and installation scheduling immediately.',
        details: {
          'Order Number': res.order_number,
          'Total Amount Paid': `₹${finalTotal.toLocaleString()}`,
          'Delivery Address': orderData.shipping_address,
          'Payment Status': 'Paid Online (Verified)'
        },
        confirmText: 'View in My Orders'
      });
      setActiveTab('dashboard');
    } catch (e) {
      setIsPlacingOrder(false);
      showToast({
        type: 'error',
        title: 'Checkout Failed',
        message: e.message
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#1A1A1A] shadow-2xl flex flex-col border-l border-[#E2E0DB] dark:border-[#2E2E2E]">
          
          {/* Header */}
          <div className="p-4 bg-[#F7F6F2] dark:bg-[#252525] border-b border-[#E2E0DB] dark:border-[#2E2E2E] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#C8A96B]" />
              <h3 className="font-bold text-[#111111] dark:text-white text-sm">
                Your AC Shopping Cart ({cart.length})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[#FAF7F0] dark:hover:bg-[#111111] text-[#555555] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#F7F6F2]/50 dark:bg-[#111111]">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-12 h-12 text-[#E2E0DB] dark:border-[#2E2E2E] mx-auto" />
                <p className="text-[#555555] font-semibold text-sm">Your cart is currently empty.</p>
                <button
                  onClick={() => { onClose(); setActiveTab('shop'); }}
                  className="btn-emerald-primary px-4 py-2 text-xs"
                >
                  Explore AC Catalog
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 bg-white dark:bg-[#252525] rounded-xl border border-[#E2E0DB] dark:border-[#2E2E2E] shadow-2xs">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0 bg-[#F7F6F2]"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-[#111111] dark:text-white truncate">{item.title}</h4>
                    <p className="text-[#111111] dark:text-[#C8A96B] font-bold text-xs mt-0.5">₹{item.price.toLocaleString()}</p>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded bg-[#F7F6F2] dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#2E2E2E] font-bold text-xs flex items-center justify-center text-[#111111] dark:text-[#F7F6F2] hover:bg-[#FAF7F0]"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold w-4 text-center text-[#111111] dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded bg-[#F7F6F2] dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#2E2E2E] font-bold text-xs flex items-center justify-center text-[#111111] dark:text-[#F7F6F2] hover:bg-[#FAF7F0]"
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
            <div className="p-4 bg-white dark:bg-[#1A1A1A] border-t border-[#E2E0DB] dark:border-[#2E2E2E] space-y-3">
              
              {/* Promo code form */}
              <form onSubmit={handleApplyCoupon} className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-[#555555] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter Coupon (e.g. COOL2026)"
                    className="w-full pl-9 pr-3 py-1.5 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#2E2E2E] rounded-xl text-xs uppercase text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C8A96B]"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-emerald-secondary px-3 py-1.5 text-xs"
                >
                  Apply
                </button>
              </form>

              {couponMsg && (
                <p className={`text-[11px] font-semibold ${appliedCoupon ? 'text-[#111111] dark:text-[#C8A96B]' : 'text-rose-500'}`}>
                  {couponMsg}
                </p>
              )}

              {/* Price summary */}
              <div className="space-y-1.5 text-xs text-[#555555] dark:text-[#858585] pt-2 border-t border-[#E2E0DB] dark:border-[#2E2E2E]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-[#111111] dark:text-white">₹{cartTotal.toLocaleString()}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-[#111111] dark:text-[#C8A96B] font-bold">
                    <span>Coupon Discount ({appliedCoupon}):</span>
                    <span>-₹{couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Standard Installation & Delivery:</span>
                  <span className="text-[#C8A96B] font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-black text-[#111111] dark:text-white pt-2 border-t border-[#E2E0DB] dark:border-[#2E2E2E]">
                  <span>Total Amount:</span>
                  <span className="text-[#111111] dark:text-[#C8A96B]">₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isPlacingOrder}
                className="btn-emerald-primary w-full py-3 text-sm flex items-center justify-center space-x-2"
              >
                <span>{isPlacingOrder ? 'Processing Order...' : 'Proceed to Checkout (UPI/Card)'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <div className="flex items-center justify-center space-x-1 text-[10px] text-[#555555] dark:text-[#858585]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C8A96B]" />
                <span>100% Secure Payment • 1-Year Comprehensive Warranty Included</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

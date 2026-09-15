import React from 'react';
import { X, Printer, Snowflake, Download } from 'lucide-react';

export default function InvoiceModal({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#1A1A1A] border border-[#E2E0DB] dark:border-[#292929] rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-[#F7F6F2] dark:bg-[#252525] border-b border-[#E2E0DB] dark:border-[#292929] flex items-center justify-between">
          <h3 className="font-bold text-[#111111] dark:text-white text-sm">
            Tax Invoice — Order #{order.order_number}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="btn-emerald-primary px-3 py-1.5 text-xs font-bold"
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[#FAF7F0] dark:hover:bg-[#111111] text-[#858585] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-[#111111] dark:text-[#E2E0DB] text-xs">
          
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-6 border-b border-[#E2E0DB] dark:border-[#292929]">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-[#111111] border border-[#C8A96B]/30 flex items-center justify-center text-white shadow-xs">
                <Snowflake className="w-5 h-5 text-[#C8A96B]" />
              </div>
              <div>
                <h2 className="text-base font-black text-[#111111] dark:text-white tracking-tight">COOLING HUB PVT LTD</h2>
                <p className="text-[10px] text-[#858585]">GSTIN: 07AAACC4912K1Z9 | Reg HVAC Vendor</p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 bg-[#FAF7F0] dark:bg-[#111111] text-[#111111] dark:text-[#C8A96B] border border-[#C8A96B]/40 rounded-full font-bold text-[10px]">
                {order.payment_status?.toUpperCase() || 'PAID'}
              </span>
              <p className="text-[11px] text-[#858585] mt-1">Date: {new Date(order.created_at || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Billed To Details */}
          <div className="grid grid-cols-2 gap-4 bg-[#F7F6F2] dark:bg-[#252525] p-4 rounded-2xl border border-[#E2E0DB] dark:border-[#292929]">
            <div>
              <span className="font-bold uppercase tracking-wider text-[10px] text-[#858585]">Billed To Customer:</span>
              <p className="font-bold text-sm text-[#111111] dark:text-white mt-1">John Doe</p>
              <p className="text-[#858585] mt-0.5">{order.shipping_address}</p>
            </div>
            <div>
              <span className="font-bold uppercase tracking-wider text-[10px] text-[#858585]">Order Metadata:</span>
              <p className="mt-1"><strong className="text-[#111111] dark:text-white">Order ID:</strong> {order.order_number}</p>
              <p><strong className="text-[#111111] dark:text-white">Payment Method:</strong> {order.payment_method}</p>
              <p><strong className="text-[#111111] dark:text-white">Promo Applied:</strong> {order.coupon_used || 'None'}</p>
            </div>
          </div>

          {/* Summary Table */}
          <div className="border border-[#E2E0DB] dark:border-[#292929] rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F7F6F2] dark:bg-[#252525] text-[#111111] dark:text-white font-bold text-[11px]">
                <tr>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E0DB] dark:divide-[#292929] text-[#111111] dark:text-[#E2E0DB]">
                <tr>
                  <td className="p-3 font-semibold">AC Order & Standard Installation Kit</td>
                  <td className="p-3 text-center">1</td>
                  <td className="p-3 text-right font-semibold">₹{(order.total_amount + (order.discount_amount || 0)).toLocaleString()}</td>
                </tr>
                {order.discount_amount > 0 && (
                  <tr className="text-[#C8A96B] font-bold">
                    <td className="p-3">Discount Coupon ({order.coupon_used})</td>
                    <td className="p-3 text-center">-</td>
                    <td className="p-3 text-right">-₹{order.discount_amount.toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-[#F7F6F2] dark:bg-[#252525] font-bold">
                <tr>
                  <td colSpan="2" className="p-3 text-right text-[#858585]">Grand Total Paid:</td>
                  <td className="p-3 text-right text-[#111111] dark:text-[#C8A96B] text-base font-black">₹{order.total_amount.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="text-center text-[10px] text-[#858585] border-t border-[#E2E0DB] dark:border-[#292929] pt-4">
            Thank you for choosing Cooling Hub! Includes 1-Year Comprehensive Warranty + 10-Year Compressor Warranty.
          </div>

        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { X, Printer, Snowflake, Download } from 'lucide-react';

export default function InvoiceModal({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
            Tax Invoice — Order #{order.order_number}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-cyan-600 text-white rounded-lg text-xs font-semibold hover:bg-cyan-700 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200 text-xs">
          
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
                <Snowflake className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black tracking-tight">COOLING HUB PVT LTD</h2>
                <p className="text-[10px] text-slate-500">GSTIN: 07AAACC4912K1Z9 | Reg HVAC Vendor</p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                {order.payment_status?.toUpperCase() || 'PAID'}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Date: {new Date(order.created_at || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Billed To Details */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
            <div>
              <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Billed To Customer:</span>
              <p className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">John Doe</p>
              <p className="text-slate-500 mt-0.5">{order.shipping_address}</p>
            </div>
            <div>
              <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Order Metadata:</span>
              <p className="mt-1"><strong className="text-slate-700 dark:text-slate-300">Order ID:</strong> {order.order_number}</p>
              <p><strong className="text-slate-700 dark:text-slate-300">Payment Method:</strong> {order.payment_method}</p>
              <p><strong className="text-slate-700 dark:text-slate-300">Promo Applied:</strong> {order.coupon_used || 'None'}</p>
            </div>
          </div>

          {/* Summary Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[11px]">
                <tr>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="p-3 font-semibold">AC Order & Standard Installation Kit</td>
                  <td className="p-3 text-center">1</td>
                  <td className="p-3 text-right font-semibold">₹{(order.total_amount + (order.discount_amount || 0)).toLocaleString()}</td>
                </tr>
                {order.discount_amount > 0 && (
                  <tr className="text-emerald-600 dark:text-emerald-400">
                    <td className="p-3">Discount Coupon ({order.coupon_used})</td>
                    <td className="p-3 text-center">-</td>
                    <td className="p-3 text-right font-bold">-₹{order.discount_amount.toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-50 dark:bg-slate-800/80 font-bold">
                <tr>
                  <td colSpan="2" className="p-3 text-right text-slate-500">Grand Total Paid:</td>
                  <td className="p-3 text-right text-cyan-600 dark:text-cyan-400 text-base">₹{order.total_amount.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="text-center text-[10px] text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-4">
            Thank you for choosing Cooling Hub! Includes 1-Year Comprehensive Warranty + 10-Year Compressor Warranty.
          </div>

        </div>
      </div>
    </div>
  );
}

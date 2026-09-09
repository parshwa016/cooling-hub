import React, { useState, useEffect } from 'react';
import { 
  Package, Calendar, Wrench, AlertTriangle, ShieldCheck, 
  FileText, Clock, Printer, User, RefreshCw, CheckCircle2 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import InvoiceModal from '../components/InvoiceModal';

export default function CustomerDashboard({ setActiveTab }) {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [amcSubs, setAmcSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected order for invoice view
  const [selectedOrderInvoice, setSelectedOrderInvoice] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getUserOrders(currentUser.id),
      api.getUserBookings(currentUser.id),
      api.getUserComplaints(currentUser.id),
      api.getUserAMC(currentUser.id)
    ]).then(([ords, bks, cmps, amcs]) => {
      setOrders(ords);
      setBookings(bks);
      setComplaints(cmps);
      setAmcSubs(amcs);
    }).catch(console.error).finally(() => setLoading(false));
  }, [currentUser.id]);

  return (
    <div className="space-y-10 pb-16">
      
      {/* User Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cool-600 to-cyan-500 text-white flex items-center justify-center font-black text-xl shadow-lg">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Customer Portal</span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{currentUser.name}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser.email} • {currentUser.phone}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('shop')}
            className="px-4 py-2 bg-cool-600 text-white rounded-xl text-xs font-bold hover:bg-cool-700 transition"
          >
            + Buy New AC
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
          >
            + Book Service
          </button>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Orders & Invoices */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Orders Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <Package className="w-5 h-5 text-cyan-600" />
              <span>My AC Orders & Invoices ({orders.length})</span>
            </h2>

            {loading ? (
              <div className="py-8 text-center text-slate-400 text-xs">Loading orders...</div>
            ) : orders.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No AC purchase orders found.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-sm text-cyan-600 dark:text-cyan-400">{ord.order_number}</span>
                        <p className="text-[11px] text-slate-400">{new Date(ord.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full font-bold text-[10px]">
                        {ord.order_status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Total Paid</span>
                        <span className="font-black text-slate-900 dark:text-slate-100">₹{ord.total_amount.toLocaleString()}</span>
                      </div>
                      <button
                        onClick={() => setSelectedOrderInvoice(ord)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl text-xs hover:opacity-90 transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>View Invoice</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AMC Subscriptions */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Active AMC Contracts ({amcSubs.length})</span>
            </h2>

            {amcSubs.length === 0 ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs text-slate-500 space-y-2">
                <p>You don't have an active Annual Maintenance Contract (AMC).</p>
                <button
                  onClick={() => setActiveTab('amc')}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-[11px]"
                >
                  Explore AMC Protection Plans
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {amcSubs.map((sub) => (
                  <div key={sub.id} className="p-4 bg-gradient-to-r from-emerald-950 to-slate-900 text-white rounded-2xl border border-emerald-700/50 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-emerald-300">{sub.ac_brand_model}</h4>
                      <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 rounded-full font-extrabold text-[10px]">
                        {sub.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-emerald-100">
                      <p><strong>Total Covered Visits:</strong> {sub.visits_total}</p>
                      <p><strong>Completed Visits:</strong> {sub.visits_completed}</p>
                      <p><strong>Visits Remaining:</strong> {sub.visits_total - sub.visits_completed}</p>
                      <p><strong>Expires On:</strong> {new Date(sub.end_date).toLocaleDateString()}</p>
                    </div>

                    <div className="pt-2 border-t border-emerald-800 flex justify-end">
                      <button
                        onClick={() => setActiveTab('services')}
                        className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 transition"
                      >
                        Schedule Free AMC Service
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Bookings & Complaints */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Service Bookings */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <Wrench className="w-5 h-5 text-amber-500" />
              <span>Service Appointments ({bookings.length})</span>
            </h2>

            {bookings.length === 0 ? (
              <p className="text-xs text-slate-400">No scheduled service appointments.</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-100">{b.booking_number}</span>
                      <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold rounded-md text-[10px]">
                        {b.status}
                      </span>
                    </div>
                    <p className="text-slate-500">{b.service_date} ({b.service_time_slot})</p>
                    <p className="font-semibold text-cyan-600 dark:text-cyan-400">₹{b.price}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Complaints */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <span>Complaint Tickets ({complaints.length})</span>
            </h2>

            {complaints.length === 0 ? (
              <p className="text-xs text-slate-400">No complaints logged.</p>
            ) : (
              <div className="space-y-3">
                {complaints.map((c) => (
                  <div key={c.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-600 dark:text-rose-400">{c.ticket_id}</span>
                      <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold rounded-md text-[10px]">
                        {c.status}
                      </span>
                    </div>
                    <p className="text-slate-500 font-semibold">{c.ac_brand_model} • {c.issue_category}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      <InvoiceModal
        order={selectedOrderInvoice}
        isOpen={!!selectedOrderInvoice}
        onClose={() => setSelectedOrderInvoice(null)}
      />

    </div>
  );
}

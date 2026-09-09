import React, { useState, useEffect } from 'react';
import { 
  BarChart2, Users, Wrench, ShieldCheck, DollarSign, 
  Package, AlertTriangle, RefreshCw, CheckCircle2, Award, UserCheck 
} from 'lucide-react';
import { api } from '../services/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  const [assigningComplaintId, setAssigningComplaintId] = useState(null);
  const [selectedTechId, setSelectedTechId] = useState(2);

  const fetchAdminData = () => {
    setLoading(true);
    Promise.all([
      api.getAdminAnalytics(),
      api.getAdminComplaints(),
      api.getAdminBookings(),
      api.getUsers('technician')
    ]).then(([ana, cmps, bks, techs]) => {
      setAnalytics(ana);
      setComplaints(cmps);
      setBookings(bks);
      setTechnicians(techs);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAssignSubmit = async (complaintId) => {
    try {
      await api.assignTechnicianToComplaint(complaintId, selectedTechId);
      setAssigningComplaintId(null);
      fetchAdminData();
      alert("✅ Technician assigned to complaint!");
    } catch (e) {
      alert("Error assigning technician: " + e.message);
    }
  };

  const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-10 pb-16">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl space-y-3">
        <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full">EXECUTIVE CONTROL CENTER</span>
        <h1 className="text-3xl sm:text-4xl font-black">🧑‍💼 Admin Analytics & Management</h1>
        <p className="text-xs sm:text-sm text-purple-100 max-w-2xl">
          Real-time metrics on AC sales revenue, service bookings, AMC contracts, complaint resolution rates, and technician performance.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400 space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-purple-500" />
          <span>Loading admin analytics engine...</span>
        </div>
      ) : analytics && (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Sales Revenue</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹{analytics.kpis.total_sales_revenue.toLocaleString()}</h3>
              <p className="text-[10px] text-cyan-600 font-bold mt-1">🛒 {analytics.kpis.total_orders} Orders</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Service Revenue</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹{analytics.kpis.total_service_revenue.toLocaleString()}</h3>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">🔧 {analytics.kpis.total_bookings} Service Bookings</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">AMC Revenue</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹{analytics.kpis.total_amc_revenue.toLocaleString()}</h3>
              <p className="text-[10px] text-amber-500 font-bold mt-1">📅 {analytics.kpis.active_amc_subscriptions} Active AMCs</p>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-5 rounded-2xl shadow-lg">
              <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">Grand Total Revenue</span>
              <h3 className="text-2xl font-black mt-1">₹{analytics.kpis.grand_total_revenue.toLocaleString()}</h3>
              <p className="text-[10px] font-bold opacity-90 mt-1">📢 {analytics.kpis.total_complaints} Total Complaints</p>
            </div>
          </div>

          {/* Revenue Trend Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-900 dark:text-white">Monthly Revenue Trends (Sales vs Services vs AMC)</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.monthly_revenue_trend}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
                  <Area type="monotone" dataKey="sales" stackId="1" stroke="#0284c7" fill="#0284c7" />
                  <Area type="monotone" dataKey="service" stackId="1" stroke="#10b981" fill="#10b981" />
                  <Area type="monotone" dataKey="amc" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Technician Leaderboard */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Technician Field Performance Leaderboard</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {analytics.tech_performance.map((tech) => (
                <div key={tech.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                      {tech.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{tech.name}</h4>
                      <p className="text-[11px] text-slate-400">{tech.completed_jobs} Jobs Completed</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-extrabold text-xs rounded-full">
                    ★ {tech.rating}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Complaints Dispatch Table */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <span>Complaint Tickets & Technician Dispatch</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                  <tr>
                    <th className="p-3">Ticket ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">AC & Issue</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Assigned Tech</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {complaints.map((c) => (
                    <tr key={c.id}>
                      <td className="p-3 font-bold text-cyan-600">{c.ticket_id}</td>
                      <td className="p-3">{c.customer_name}</td>
                      <td className="p-3">{c.ac_details} ({c.issue_category})</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          c.priority === 'Emergency' ? 'bg-rose-500 text-white' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="p-3 font-bold">{c.status}</td>
                      <td className="p-3 text-slate-500">{c.technician_name}</td>
                      <td className="p-3 text-right">
                        {assigningComplaintId === c.id ? (
                          <div className="flex items-center space-x-1 justify-end">
                            <select
                              value={selectedTechId}
                              onChange={(e) => setSelectedTechId(Number(e.target.value))}
                              className="p-1 text-xs border rounded bg-white dark:bg-slate-800"
                            >
                              {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <button
                              onClick={() => handleAssignSubmit(c.id)}
                              className="px-2 py-1 bg-emerald-600 text-white font-bold rounded text-[10px]"
                            >
                              Confirm
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAssigningComplaintId(c.id)}
                            className="px-3 py-1 bg-purple-600 text-white rounded font-bold text-[10px]"
                          >
                            Assign Tech
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
}

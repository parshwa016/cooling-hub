import React, { useState, useEffect } from 'react';
import { Zap, TrendingDown, DollarSign, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function EnergyCalcPage({ setActiveTab }) {
  const [tonnage, setTonnage] = useState(1.5);
  const [starRating, setStarRating] = useState(5);
  const [isInverter, setIsInverter] = useState(true);
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [ratePerKwh, setRatePerKwh] = useState(8.5);
  const [monthsPerYear, setMonthsPerYear] = useState(8);

  const [calcResult, setCalcResult] = useState(null);

  const runCalculation = async () => {
    try {
      const res = await api.calculateEnergy({
        tonnage: parseFloat(tonnage),
        star_rating: parseInt(starRating),
        is_inverter: isInverter,
        usage_hours_per_day: parseFloat(hoursPerDay),
        electricity_rate: parseFloat(ratePerKwh),
        months_per_year: parseInt(monthsPerYear)
      });
      setCalcResult(res);
    } catch (e) {
      console.error("Calculation error", e);
    }
  };

  useEffect(() => {
    runCalculation();
  }, [tonnage, starRating, isInverter, hoursPerDay, ratePerKwh, monthsPerYear]);

  const chartData = calcResult ? [
    {
      name: 'Annual Cost (₹)',
      'Your AC': calcResult.yearly_cost,
      'Old 3-Star Non-Inverter': calcResult.comparison_baseline_cost
    }
  ] : [];

  return (
    <div className="space-y-12 pb-16">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-slate-900 text-slate-950 dark:text-white p-8 sm:p-12 rounded-3xl shadow-xl space-y-3">
        <span className="px-3 py-1 bg-slate-950 text-amber-300 font-bold text-xs rounded-full">REAL-TIME ENERGY SIMULATOR</span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">⚡ Electricity & ROI Savings Calculator</h1>
        <p className="text-xs sm:text-sm text-slate-800 dark:text-amber-100 max-w-2xl">
          Discover how much money and electricity units (kWh) you save every month by investing in a 5-Star Inverter AC vs a traditional non-inverter unit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Inputs Controls */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="font-black text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            Adjust Usage Parameters
          </h2>

          {/* Tonnage */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>AC Capacity (Tonnage)</span>
              <span className="text-cyan-600">{tonnage} Ton</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1.0, 1.5, 2.0].map((t) => (
                <button
                  key={t}
                  onClick={() => setTonnage(t)}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    tonnage === t ? 'bg-cool-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {t} Ton
                </button>
              ))}
            </div>
          </div>

          {/* Technology */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>AC Compressor Tech</span>
              <span className="text-cyan-600">{isInverter ? 'Inverter (Variable)' : 'Non-Inverter (Fixed)'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsInverter(true)}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  isInverter ? 'bg-emerald-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Inverter Tech
              </button>
              <button
                onClick={() => setIsInverter(false)}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  !isInverter ? 'bg-rose-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Non-Inverter
              </button>
            </div>
          </div>

          {/* Star Rating */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Energy Star Rating</span>
              <span className="text-amber-500">{'★'.repeat(starRating)} ({starRating} Star)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setStarRating(star)}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    starRating === star ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {star} Star
                </button>
              ))}
            </div>
          </div>

          {/* Usage Hours Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              <span>Daily Usage Hours</span>
              <span className="text-cyan-600 font-extrabold">{hoursPerDay} Hours / Day</span>
            </div>
            <input
              type="range"
              min={2}
              max={24}
              step={1}
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              className="w-full accent-cyan-600 cursor-pointer"
            />
          </div>

          {/* Tariff Rate Input */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              <span>Electricity Tariff Rate (₹ / Unit)</span>
              <span className="text-cyan-600 font-extrabold">₹{ratePerKwh} / kWh</span>
            </div>
            <input
              type="range"
              min={5.0}
              max={15.0}
              step={0.5}
              value={ratePerKwh}
              onChange={(e) => setRatePerKwh(Number(e.target.value))}
              className="w-full accent-cyan-600 cursor-pointer"
            />
          </div>

        </div>

        {/* Right Output Results & Graphs */}
        <div className="lg:col-span-7 space-y-6">
          
          {calcResult && (
            <>
              {/* Highlight Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Yearly Bill</span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹{calcResult.yearly_cost.toLocaleString()}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">({calcResult.yearly_kwh} kWh units)</p>
                </div>

                <div className="bg-emerald-500 text-slate-950 p-5 rounded-2xl shadow-lg text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider">Yearly Money Saved</span>
                  <h3 className="text-2xl font-black mt-1">₹{calcResult.money_saved_yearly.toLocaleString()}</h3>
                  <p className="text-[10px] font-bold mt-0.5">({calcResult.savings_percentage}% Bill Reduction)</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Payback Period</span>
                  <h3 className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">{calcResult.breakeven_months} Mos</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Full ROI recovery</p>
                </div>
              </div>

              {/* Comparison Bar Chart */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                  Annual Electricity Cost Comparison (₹)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="Your AC" fill="#0284c7" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="Old 3-Star Non-Inverter" fill="#f43f5e" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Call to action */}
              <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm">Ready to upgrade to an energy-saving AC?</h4>
                  <p className="text-xs text-slate-400">Explore 5-Star Inverter ACs with free installation.</p>
                </div>
                <button
                  onClick={() => setActiveTab('shop')}
                  className="px-5 py-2.5 bg-cyan-600 font-bold rounded-xl text-xs hover:bg-cyan-500 transition flex items-center space-x-1"
                >
                  <span>Shop 5-Star ACs</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

        </div>

      </div>

    </div>
  );
}

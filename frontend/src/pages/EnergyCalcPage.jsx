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
      <div className="bg-[#111111] text-white p-5 sm:p-6 rounded-2xl shadow-sm space-y-2.5">
        <span className="px-2.5 py-0.5 bg-[#C8A96B] text-[#111111] font-extrabold text-[11px] rounded-full uppercase tracking-wider">REAL-TIME ENERGY SIMULATOR</span>
        <h1 className="text-xl sm:text-2xl font-black text-white">⚡ Electricity & ROI Savings Calculator</h1>
        <p className="text-xs text-[#E2E0DB] max-w-2xl font-normal leading-relaxed">
          Discover how much money and electricity units (kWh) you save every month by investing in a 5-Star Inverter AC vs a traditional non-inverter unit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Inputs Controls */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1A1A1A] p-6 sm:p-8 rounded-3xl border border-[#E2E0DB] dark:border-[#2E2E2E] shadow-sm space-y-6">
          <h2 className="font-black text-base text-[#111111] dark:text-white pb-3 border-b border-[#E2E0DB] dark:border-[#2E2E2E]">
            Adjust Usage Parameters
          </h2>

          {/* Tonnage */}
          <div>
            <div className="flex justify-between text-xs font-bold text-[#111111] dark:text-white mb-1.5">
              <span>AC Capacity (Tonnage)</span>
              <span className="text-[#C8A96B] font-black">{tonnage} Ton</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1.0, 1.5, 2.0].map((t) => (
                <button
                  key={t}
                  onClick={() => setTonnage(t)}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    tonnage === t 
                      ? 'bg-[#111111] text-white shadow-sm' 
                      : 'bg-[#F7F6F2] dark:bg-[#252525] text-[#555555] dark:text-[#858585] border border-[#E2E0DB] dark:border-[#2E2E2E] hover:bg-[#FAF7F0]'
                  }`}
                >
                  {t} Ton
                </button>
              ))}
            </div>
          </div>

          {/* Technology */}
          <div>
            <div className="flex justify-between text-xs font-bold text-[#111111] dark:text-white mb-1.5">
              <span>AC Compressor Tech</span>
              <span className="text-[#C8A96B] font-black">{isInverter ? 'Inverter (Variable)' : 'Non-Inverter (Fixed)'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsInverter(true)}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  isInverter 
                    ? 'bg-[#111111] text-white shadow-sm' 
                    : 'bg-[#F7F6F2] dark:bg-[#252525] text-[#555555] dark:text-[#858585] border border-[#E2E0DB] dark:border-[#2E2E2E] hover:bg-[#FAF7F0]'
                }`}
              >
                Inverter Tech
              </button>
              <button
                onClick={() => setIsInverter(false)}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  !isInverter 
                    ? 'bg-[#111111] text-white shadow-sm' 
                    : 'bg-[#F7F6F2] dark:bg-[#252525] text-[#555555] dark:text-[#858585] border border-[#E2E0DB] dark:border-[#2E2E2E] hover:bg-[#FAF7F0]'
                }`}
              >
                Non-Inverter
              </button>
            </div>
          </div>

          {/* Star Rating */}
          <div>
            <div className="flex justify-between text-xs font-bold text-[#111111] dark:text-white mb-1.5">
              <span>Energy Star Rating</span>
              <span className="text-amber-500 font-bold">{'★'.repeat(starRating)} ({starRating} Star)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setStarRating(star)}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    starRating === star 
                      ? 'bg-[#111111] text-white shadow-sm' 
                      : 'bg-[#F7F6F2] dark:bg-[#252525] text-[#555555] dark:text-[#858585] border border-[#E2E0DB] dark:border-[#2E2E2E] hover:bg-[#FAF7F0]'
                  }`}
                >
                  {star} Star
                </button>
              ))}
            </div>
          </div>

          {/* Usage Hours Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-[#111111] dark:text-white mb-1">
              <span>Daily Usage Hours</span>
              <span className="text-[#C8A96B] font-black">{hoursPerDay} Hours / Day</span>
            </div>
            <input
              type="range"
              min={2}
              max={24}
              step={1}
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              className="w-full accent-[#C8A96B] cursor-pointer"
            />
          </div>

          {/* Tariff Rate Input */}
          <div>
            <div className="flex justify-between text-xs font-bold text-[#111111] dark:text-white mb-1">
              <span>Electricity Tariff Rate (₹ / Unit)</span>
              <span className="text-[#C8A96B] font-black">₹{ratePerKwh} / kWh</span>
            </div>
            <input
              type="range"
              min={5.0}
              max={15.0}
              step={0.5}
              value={ratePerKwh}
              onChange={(e) => setRatePerKwh(Number(e.target.value))}
              className="w-full accent-[#C8A96B] cursor-pointer"
            />
          </div>

        </div>

        {/* Right Output Results & Graphs */}
        <div className="lg:col-span-7 space-y-6">
          
          {calcResult && (
            <>
              {/* Highlight Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white dark:bg-[#1A1A1A] p-5 sm:p-6 rounded-2xl border border-[#E2E0DB] dark:border-[#2E2E2E] shadow-sm text-center">
                  <span className="text-[11px] font-bold text-[#555555] dark:text-[#858585] uppercase">Yearly Bill</span>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#111111] dark:text-white mt-1">₹{calcResult.yearly_cost.toLocaleString()}</h3>
                  <p className="text-xs text-[#555555] dark:text-[#858585] mt-1">({calcResult.yearly_kwh} kWh units)</p>
                </div>

                <div className="bg-[#111111] text-white p-5 sm:p-6 rounded-2xl shadow-md border border-[#C8A96B]/30 text-center">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#C8A96B]">Yearly Money Saved</span>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#C8A96B] mt-1">₹{calcResult.money_saved_yearly.toLocaleString()}</h3>
                  <p className="text-xs text-[#858585] font-semibold mt-1">({calcResult.savings_percentage}% Bill Reduction)</p>
                </div>

                <div className="bg-white dark:bg-[#1A1A1A] p-5 sm:p-6 rounded-2xl border border-[#E2E0DB] dark:border-[#2E2E2E] shadow-sm text-center col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-bold text-[#555555] dark:text-[#858585] uppercase">Payback Period</span>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#111111] dark:text-[#C8A96B] mt-1">{calcResult.breakeven_months} Mos</h3>
                  <p className="text-xs text-[#555555] dark:text-[#858585] mt-1">Full ROI recovery</p>
                </div>
              </div>

              {/* Comparison Bar Chart */}
              <div className="bg-white dark:bg-[#1A1A1A] p-6 sm:p-8 rounded-3xl border border-[#E2E0DB] dark:border-[#2E2E2E] shadow-sm space-y-4">
                <h3 className="font-bold text-base sm:text-lg text-[#111111] dark:text-white">
                  Annual Electricity Cost Comparison (₹)
                </h3>
                <div className="h-80 lg:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" stroke="#858585" />
                      <YAxis stroke="#858585" />
                      <Tooltip 
                        formatter={(value) => `₹${value.toLocaleString()}`}
                        contentStyle={{ backgroundColor: '#111111', borderColor: '#292929', borderRadius: '0.75rem', color: '#FFFFFF' }}
                      />
                      <Legend />
                      <Bar dataKey="Your AC" fill="#111111" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="Old 3-Star Non-Inverter" fill="#C8A96B" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Call to action */}
              <div className="bg-[#111111] text-white p-6 sm:p-8 rounded-3xl border border-[#C8A96B]/30 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-base sm:text-lg text-white">Ready to upgrade to an energy-saving AC?</h4>
                  <p className="text-xs sm:text-sm text-[#858585] mt-1">Explore 5-Star Inverter ACs with free installation.</p>
                </div>
                <button
                  onClick={() => setActiveTab('shop')}
                  className="btn-emerald-primary px-6 py-3 text-xs sm:text-sm font-bold flex items-center space-x-1 flex-shrink-0"
                >
                  <span>Shop 5-Star ACs</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </>
          )}

        </div>

      </div>

    </div>
  );
}

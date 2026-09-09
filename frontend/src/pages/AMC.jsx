import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Check, Star, Zap, Award, 
  HelpCircle, ArrowRight, RefreshCw, Calendar 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AMC({ setActiveTab }) {
  const { currentUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Eligibility checker state
  const [acBrand, setAcBrand] = useState('Daikin');
  const [acAge, setAcAge] = useState(2);
  const [isWorking, setIsWorking] = useState(true);
  const [eligibilityResult, setEligibilityResult] = useState(null);

  useEffect(() => {
    api.getAMCPlans()
      .then(setPlans)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleEligibilitySubmit = async (e) => {
    e.preventDefault();
    const res = await api.checkAMCEligibility({
      ac_brand: acBrand,
      ac_age_years: parseFloat(acAge),
      is_working: isWorking
    });
    setEligibilityResult(res);
  };

  const handleSubscribe = async (plan) => {
    try {
      const res = await api.subscribeAMC({
        user_id: currentUser.id,
        plan_id: plan.id,
        ac_brand_model: `${acBrand} 1.5T AC`,
        ac_tonnage: 1.5
      });
      setActiveTab('dashboard');
      alert(`🎉 AMC Subscription Activated! Plan: ${plan.name}`);
    } catch (e) {
      alert("Error activating AMC subscription: " + e.message);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl space-y-3">
        <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full">ANNUAL MAINTENANCE CONTRACT</span>
        <h1 className="text-3xl sm:text-4xl font-black">📅 AMC Protection Plans</h1>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl">
          Zero maintenance worries! Enjoy scheduled foam jet cleaning, free gas charging, 24/7 priority technician assistance, and discounted spare parts.
        </p>
      </div>

      {/* Plans Comparison */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white text-center">Choose Your Protection Tier</h2>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-cyan-500" />
            <span>Loading AMC packages...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((p) => {
              const isPopular = p.tier === 'standard';

              return (
                <div
                  key={p.id}
                  className={`bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border flex flex-col justify-between relative shadow-sm hover:shadow-2xl transition-all ${
                    isPopular
                      ? 'border-2 border-amber-500 shadow-amber-500/10 scale-105 z-10'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider shadow">
                      MOST POPULAR CHOICE
                    </span>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">{p.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{p.description}</p>
                    </div>

                    <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">₹{p.price_per_year.toLocaleString()}</span>
                      <span className="text-xs text-slate-400 font-semibold"> / year</span>
                    </div>

                    <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span><strong>{p.covered_visits} Routine Services</strong> per year</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span><strong>{p.discount_parts_percent}% Off</strong> on all Spare Parts</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className={`w-4 h-4 ${p.priority_service ? 'text-emerald-500' : 'text-slate-300'}`} />
                        <span className={p.priority_service ? 'font-bold' : 'text-slate-400'}>
                          Priority Technician Visit within 6 Hours
                        </span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className={`w-4 h-4 ${p.free_gas_charging ? 'text-emerald-500' : 'text-slate-300'}`} />
                        <span className={p.free_gas_charging ? 'font-extrabold text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                          FREE Gas Charging (R32 / R410A)
                        </span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleSubscribe(p)}
                    className={`mt-8 w-full py-3.5 rounded-2xl font-bold text-xs transition ${
                      isPopular
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg'
                        : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90'
                    }`}
                  >
                    Subscribe to {p.name}
                  </button>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AC Eligibility Checker Card */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
        <div className="max-w-xl space-y-2">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Instant Qualification</span>
          <h3 className="text-2xl font-black">Check Your AC AMC Eligibility</h3>
          <p className="text-xs text-slate-400">Test whether your current AC qualifies for instant online AMC enrollment.</p>
        </div>

        <form onSubmit={handleEligibilitySubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">AC Brand</label>
            <select
              value={acBrand}
              onChange={(e) => setAcBrand(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold"
            >
              <option>Daikin</option>
              <option>LG</option>
              <option>Voltas</option>
              <option>Blue Star</option>
              <option>Panasonic</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">AC Age (Years)</label>
            <input
              type="number"
              value={acAge}
              onChange={(e) => setAcAge(e.target.value)}
              min={0.5}
              max={15}
              step={0.5}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Is AC Currently Working?</label>
            <select
              value={isWorking ? 'yes' : 'no'}
              onChange={(e) => setIsWorking(e.target.value === 'yes')}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold"
            >
              <option value="yes">Yes, Working Fine</option>
              <option value="no">No, Has Issue</option>
            </select>
          </div>

          <div className="sm:col-span-3 pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-cyan-600 font-bold text-white rounded-xl hover:bg-cyan-500 transition text-xs"
            >
              Run Eligibility Check
            </button>
          </div>
        </form>

        {eligibilityResult && (
          <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
            eligibilityResult.eligible
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
              : 'bg-amber-500/20 border-amber-400 text-amber-200'
          }`}>
            <h4 className="font-bold text-sm mb-1">{eligibilityResult.message}</h4>
            {eligibilityResult.recommended_plan && (
              <p>Recommended Plan for best protection: <strong>{eligibilityResult.recommended_plan}</strong></p>
            )}
            {eligibilityResult.recommended_action && (
              <p>{eligibilityResult.recommended_action}</p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

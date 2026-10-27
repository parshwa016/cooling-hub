import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Check, Star, Zap, Award, 
  HelpCircle, ArrowRight, RefreshCw, Calendar 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { usePopup } from '../context/PopupContext';
import LuxurySelect from '../components/LuxurySelect';

export default function AMC({ setActiveTab }) {
  const { currentUser, openAuthModal } = useAuth();
  const { showModal, showToast } = usePopup();
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
    if (!currentUser) {
      openAuthModal('prompt');
      return;
    }

    try {
      const res = await api.subscribeAMC({
        user_id: currentUser.id,
        plan_id: plan.id,
        ac_brand_model: `${acBrand} 1.5T AC`,
        ac_tonnage: 1.5
      });
      await showModal({
        type: 'success',
        title: 'AMC Protection Activated!',
        badge: 'Contract Active',
        message: `Your ${plan.name} annual protection plan is now active for ${acBrand} AC. You are covered for scheduled foam wash maintenance, priority repair, and discounted spare parts.`,
        details: {
          'Plan Name': plan.name,
          'Coverage Period': '1 Full Year (365 Days)',
          'AC Unit': `${acBrand} 1.5T AC`,
          'Free Services Included': `${plan.free_services_count || 2} Foam Jet Services`,
          'Status': 'Active (Verified)'
        },
        confirmText: 'View in My Subscriptions'
      });
      setActiveTab('dashboard');
    } catch (e) {
      showToast({
        type: 'error',
        title: 'AMC Activation Failed',
        message: e.message
      });
    }
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* Header */}
      <div className="bg-[#111111] text-white p-5 sm:p-6 rounded-2xl border border-[#292929] shadow-sm space-y-2.5">
        <span className="px-2.5 py-0.5 bg-[#C8A96B] text-[#111111] text-[11px] font-black rounded-full uppercase tracking-wider">ANNUAL MAINTENANCE CONTRACT</span>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center space-x-2">
          <Calendar className="w-6 h-6 text-[#C8A96B]" />
          <span>AMC Protection Plans</span>
        </h1>
        <p className="text-xs text-[#858585] max-w-2xl font-normal leading-relaxed">
          Zero maintenance worries! Enjoy scheduled foam jet cleaning, free gas charging, 24/7 priority technician assistance, and discounted spare parts.
        </p>
      </div>

      {/* Plans Comparison */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-[#111111] dark:text-white text-center">Choose Your Protection Tier</h2>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#858585] space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#C8A96B]" />
            <span>Loading AMC packages...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 xl:gap-10">
            {plans.map((p) => {
              const isPopular = p.tier === 'standard';

              return (
                <div
                  key={p.id}
                  className={`bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 sm:p-8 xl:p-9 border flex flex-col justify-between relative shadow-sm hover:shadow-md hover:-translate-y-1 transition-all ${
                    isPopular
                      ? 'border-2 border-[#C8A96B] shadow-[0_12px_36px_rgba(200,169,107,0.18)] scale-105 z-10'
                      : 'border-[#E2E0DB] dark:border-[#292929]'
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#C8A96B] text-[#111111] font-extrabold text-xs rounded-full uppercase tracking-wider shadow-sm">
                      MOST POPULAR CHOICE
                    </span>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-[#111111] dark:text-white">{p.name}</h3>
                      <p className="text-sm text-[#858585] mt-1.5 leading-relaxed">{p.description}</p>
                    </div>

                    <div className="pb-6 border-b border-[#E2E0DB] dark:border-[#292929]">
                      <span className="text-3xl sm:text-4xl font-black text-[#111111] dark:text-[#C8A96B]">₹{p.price_per_year.toLocaleString()}</span>
                      <span className="text-sm text-[#858585] font-semibold"> / year</span>
                    </div>

                    <ul className="space-y-3.5 text-sm text-[#555555] dark:text-[#858585]">
                      <li className="flex items-center space-x-2.5">
                        <Check className="w-4 h-4 text-[#C8A96B] flex-shrink-0" />
                        <span><strong className="text-[#111111] dark:text-white">{p.covered_visits} Routine Services</strong> per year</span>
                      </li>
                      <li className="flex items-center space-x-2.5">
                        <Check className="w-4 h-4 text-[#C8A96B] flex-shrink-0" />
                        <span><strong className="text-[#111111] dark:text-white">{p.discount_parts_percent}% Off</strong> on all Spare Parts</span>
                      </li>
                      <li className="flex items-center space-x-2.5">
                        <Check className={`w-4 h-4 ${p.priority_service ? 'text-[#C8A96B]' : 'text-[#E2E0DB] dark:text-[#333333]'}`} />
                        <span className={p.priority_service ? 'font-bold text-[#111111] dark:text-white' : 'text-[#858585]'}>
                          Priority Technician Visit within 6 Hours
                        </span>
                      </li>
                      <li className="flex items-center space-x-2.5">
                        <Check className={`w-4 h-4 ${p.free_gas_charging ? 'text-[#C8A96B]' : 'text-[#E2E0DB] dark:text-[#333333]'}`} />
                        <span className={p.free_gas_charging ? 'font-extrabold text-[#C8A96B]' : 'text-[#858585]'}>
                          FREE Gas Charging (R32 / R410A)
                        </span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleSubscribe(p)}
                    className={`mt-8 w-full py-4 rounded-2xl font-bold text-sm transition ${
                      isPopular
                        ? 'btn-emerald-primary'
                        : 'btn-emerald-secondary'
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
      <div className="bg-white dark:bg-[#1A1A1A] text-[#111111] dark:text-white p-8 sm:p-10 rounded-3xl border border-[#E2E0DB] dark:border-[#292929] space-y-6 shadow-sm">
        <div className="max-w-xl space-y-2">
          <span className="text-xs font-bold text-[#C8A96B] uppercase tracking-wider">Instant Qualification</span>
          <h3 className="text-2xl sm:text-3xl font-black text-[#111111] dark:text-white">Check Your AC AMC Eligibility</h3>
          <p className="text-sm text-[#858585]">Test whether your current AC qualifies for instant online AMC enrollment.</p>
        </div>

        <form onSubmit={handleEligibilitySubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-sm">
          <div>
            <label className="block font-bold text-[#111111] dark:text-white mb-1.5">AC Brand</label>
            <LuxurySelect
              value={acBrand}
              onChange={(e) => setAcBrand(e.target.value)}
              options={['Daikin', 'LG', 'Voltas', 'Blue Star', 'Panasonic', 'Other']}
              size="md"
              className="py-3 px-3.5"
            />
          </div>

          <div>
            <label className="block font-bold text-[#111111] dark:text-white mb-1.5">AC Age (Years)</label>
            <input
              type="number"
              value={acAge}
              onChange={(e) => setAcAge(e.target.value)}
              min={0.5}
              max={15}
              step={0.5}
              className="w-full p-3 bg-[#F7F6F2] dark:bg-[#252525] border border-[#E2E0DB] dark:border-[#333333] rounded-xl text-[#111111] dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#C8A96B]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#111111] dark:text-white mb-1.5">Is AC Currently Working?</label>
            <LuxurySelect
              value={isWorking ? 'yes' : 'no'}
              onChange={(e) => setIsWorking(e.target.value === 'yes')}
              options={[
                { value: 'yes', label: 'Yes, Working Fine', badge: 'Active' },
                { value: 'no', label: 'No, Has Issue', badge: 'Repair' }
              ]}
              size="md"
              className="py-3 px-3.5"
            />
          </div>

          <div className="sm:col-span-3 pt-2">
            <button
              type="submit"
              className="btn-emerald-primary px-8 py-3.5 text-sm font-bold"
            >
              Run Eligibility Check
            </button>
          </div>
        </form>

        {eligibilityResult && (
          <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
            eligibilityResult.eligible
              ? 'bg-[#FAF7F0] dark:bg-[#252525] border-[#C8A96B] text-[#111111] dark:text-[#C8A96B]'
              : 'bg-[#F7F6F2] dark:bg-[#252525] border-[#E2E0DB] dark:border-[#292929] text-[#858585]'
          }`}>
            <h4 className="font-bold text-sm mb-1">{eligibilityResult.message}</h4>
            {eligibilityResult.recommended_plan && (
              <p>Recommended Plan for best protection: <strong className="text-[#111111] dark:text-white">{eligibilityResult.recommended_plan}</strong></p>
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

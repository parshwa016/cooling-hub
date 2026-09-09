from fastapi import APIRouter
from app.schemas import EnergyEstimateRequest, EnergyEstimateResponse

router = APIRouter(prefix="/api/calculator", tags=["Energy Calculator"])

@router.post("/estimate", response_model=EnergyEstimateResponse)
def calculate_energy(req: EnergyEstimateRequest):
    # Base power consumption approximation per tonnage (Watts)
    base_kw_map = {1.0: 1.1, 1.5: 1.6, 2.0: 2.2}
    base_kw = base_kw_map.get(req.tonnage, req.tonnage * 1.1)

    # Efficiency factor multiplier relative to 3-Star Non-Inverter
    # 5-Star Inverter: 0.62 factor (38% energy saving)
    # 4-Star Inverter: 0.70 factor (30% energy saving)
    # 3-Star Inverter: 0.78 factor (22% energy saving)
    # 5-Star Non-Inverter: 0.85 factor
    # 3-Star Non-Inverter: 1.00 baseline
    if req.is_inverter:
        if req.star_rating == 5:
            eff_factor = 0.60
        elif req.star_rating == 4:
            eff_factor = 0.68
        else: # 3 star
            eff_factor = 0.76
    else:
        if req.star_rating == 5:
            eff_factor = 0.82
        elif req.star_rating == 4:
            eff_factor = 0.90
        else: # 3 star baseline
            eff_factor = 1.00

    baseline_eff_factor = 1.00 # 3-Star Non-Inverter

    actual_power_kw = base_kw * eff_factor
    baseline_power_kw = base_kw * baseline_eff_factor

    daily_kwh = round(actual_power_kw * req.usage_hours_per_day, 2)
    monthly_kwh = round(daily_kwh * 30, 2)
    yearly_kwh = round(monthly_kwh * req.months_per_year, 2)

    baseline_daily_kwh = baseline_power_kw * req.usage_hours_per_day
    baseline_yearly_kwh = baseline_daily_kwh * 30 * req.months_per_year

    monthly_cost = round(monthly_kwh * req.electricity_rate, 2)
    yearly_cost = round(yearly_kwh * req.electricity_rate, 2)
    baseline_yearly_cost = round(baseline_yearly_kwh * req.electricity_rate, 2)

    units_saved_yearly = round(max(0.0, baseline_yearly_kwh - yearly_kwh), 2)
    money_saved_yearly = round(max(0.0, baseline_yearly_cost - yearly_cost), 2)

    savings_percentage = round(((baseline_yearly_kwh - yearly_kwh) / baseline_yearly_kwh) * 100, 1) if baseline_yearly_kwh > 0 else 0.0

    # Average price difference between 5-Star Inverter and 3-Star Non-Inverter is approx ₹12,000
    price_premium = 12000.0 if req.is_inverter and req.star_rating == 5 else 7000.0
    breakeven_months = round((price_premium / (money_saved_yearly / 12)) if money_saved_yearly > 0 else 0.0, 1)

    return EnergyEstimateResponse(
        daily_kwh=daily_kwh,
        monthly_kwh=monthly_kwh,
        yearly_kwh=yearly_kwh,
        monthly_cost=monthly_cost,
        yearly_cost=yearly_cost,
        units_saved_yearly=units_saved_yearly,
        money_saved_yearly=money_saved_yearly,
        savings_percentage=savings_percentage,
        breakeven_months=breakeven_months,
        comparison_baseline_cost=baseline_yearly_cost
    )

const DEFAULT_MODIFIER_TOTALS = Object.freeze({
  revenue_bonus: 0,
  expense_bonus: 0,
  risk: 0,
  interest_rate: 0,
  inflation: 0,
  demand: 0,
  energy_cost: 0,
  credit_availability: 0,
  market_risk: 0,
});

export function clampNumber(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function sumModifierEffects(modifiers = []) {
  return modifiers.reduce((totals, modifier) => {
    for (const [key, value] of Object.entries(modifier?.effects || {})) {
      if (typeof value === "number" && Number.isFinite(value)) {
        totals[key] = (totals[key] || 0) + value;
      }
    }
    return totals;
  }, { ...DEFAULT_MODIFIER_TOTALS });
}

export function calculateEffectiveMacro(baseMacro, modifierTotals = {}) {
  return {
    interestRate: Math.max(0.01, baseMacro.interestRate + (modifierTotals.interest_rate || 0)),
    inflation: Math.max(0.01, baseMacro.inflation + (modifierTotals.inflation || 0)),
    demand: Math.max(0.01, baseMacro.demand + (modifierTotals.demand || 0)),
    energyCost: Math.max(0.01, baseMacro.energyCost + (modifierTotals.energy_cost || 0)),
    creditAvailability: Math.max(0.01, baseMacro.creditAvailability + (modifierTotals.credit_availability || 0)),
    marketRisk: Math.max(0.01, baseMacro.marketRisk + (modifierTotals.market_risk || 0)),
  };
}

export function calculateBusinessAssetValue(businesses = []) {
  return businesses.reduce((sum, position) => {
    const level = Math.max(1, position.level || 1);
    return sum + position.definition.cost * (1 + level * 0.25);
  }, 0);
}

export function calculateStockHoldingsValue(stocks = []) {
  return stocks.reduce((sum, position) => {
    return sum + position.definition.price * position.shares;
  }, 0);
}

export function calculateStockDividends(stocks = []) {
  return stocks.reduce((sum, position) => {
    const dividendYield = position.definition.dividend_yield || 0;
    return sum + position.definition.price * position.shares * dividendYield;
  }, 0);
}

export function calculateEconomyReport({
  company,
  macro,
  businesses = [],
  stocks = [],
  modifierTotals = {},
  synergyBonus = {},
}) {
  let revenue = 0;
  let expenses = 0;

  for (const position of businesses) {
    const business = position.definition;
    const level = Math.max(1, position.level || 1);
    const levelMultiplier = 1 + (level - 1) * 0.45;
    const demandFactor = 1 + ((macro.demand - 1) * business.demand_sensitivity);
    const inflationRevenue = 1 + macro.inflation * 0.7;
    const inflationExpense = 1 + macro.inflation;
    const energyFactor = 1 + ((macro.energyCost - 1) * business.energy_use);

    revenue += business.revenue * levelMultiplier * demandFactor * inflationRevenue;
    expenses += business.expense * levelMultiplier * Math.max(0.5, energyFactor) * inflationExpense;
  }

  revenue *= 1
    + (company.revenueBonus || 0)
    + (modifierTotals.revenue_bonus || 0)
    + (synergyBonus.revenue || 0);
  expenses *= Math.max(
    0.2,
    1
      + (company.expenseBonus || 0)
      + (modifierTotals.expense_bonus || 0)
      + (synergyBonus.expense || 0),
  );

  const interest = company.debt * macro.interestRate;
  const dividends = calculateStockDividends(stocks);
  const profit = revenue - expenses - interest + dividends;
  const assetValue = calculateBusinessAssetValue(businesses);
  const stockValue = calculateStockHoldingsValue(stocks);
  const valuation = company.cash + assetValue + stockValue + Math.max(0, profit * 8) - company.debt;
  const effectiveRisk = clampNumber(
    (company.risk || 0) + (modifierTotals.risk || 0),
    0.01,
    0.95,
  );

  return {
    revenue,
    expenses,
    interest,
    dividends,
    profit,
    assetValue,
    stockValue,
    valuation,
    effectiveRisk,
  };
}

export function calculateBaseDebtThreshold(cash, debtThresholdBonus = 0) {
  return Math.max(10000 + debtThresholdBonus, cash * 4);
}

export function assessSolvency({
  cash,
  debt,
  risk,
  debtThreshold,
  randomValue = 1,
  bankruptcyFloor = -5000,
}) {
  const debtPressure = debt > debtThreshold;
  const cashBankruptcy = cash < bankruptcyFloor;
  const debtCollapse = !cashBankruptcy && debtPressure && randomValue < risk;

  return {
    debtPressure,
    cashBankruptcy,
    debtCollapse,
    bankrupt: cashBankruptcy || debtCollapse,
  };
}

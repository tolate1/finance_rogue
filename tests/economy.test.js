import test from "node:test";
import assert from "node:assert/strict";

import {
  assessSolvency,
  calculateBaseDebtThreshold,
  calculateEconomyReport,
  calculateEffectiveMacro,
  sumModifierEffects,
} from "../src/engine/economy.js";

function assertClose(actual, expected, tolerance = 0.000001) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}

const business = {
  cost: 5000,
  revenue: 1000,
  expense: 400,
  demand_sensitivity: 0.5,
  energy_use: 0.4,
};

test("modifier effects are combined without mutating their inputs", () => {
  const modifiers = [
    { effects: { revenue_bonus: 0.1, risk: 0.02 } },
    { effects: { revenue_bonus: -0.03, demand: 0.2, ignored: "value" } },
  ];

  const totals = sumModifierEffects(modifiers);

  assertClose(totals.revenue_bonus, 0.07);
  assert.equal(totals.risk, 0.02);
  assert.equal(totals.demand, 0.2);
  assert.equal(totals.ignored, undefined);
  assert.deepEqual(modifiers[0].effects, { revenue_bonus: 0.1, risk: 0.02 });
});

test("effective macro applies temporary changes and enforces safe floors", () => {
  const result = calculateEffectiveMacro(
    {
      interestRate: 0.04,
      inflation: 0.03,
      demand: 1,
      energyCost: 1,
      creditAvailability: 1,
      marketRisk: 0.05,
    },
    {
      interest_rate: -0.2,
      inflation: -0.2,
      demand: -2,
      energy_cost: 0.25,
      credit_availability: 0.1,
      market_risk: -0.2,
    },
  );

  assert.deepEqual(result, {
    interestRate: 0.01,
    inflation: 0.01,
    demand: 0.01,
    energyCost: 1.25,
    creditAvailability: 1.1,
    marketRisk: 0.01,
  });
});

test("economy report shares one formula for operations, assets, stocks, and valuation", () => {
  const report = calculateEconomyReport({
    company: {
      cash: 10000,
      debt: 2000,
      risk: 0.1,
      revenueBonus: 0.1,
      expenseBonus: -0.05,
    },
    macro: {
      interestRate: 0.05,
      inflation: 0.1,
      demand: 1.2,
      energyCost: 1.3,
      creditAvailability: 1,
      marketRisk: 0.05,
    },
    businesses: [{ definition: business, level: 2 }],
    stocks: [{
      definition: { price: 100, dividend_yield: 0.02 },
      shares: 10,
    }],
    modifierTotals: {
      revenue_bonus: 0.05,
      expense_bonus: 0.02,
      risk: 0.9,
    },
    synergyBonus: { revenue: 0.1, expense: -0.1 },
  });

  assertClose(report.revenue, 2133.3125);
  assertClose(report.expenses, 621.6672);
  assertClose(report.interest, 100);
  assertClose(report.dividends, 20);
  assertClose(report.profit, 1431.6453);
  assertClose(report.assetValue, 7500);
  assertClose(report.stockValue, 1000);
  assertClose(report.valuation, 27953.1624);
  assert.equal(report.effectiveRisk, 0.95);
});

test("negative operating profit does not add a valuation multiple", () => {
  const report = calculateEconomyReport({
    company: {
      cash: 5000,
      debt: 10000,
      risk: 0.05,
      revenueBonus: 0,
      expenseBonus: 0,
    },
    macro: {
      interestRate: 0.1,
      inflation: 0,
      demand: 1,
      energyCost: 1,
      creditAvailability: 1,
      marketRisk: 0.05,
    },
    businesses: [{ definition: business, level: 1 }],
  });

  assert.ok(report.profit < 0);
  assert.equal(report.assetValue, 6250);
  assert.equal(report.valuation, 1250);
});

test("debt threshold and insolvency decisions are deterministic at their boundaries", () => {
  assert.equal(calculateBaseDebtThreshold(1000, 5000), 15000);
  assert.equal(calculateBaseDebtThreshold(10000, 0), 40000);

  assert.deepEqual(
    assessSolvency({
      cash: -5000,
      debt: 20001,
      risk: 0.3,
      debtThreshold: 20000,
      randomValue: 0.29,
    }),
    {
      debtPressure: true,
      cashBankruptcy: false,
      debtCollapse: true,
      bankrupt: true,
    },
  );

  assert.deepEqual(
    assessSolvency({
      cash: -5001,
      debt: 0,
      risk: 0,
      debtThreshold: 20000,
      randomValue: 0,
    }),
    {
      debtPressure: false,
      cashBankruptcy: true,
      debtCollapse: false,
      bankrupt: true,
    },
  );
});

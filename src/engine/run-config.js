export const RUN_SCENARIOS = [
  {
    id: "balanced",
    titleKey: "scenarioBalancedTitle",
    descriptionKey: "scenarioBalancedDesc",
    starterBusinessIds: ["coffee_shop", "mini_market", "mobile_studio"],
    cashDelta: 0,
    startingDebt: 0,
    riskDelta: 0,
    startingStocks: [],
    macroDelta: {}
  },
  {
    id: "leveraged_growth",
    titleKey: "scenarioLeveragedTitle",
    descriptionKey: "scenarioLeveragedDesc",
    starterBusinessIds: ["saas_tool"],
    cashDelta: 7000,
    startingDebt: 10000,
    riskDelta: 0.05,
    startingStocks: [],
    macroDelta: { interestRate: 0.01, creditAvailability: 0.08 }
  },
  {
    id: "market_trader",
    titleKey: "scenarioTraderTitle",
    descriptionKey: "scenarioTraderDesc",
    starterBusinessIds: ["mobile_studio"],
    cashDelta: 2000,
    startingDebt: 0,
    riskDelta: 0.02,
    startingStocks: [{ stockId: "aplix_systems", shares: 8 }],
    macroDelta: { marketRisk: 0.02 }
  }
];

export const RUN_DIFFICULTIES = [
  {
    id: "relaxed",
    titleKey: "difficultyRelaxedTitle",
    descriptionKey: "difficultyRelaxedDesc",
    cashDelta: 4000,
    riskDelta: -0.02,
    debtThresholdMultiplier: 1.25,
    knowledgeMultiplier: 0.75
  },
  {
    id: "normal",
    titleKey: "difficultyNormalTitle",
    descriptionKey: "difficultyNormalDesc",
    cashDelta: 0,
    riskDelta: 0,
    debtThresholdMultiplier: 1,
    knowledgeMultiplier: 1
  },
  {
    id: "hard",
    titleKey: "difficultyHardTitle",
    descriptionKey: "difficultyHardDesc",
    cashDelta: -2500,
    riskDelta: 0.05,
    debtThresholdMultiplier: 0.8,
    knowledgeMultiplier: 1.25
  }
];

const DEFAULT_MACRO = {
  interestRate: 0.04,
  inflation: 0.03,
  demand: 1,
  energyCost: 1,
  creditAvailability: 1,
  marketRisk: 0.05
};

export function scenarioById(id) {
  return RUN_SCENARIOS.find((scenario) => scenario.id === id) || RUN_SCENARIOS[0];
}

export function difficultyById(id) {
  return RUN_DIFFICULTIES.find((difficulty) => difficulty.id === id) || RUN_DIFFICULTIES[1];
}

export function createRunConfiguration({
  scenarioId,
  difficultyId,
  baseCash,
  metaExtraCash = 0,
  stocks = [],
  random = Math.random
}) {
  const scenario = scenarioById(scenarioId);
  const difficulty = difficultyById(difficultyId);
  const starterIndex = Math.floor(random() * scenario.starterBusinessIds.length);
  const starterBusinessId = scenario.starterBusinessIds[starterIndex] || scenario.starterBusinessIds[0];
  const stockPrices = new Map(stocks.map((stock) => [stock.id, stock.price]));
  const startingStocks = scenario.startingStocks
    .filter((holding) => stockPrices.has(holding.stockId))
    .map((holding) => ({
      ...holding,
      averagePrice: stockPrices.get(holding.stockId)
    }));

  return {
    scenario,
    difficulty,
    company: {
      cash: Math.max(0, baseCash + metaExtraCash + scenario.cashDelta + difficulty.cashDelta),
      debt: scenario.startingDebt,
      risk: clamp(0.05 + scenario.riskDelta + difficulty.riskDelta, 0.01, 0.95),
      revenueBonus: 0,
      expenseBonus: 0,
      businesses: [{ businessId: starterBusinessId, level: 1 }],
      stocks: startingStocks
    },
    macro: Object.fromEntries(Object.entries(DEFAULT_MACRO).map(([key, value]) => [
      key,
      value + (scenario.macroDelta[key] || 0)
    ]))
  };
}

export function applyDifficultyToDebtThreshold(threshold, difficultyId) {
  return Math.round(threshold * difficultyById(difficultyId).debtThresholdMultiplier);
}

export function applyDifficultyToKnowledgeReward(reward, difficultyId) {
  return Math.max(0, Math.round(reward * difficultyById(difficultyId).knowledgeMultiplier));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

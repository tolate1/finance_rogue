import test from "node:test";
import assert from "node:assert/strict";

import {
  RUN_DIFFICULTIES,
  RUN_SCENARIOS,
  applyDifficultyToDebtThreshold,
  applyDifficultyToKnowledgeReward,
  createRunConfiguration,
  difficultyById,
  scenarioById
} from "../src/engine/run-config.js";

const stocks = [{ id: "aplix_systems", price: 96 }];

test("scenario and difficulty ids are unique", () => {
  assert.equal(new Set(RUN_SCENARIOS.map((item) => item.id)).size, RUN_SCENARIOS.length);
  assert.equal(new Set(RUN_DIFFICULTIES.map((item) => item.id)).size, RUN_DIFFICULTIES.length);
});

test("unknown setup ids safely fall back to balanced and normal", () => {
  assert.equal(scenarioById("missing").id, "balanced");
  assert.equal(difficultyById("missing").id, "normal");
});

test("leveraged scenario starts with more cash, debt, and risk", () => {
  const setup = createRunConfiguration({
    scenarioId: "leveraged_growth",
    difficultyId: "normal",
    baseCash: 12000,
    stocks,
    random: () => 0
  });

  assert.equal(setup.company.cash, 19000);
  assert.equal(setup.company.debt, 10000);
  assert.equal(setup.company.risk, 0.1);
  assert.equal(setup.company.businesses[0].businessId, "saas_tool");
  assert.equal(setup.macro.interestRate, 0.05);
});

test("market trader receives a correctly priced starting stock position", () => {
  const setup = createRunConfiguration({
    scenarioId: "market_trader",
    difficultyId: "normal",
    baseCash: 12000,
    stocks,
    random: () => 0
  });

  assert.deepEqual(setup.company.stocks, [{ stockId: "aplix_systems", shares: 8, averagePrice: 96 }]);
  assert.equal(setup.macro.marketRisk, 0.07);
});

test("difficulty changes cash, debt safety, and knowledge reward", () => {
  const relaxed = createRunConfiguration({ scenarioId: "balanced", difficultyId: "relaxed", baseCash: 12000, stocks, random: () => 0 });
  const hard = createRunConfiguration({ scenarioId: "balanced", difficultyId: "hard", baseCash: 12000, stocks, random: () => 0 });

  assert.equal(relaxed.company.cash, 16000);
  assert.equal(hard.company.cash, 9500);
  assert.ok(relaxed.company.risk < hard.company.risk);
  assert.equal(applyDifficultyToDebtThreshold(20000, "relaxed"), 25000);
  assert.equal(applyDifficultyToDebtThreshold(20000, "hard"), 16000);
  assert.equal(applyDifficultyToKnowledgeReward(20, "relaxed"), 15);
  assert.equal(applyDifficultyToKnowledgeReward(20, "hard"), 25);
});

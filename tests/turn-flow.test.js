import test from "node:test";
import assert from "node:assert/strict";

import {
  TURN_PHASES,
  getRecommendedTab,
  getRoundResultSummary,
  getTurnPhase,
  getTurnStepStates,
} from "../src/ui/turn-flow.js";

test("turn flow starts with the event on the unified game screen", () => {
  const run = { eventResolved: false, pendingActionDone: false, finished: false };

  assert.equal(getTurnPhase(run), TURN_PHASES.EVENT);
  assert.equal(getRecommendedTab(run), "dashboard");
  assert.deepEqual(
    getTurnStepStates(run).map(step => step.state),
    ["active", "pending", "pending"],
  );
});

test("resolving an event activates the mandatory action step on the game screen", () => {
  const run = { eventResolved: true, pendingActionDone: false, finished: false };

  assert.equal(getTurnPhase(run), TURN_PHASES.ACTION);
  assert.equal(getRecommendedTab(run), "dashboard");
  assert.deepEqual(
    getTurnStepStates(run).map(step => step.state),
    ["done", "active", "pending"],
  );
});

test("completing an action activates round completion and recommends overview", () => {
  const run = { eventResolved: true, pendingActionDone: true, finished: false };

  assert.equal(getTurnPhase(run), TURN_PHASES.FINISH);
  assert.equal(getRecommendedTab(run), "dashboard");
  assert.deepEqual(
    getTurnStepStates(run).map(step => step.state),
    ["done", "done", "active"],
  );
});

test("round result summary exposes the exact settlement breakdown", () => {
  assert.deepEqual(
    getRoundResultSummary({
      revenue: 4000,
      expenses: 1200,
      interest: 300,
      dividends: 50,
      profit: 2550,
      valuation: 50000,
    }, 10000),
    {
      revenue: 4000,
      expenses: 1200,
      interest: 300,
      dividends: 50,
      profit: 2550,
      valuation: 50000,
      projectedCash: 12550,
    },
  );
});

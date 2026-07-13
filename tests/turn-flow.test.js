import test from "node:test";
import assert from "node:assert/strict";

import {
  TURN_PHASES,
  getRecommendedTab,
  getTurnPhase,
  getTurnStepStates,
} from "../src/ui/turn-flow.js";

test("turn flow starts with the event and recommends decisions", () => {
  const run = { eventResolved: false, pendingActionDone: false, finished: false };

  assert.equal(getTurnPhase(run), TURN_PHASES.EVENT);
  assert.equal(getRecommendedTab(run), "decisions");
  assert.deepEqual(
    getTurnStepStates(run).map(step => step.state),
    ["active", "pending", "pending"],
  );
});

test("resolving an event activates the mandatory action step", () => {
  const run = { eventResolved: true, pendingActionDone: false, finished: false };

  assert.equal(getTurnPhase(run), TURN_PHASES.ACTION);
  assert.equal(getRecommendedTab(run), "decisions");
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

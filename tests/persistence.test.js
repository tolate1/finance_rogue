import test from "node:test";
import assert from "node:assert/strict";

import {
  RUN_SAVE_VERSION,
  clearRunState,
  isRunStateValid,
  loadRunState,
  saveRunState
} from "../src/persistence.js";

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
}

function createRun(overrides = {}) {
  return {
    id: "run-test",
    maxTurns: 10,
    turn: 3,
    finished: false,
    currentEvent: { id: "rate_hike", choices: [] },
    currentCards: [],
    history: [],
    activeModifiers: [],
    company: {
      cash: 12000,
      debt: 0,
      businesses: [{ businessId: "coffee_shop", level: 1 }],
      stocks: []
    },
    macro: { interestRate: 0.04 },
    stockMarket: { listings: [] },
    ...overrides
  };
}

test("saves and restores a valid unfinished run", () => {
  const storage = createStorage();
  const run = createRun();

  assert.equal(saveRunState(storage, "run", run), true);
  assert.deepEqual(loadRunState(storage, "run"), run);

  const payload = JSON.parse(storage.getItem("run"));
  assert.equal(payload.version, RUN_SAVE_VERSION);
  assert.match(payload.savedAt, /^\d{4}-\d{2}-\d{2}T/);
});

test("rejects finished and structurally invalid runs", () => {
  assert.equal(isRunStateValid(createRun({ finished: true })), false);
  assert.equal(isRunStateValid(createRun({ company: null })), false);
  assert.equal(isRunStateValid(createRun({ currentEvent: null })), false);
});

test("removes corrupted or incompatible saves", () => {
  const corrupted = createStorage({ run: "{not-json" });
  assert.equal(loadRunState(corrupted, "run"), null);
  assert.equal(corrupted.getItem("run"), null);

  const incompatible = createStorage({
    run: JSON.stringify({ version: RUN_SAVE_VERSION + 1, run: createRun() })
  });
  assert.equal(loadRunState(incompatible, "run"), null);
  assert.equal(incompatible.getItem("run"), null);
});

test("clears a stored run", () => {
  const storage = createStorage({ run: "saved" });
  assert.equal(clearRunState(storage, "run"), true);
  assert.equal(storage.getItem("run"), null);
});

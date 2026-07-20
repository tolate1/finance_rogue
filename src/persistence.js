export const RUN_SAVE_VERSION = 1;

export function isRunStateValid(run) {
  if (!run || typeof run !== "object" || run.finished) return false;
  if (typeof run.id !== "string" || !run.id) return false;
  if (!Number.isInteger(run.turn) || run.turn < 1) return false;
  if (!Number.isInteger(run.maxTurns) || run.maxTurns < 1) return false;
  if (!run.company || typeof run.company !== "object") return false;
  if (!Number.isFinite(run.company.cash) || !Number.isFinite(run.company.debt)) return false;
  if (!Array.isArray(run.company.businesses) || !Array.isArray(run.company.stocks)) return false;
  if (!run.macro || typeof run.macro !== "object") return false;
  if (!run.currentEvent || typeof run.currentEvent !== "object") return false;
  if (!Array.isArray(run.currentCards) || !Array.isArray(run.history)) return false;
  if (!Array.isArray(run.activeModifiers)) return false;
  if (!run.stockMarket || !Array.isArray(run.stockMarket.listings)) return false;
  return true;
}

export function saveRunState(storage, key, run) {
  if (!storage || !key || !isRunStateValid(run)) return false;
  try {
    storage.setItem(key, JSON.stringify({
      version: RUN_SAVE_VERSION,
      savedAt: new Date().toISOString(),
      run
    }));
    return true;
  } catch {
    return false;
  }
}

export function loadRunState(storage, key) {
  if (!storage || !key) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const payload = JSON.parse(raw);
    if (payload?.version !== RUN_SAVE_VERSION || !isRunStateValid(payload.run)) {
      storage.removeItem(key);
      return null;
    }
    return payload.run;
  } catch {
    try {
      storage.removeItem(key);
    } catch {
      // Storage may be unavailable. Starting a fresh run is still safe.
    }
    return null;
  }
}

export function clearRunState(storage, key) {
  if (!storage || !key) return false;
  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

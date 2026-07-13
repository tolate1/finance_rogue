export const TURN_PHASES = Object.freeze({
  EVENT: "event",
  ACTION: "action",
  FINISH: "finish",
  FINISHED: "finished",
});

export function getTurnPhase(run) {
  if (!run || run.finished) return TURN_PHASES.FINISHED;
  if (!run.eventResolved) return TURN_PHASES.EVENT;
  if (!run.pendingActionDone) return TURN_PHASES.ACTION;
  return TURN_PHASES.FINISH;
}

export function getTurnStepStates(run) {
  const phase = getTurnPhase(run);
  const activeIndex = {
    [TURN_PHASES.EVENT]: 0,
    [TURN_PHASES.ACTION]: 1,
    [TURN_PHASES.FINISH]: 2,
    [TURN_PHASES.FINISHED]: 2,
  }[phase];

  return ["event", "action", "finish"].map((id, index) => ({
    id,
    state: phase === TURN_PHASES.FINISHED || index < activeIndex
      ? "done"
      : index === activeIndex
        ? "active"
        : "pending",
  }));
}

export function getRecommendedTab(run) {
  const phase = getTurnPhase(run);
  return phase === TURN_PHASES.EVENT || phase === TURN_PHASES.ACTION
    ? "decisions"
    : "dashboard";
}

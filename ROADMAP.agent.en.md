# Finance Roguelike — Agent Delivery Guide

The detailed Russian product roadmap in `ROADMAP.user.ru.md` is the source of truth. This file translates it into implementation order for contributors and coding agents.

## Product direction

Build a stable mobile-first browser beta in which players manage businesses, stocks, debt, and macro shocks through short roguelike runs. Decisions should be legible but non-obvious, and every strong action should carry a cost, risk, or opportunity cost.

## Delivery rules

1. Work through small pull requests; do not commit feature work directly to `main`.
2. Keep game rules out of rendering code whenever a touched area can be extracted safely.
3. A formula must have one canonical implementation shared by live play and simulation.
4. Add or update tests with every behavior change.
5. Run `npm run check` before publishing a branch.
6. Update the user roadmap and README whenever shipped scope changes.
7. Do not add content before validating its references and basic economy values.

## Completed milestone: reliability foundation

Goal: protect player progress and make all future changes automatically verifiable.

- [x] Versioned unfinished-run persistence.
- [x] Automatic restore after reload.
- [x] Invalid and incompatible save rejection.
- [x] Persistence unit tests.
- [x] Content-integrity tests.
- [x] GitHub Actions CI definition.
- [x] Current product roadmap and README.

Acceptance checks:

- `npm run check` succeeds.
- A fresh run writes a versioned save.
- Reload restores the same run id and turn.
- A finished run is not restored.
- Corrupted storage starts safely with a fresh run.

## Next milestone: canonical game engine

Goal: stop duplicating economy behavior across UI, simulation, and the Python prototype.

The browser build now includes three starting scenarios and three difficulty levels. Their configuration lives in `src/engine/run-config.js`; keep future run setup rules in that module instead of returning them to UI code.

Revenue, expenses, interest, dividends, asset value, valuation, macro modifiers, debt thresholds, and insolvency now live in `src/engine/economy.js`. Live play and the simulator both call this module. Do not duplicate these formulas in UI or simulation code.

Round guidance now lives in `src/ui/turn-flow.js`. It provides the canonical UI phase, three-step state, and recommended tab for the current run. Keep future navigation prompts aligned with this module instead of recreating phase checks in individual renderers.

Recommended module boundaries:

- `src/engine/state.js` — run creation, schema version, migrations.
- `src/engine/economy.js` — revenue, expenses, interest, dividends, valuation.
- `src/engine/actions.js` — buy, sell, upgrade, cards, and debt operations.
- `src/engine/events.js` — eligibility, weighted selection, and effects.
- `src/engine/stocks.js` — market cycle and stock ticks.
- `src/engine/synergies.js` — active and near synergies.
- `src/engine/simulation.js` — seeded strategies using the live engine.
- `src/ui/` — rendering and browser event bindings only.
- `src/i18n/` — locale dictionaries and formatting.

Extraction order:

1. [x] Economy pure functions and tests.
2. [ ] Seeded random source.
3. Event/effect functions.
4. Business and stock actions.
5. Simulation migration.
6. Rendering split.
7. Decide whether `finance_roguelike.py` becomes an adapter or an archived prototype.

## Balance milestone

Target ranges on normal difficulty:

- bankruptcy rate: 15–35%;
- full-run completion: 65–85%;
- no sub-three-turn payback unless explicitly designed as rare;
- no strategy that dominates every common macro regime.

The simulator must include stocks, dividends, synergies, selling, upgrading, debt repayment, and meta bonuses before its output is used for final tuning.

## Beta milestone

The public build now has a persistent event → action → finish guide, contextual primary CTA, early-round explanation, and static HTTPS deployment. Before the wider beta, finish interactive onboarding, action previews, mobile/accessibility QA, PWA support, save migrations, graceful loading errors, and a feedback path. Analytics require a separate product/privacy decision and are not implied by this roadmap.

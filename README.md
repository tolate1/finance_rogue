# Finance Roguelike

Mobile-first browser prototype of a finance/business roguelike.

## Run

```bash
python finance_roguelike.py
```

## Web UI

Run a local static server in the project root, then open `index.html`.

```bash
python -m http.server 4173
```

Open `http://localhost:4173`. The browser version is the primary playable build.

## Checks

Node.js 22 or newer is required for repository checks.

```bash
npm test
npm run check
```

## Current scope

- 10-turn run with prestige extensions
- business purchase and upgrades
- debt and interest
- macro state changes
- 20 events with choices
- 20 decision cards
- public stock market with seven fictional listings
- synergies and temporary modifiers with duration
- industry data validation
- bankruptcy check
- playable browser UI
- first-launch language selection
- RU/EN localization
- PNG bottom-nav icons
- persistent prestige progression
- automatic recovery of an unfinished run

## Roadmap status

Current stage: reliability foundation for the first public beta.

Done:

- basic playable text run
- data-driven businesses, industries, events, cards, synergies
- simple economy formula
- debt, interest, risk, valuation
- MVP-sized first content set
- tab-based browser UI
- language select and RU/EN translations
- temporary turn-based modifiers
- stocks, dividends, and market cycles
- meta progression and persistent unlocks
- automated persistence and content-integrity tests
- GitHub Actions CI

Next:

- extract one canonical game engine from the UI
- make the simulator match all live game mechanics
- run the first measured balance pass
- improve onboarding and mobile feedback
- publish the first installable beta

See [ROADMAP.user.ru.md](ROADMAP.user.ru.md) for goals, acceptance criteria, and the detailed delivery order.

# Finance Roguelike

Mobile-first browser prototype of a finance/business roguelike.

## Run

```bash
python finance_roguelike.py
```

## Web UI

Install dependencies and start the Vite development server:

```bash
npm install
npm run dev
```

The browser version is the primary playable build.

Public beta:

https://finance-rogue-tolate1-play.perky-squid-7719.chatgpt.site

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
- persistent three-step round guide: event, action, finish round
- first-launch language selection
- RU/EN localization
- mobile-optimized WebP icons and company logos
- persistent prestige progression
- automatic recovery of an unfinished run
- three starting scenarios and three difficulty levels
- shared economy engine for live play and simulation
- public HTTPS production deployment

## Roadmap status

Current stage: canonical game engine for the first public beta.

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
- canonical calculations for revenue, expenses, interest, dividends, valuation, and insolvency
- public mobile beta deployment
- guided round flow with a contextual primary action on every game screen

Next:

- continue extracting actions, events, stocks, and seeded randomness into the canonical engine
- make the simulator match all live game mechanics
- run the first measured balance pass
- continue onboarding, action previews, and mobile feedback
- add PWA installation support and graceful loading errors

See [ROADMAP.user.ru.md](ROADMAP.user.ru.md) for goals, acceptance criteria, and the detailed delivery order.

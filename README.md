# Finance Roguelike Text Prototype

Minimal text prototype for the finance/business roguelike.

## Run

```bash
python finance_roguelike.py
```

## Web UI

Run a local static server in the project root, then open `index.html`.

```bash
python -m http.server 4173
```

## Current scope

- 10-turn run
- business purchase and upgrades
- debt and interest
- macro state changes
- 20 events with choices
- 20 decision cards
- simple synergies
- temporary modifiers with duration
- industry data validation
- bankruptcy check
- playable browser UI
- first-launch language selection
- RU/EN localization
- PNG bottom-nav icons

## Roadmap status

Current stage: browser UI prototype with temporary modifiers and localization.

Done:

- basic playable text run
- data-driven businesses, industries, events, cards, synergies
- simple economy formula
- debt, interest, risk, valuation
- MVP-sized first content set
- tab-based browser UI
- language select and RU/EN translations
- temporary turn-based modifiers

Next:

- improve balance and action usefulness
- add simple meta progression
- add tests for economy/content validation
- tune temporary modifiers and debt pressure

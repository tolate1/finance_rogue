# Finance Roguelike Roadmap

## Current Stage

Current stage: Stage 4 UI prototype with Stage 3 temporary modifiers implemented.

## Progress Overview

- [x] Repository initialized
- [x] Text prototype entry point created
- [x] Basic 10-turn run loop implemented
- [x] Bankruptcy condition implemented
- [x] Basic economy formula implemented
- [x] Debt and interest implemented
- [x] Valuation output implemented
- [x] Business purchase implemented
- [x] Business upgrades implemented
- [x] Macro state implemented
- [x] Event system implemented
- [x] Event choices implemented
- [x] Decision card system implemented
- [x] Synergy system implemented
- [x] Industry data added
- [x] Content validation for industries and synergies added
- [x] First MVP-sized data pack added
- [x] README with run instructions and status added
- [x] First-launch language select
- [x] RU/EN interface localization
- [x] PNG tab icons
- [ ] Balance pass
- [ ] Action economy pass
- [ ] Turn count review for MVP
- [x] Run logging for balancing
- [x] Meta progression
- [x] Automated tests
- [x] Mobile-style browser UI prototype

## Stage Checklist

### Stage 0: Documentation and Prototyping

- [x] Core concept written
- [x] MVP scope defined in working notes
- [x] First content direction fixed
- [ ] Formal game design document
- [ ] Economy balancing sheet
- [ ] Wireframes

### Stage 1: Basic Game Loop

- [x] New run start
- [x] Turn flow
- [x] Financial report per turn
- [x] Player action phase
- [x] End-of-run result screen in text form
- [x] Input loop for manual play
- [ ] Better fail states and feedback

### Stage 2: Economy and Businesses

- [x] Business definitions
- [x] Industry definitions
- [x] Buy flow
- [x] Upgrade flow
- [x] Debt flow
- [x] Interest flow
- [x] Macro modifiers
- [x] Valuation model
- [ ] Balance business prices and output
- [ ] Add industry-specific logic beyond scalar modifiers

### Stage 3: Roguelike Events and Choices

- [x] Event pool
- [x] Event macro effects
- [x] Choice effects
- [x] Decision cards
- [x] Initial variety for runs
- [x] Event weighting and conditions
- [x] Temporary modifiers with duration

### Stage 4: UI/UX

- [x] Mobile card UI
- [x] Fixed bottom tab navigation
- [x] Single active tab content model
- [x] Dashboard / Decisions / Portfolio / Market / Economy split
- [x] Synergies merged into Portfolio for MVP
- [x] Better report readability
- [x] Action previews
- [x] End-run summary screen

### Stage 5: Balancing

- [x] Simulation runner
- [x] Run logs
- [ ] Dominant strategy checks
- [ ] Economy tuning pass

### Stage 6: Meta Progression

- [x] Unlock currency
- [x] Unlock table
- [x] Persistent save

### Stage 7: Content

- [x] 10 businesses
- [x] 7 industries including media
- [x] 20 events
- [x] 20 cards
- [x] 10 synergies
- [ ] Scenario content
- [ ] More starter variants

### Stage 8: Testing

- [x] Manual playthroughs
- [x] Syntax check
- [x] JSON validation
- [ ] Economy unit tests
- [x] Content integrity tests

### Stage 9: Soft Launch

- [ ] Not started

### Stage 10: Release and Growth

- [ ] Not started

## Next Work

1. Rework action usefulness so buying is not blocked too often.
2. Tune business prices, upgrade costs, and debt pressure.
3. Run 100/1000 simulations and inspect bankruptcy/valuation spread.
4. Add event/card unlock extensions beyond industries and finance cards.
5. Port the browser prototype into the final mobile stack.

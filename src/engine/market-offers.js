export const MARKET_OFFER_COUNT = 3;

export const INDUSTRY_DISCOVERY_SCHEDULE = Object.freeze([
  { turn: 1, industry: "retail" },
  { turn: 1, industry: "logistics" },
  { turn: 2, industry: "it" },
  { turn: 3, industry: "manufacturing" },
  { turn: 4, industry: "real_estate" },
  { turn: 5, industry: "media" },
  { turn: 6, industry: "energy" },
]);

export function industryDiscoveryTurn(industry) {
  return INDUSTRY_DISCOVERY_SCHEDULE.find((entry) => entry.industry === industry)?.turn ?? 1;
}

export function discoveredIndustriesForTurn({
  turn,
  unlockedIndustries = [],
  previousIndustries = [],
}) {
  const unlocked = new Set(unlockedIndustries);
  const discovered = new Set(previousIndustries.filter((industry) => unlocked.has(industry)));

  for (const entry of INDUSTRY_DISCOVERY_SCHEDULE) {
    if (entry.turn <= turn && unlocked.has(entry.industry)) discovered.add(entry.industry);
  }

  return [...discovered];
}

function shuffled(items, random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export function createMarketOffers({
  businesses = [],
  ownedBusinessIds = [],
  discoveredIndustries = [],
  previousOfferIds = [],
  count = MARKET_OFFER_COUNT,
  availableCash = null,
  random = Math.random,
}) {
  const owned = new Set(ownedBusinessIds);
  const discovered = new Set(discoveredIndustries);
  const previous = new Set(previousOfferIds);
  const eligible = businesses.filter((business) => (
    discovered.has(business.industry) && !owned.has(business.id)
  ));
  const fresh = shuffled(eligible.filter((business) => !previous.has(business.id)), random);
  const returning = shuffled(eligible.filter((business) => previous.has(business.id)), random);

  const selected = [...fresh, ...returning].slice(0, Math.max(0, count));
  if (Number.isFinite(availableCash) && !selected.some((business) => business.cost <= availableCash)) {
    const affordable = eligible
      .filter((business) => business.cost <= availableCash)
      .sort((left, right) => left.cost - right.cost)[0];
    if (affordable && !selected.some((business) => business.id === affordable.id)) {
      if (selected.length >= count) selected[selected.length - 1] = affordable;
      else selected.push(affordable);
    }
  }
  return selected.map((business) => business.id);
}

export function newlyDiscoveredIndustries(previousIndustries = [], currentIndustries = []) {
  const previous = new Set(previousIndustries);
  return currentIndustries.filter((industry) => !previous.has(industry));
}

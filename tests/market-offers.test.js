import test from "node:test";
import assert from "node:assert/strict";

import {
  createMarketOffers,
  discoveredIndustriesForTurn,
  industryDiscoveryTurn,
  newlyDiscoveredIndustries,
} from "../src/engine/market-offers.js";

const businesses = [
  { id: "coffee", industry: "retail" },
  { id: "shop", industry: "retail" },
  { id: "courier", industry: "logistics" },
  { id: "warehouse", industry: "logistics" },
  { id: "app", industry: "it" },
  { id: "factory", industry: "manufacturing" },
];

test("industries enter the market gradually and respect meta unlocks", () => {
  const unlockedIndustries = ["retail", "logistics", "it", "manufacturing"];

  assert.deepEqual(
    discoveredIndustriesForTurn({ turn: 1, unlockedIndustries }),
    ["retail", "logistics"],
  );
  assert.deepEqual(
    discoveredIndustriesForTurn({ turn: 2, unlockedIndustries }),
    ["retail", "logistics", "it"],
  );
  assert.deepEqual(
    discoveredIndustriesForTurn({ turn: 6, unlockedIndustries }),
    ["retail", "logistics", "it", "manufacturing"],
  );
  assert.equal(industryDiscoveryTurn("real_estate"), 4);
});

test("market offers are limited, exclude owned assets, and prefer fresh cards", () => {
  const offers = createMarketOffers({
    businesses,
    ownedBusinessIds: ["coffee"],
    discoveredIndustries: ["retail", "logistics", "it"],
    previousOfferIds: ["shop", "courier"],
    count: 3,
    random: () => 0,
  });

  assert.equal(offers.length, 3);
  assert.equal(offers[0], "app");
  assert.ok(!offers.includes("coffee"));
  assert.ok(!offers.includes("factory"));
});

test("new discovery list contains only industries revealed this turn", () => {
  assert.deepEqual(
    newlyDiscoveredIndustries(["retail", "logistics"], ["retail", "logistics", "it"]),
    ["it"],
  );
});

test("a limited deal includes an affordable card when one exists", () => {
  const pricedBusinesses = [
    { id: "cheap", industry: "retail", cost: 100 },
    { id: "expensive-a", industry: "retail", cost: 900 },
    { id: "expensive-b", industry: "retail", cost: 1000 },
    { id: "expensive-c", industry: "retail", cost: 1100 },
  ];
  const offers = createMarketOffers({
    businesses: pricedBusinesses,
    discoveredIndustries: ["retail"],
    count: 3,
    availableCash: 200,
    random: () => 0.99,
  });

  assert.ok(offers.includes("cheap"));
});

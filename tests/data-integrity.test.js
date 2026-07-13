import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const load = (name) => JSON.parse(readFileSync(join(root, "data", name), "utf8"));

const businesses = load("businesses.json");
const industries = load("industries.json");
const events = load("events.json");
const cards = load("cards.json");
const stocks = load("stocks.json");
const synergies = load("synergies.json");

function assertUniqueIds(items, label) {
  const ids = items.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length, `${label} ids must be unique`);
  assert.ok(ids.every(Boolean), `${label} ids must not be empty`);
}

test("all content collections have unique ids", () => {
  [
    [businesses, "business"],
    [industries, "industry"],
    [events, "event"],
    [cards, "card"],
    [stocks, "stock"],
    [synergies, "synergy"]
  ].forEach(([items, label]) => assertUniqueIds(items, label));
});

test("businesses reference valid industries and contain sane economy values", () => {
  const industryIds = new Set(industries.map((item) => item.id));
  businesses.forEach((business) => {
    assert.ok(industryIds.has(business.industry), `${business.id} has an unknown industry`);
    assert.ok(business.cost > 0, `${business.id} cost must be positive`);
    assert.ok(business.revenue >= 0, `${business.id} revenue must not be negative`);
    assert.ok(business.expense >= 0, `${business.id} expense must not be negative`);
    assert.ok(business.max_level >= 1, `${business.id} max level must be at least one`);
    assert.ok(business.risk >= 0 && business.risk <= 1, `${business.id} risk must be between zero and one`);
  });
});

test("events, cards, and synergies have valid references", () => {
  const businessIds = new Set(businesses.map((item) => item.id));
  const industryIds = new Set(industries.map((item) => item.id));

  events.forEach((event) => {
    assert.ok(event.weight > 0, `${event.id} weight must be positive`);
    assert.ok(event.choices?.length > 0, `${event.id} must have choices`);
    event.allowed_industries?.forEach((industry) => {
      assert.ok(industryIds.has(industry), `${event.id} references unknown industry ${industry}`);
    });
  });

  cards.forEach((card) => assert.ok((card.cost ?? 0) >= 0, `${card.id} cost must not be negative`));
  synergies.forEach((synergy) => synergy.requires.forEach((businessId) => {
    assert.ok(businessIds.has(businessId), `${synergy.id} references unknown business ${businessId}`);
  }));
});

test("stock definitions and logo files are valid", () => {
  stocks.forEach((stock) => {
    assert.ok(stock.price > 0, `${stock.id} price must be positive`);
    assert.ok(stock.volatility >= 0, `${stock.id} volatility must not be negative`);
    assert.ok(stock.dividend_yield >= 0, `${stock.id} dividend yield must not be negative`);
    assert.ok(existsSync(join(root, stock.logo.replace(/^\.\//, ""))), `${stock.id} logo file is missing`);
  });
});

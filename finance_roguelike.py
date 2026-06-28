import json
import random
from dataclasses import dataclass, field
from pathlib import Path


DATA_DIR = Path(__file__).parent / "data"
LOGS_DIR = Path(__file__).parent / "logs"
MAX_TURNS = 10
STARTING_CASH = 12000


@dataclass
class OwnedBusiness:
    business_id: str
    level: int = 1


@dataclass
class Company:
    cash: int = STARTING_CASH
    debt: int = 0
    risk: float = 0.05
    businesses: list[OwnedBusiness] = field(default_factory=list)
    revenue_bonus: float = 0.0
    expense_bonus: float = 0.0


@dataclass
class MacroState:
    interest_rate: float = 0.04
    inflation: float = 0.03
    demand: float = 1.0
    energy_cost: float = 1.0
    credit_availability: float = 1.0
    market_risk: float = 0.05


def load_json(name):
    with open(DATA_DIR / name, "r", encoding="utf-8") as file:
        return json.load(file)


def money(value):
    return f"${value:,.0f}"


def signed_percent(value):
    return f"{value:+.0%}"


def signed_money(value):
    return f"{money(value) if value < 0 else '+' + money(value)}"


class Game:
    def __init__(self):
        self.businesses = {item["id"]: item for item in load_json("businesses.json")}
        self.industries = {item["id"]: item for item in load_json("industries.json")}
        self.events = load_json("events.json")
        self.cards = load_json("cards.json")
        self.synergies = load_json("synergies.json")
        self.company = Company()
        self.macro = MacroState()
        self.turn = 1
        self.run_log = {
            "turns": [],
            "result": None,
        }
        self.validate_content()

    def start(self):
        starter = random.choice(["coffee_shop", "mini_market", "online_media"])
        self.company.businesses.append(OwnedBusiness(starter))
        self.print_section("Finance Roguelike")
        print(f"Started with: {self.businesses[starter]['name']}")
        while self.turn <= MAX_TURNS and not self.is_bankrupt():
            self.play_turn()
            self.turn += 1
        self.show_result()

    def play_turn(self):
        self.print_section(f"Turn {self.turn}/{MAX_TURNS}")
        report = self.calculate_finances()
        self.company.cash += round(report["profit"])
        self.company.risk = max(0.01, min(0.95, self.company.risk + self.macro.market_risk * 0.1))
        turn_log = {
            "turn": self.turn,
            "start_report": self.serialize_report(report),
            "macro_before_event": self.serialize_macro(),
            "event": None,
            "event_choice": None,
            "action": None,
            "end_company": None,
        }
        self.print_report(report)
        if self.is_bankrupt():
            turn_log["end_company"] = self.serialize_company()
            self.run_log["turns"].append(turn_log)
            return
        event_log = self.resolve_event()
        turn_log["event"] = event_log["event"]
        turn_log["event_choice"] = event_log["choice"]
        if self.is_bankrupt():
            turn_log["end_company"] = self.serialize_company()
            self.run_log["turns"].append(turn_log)
            return
        turn_log["action"] = self.player_action()
        turn_log["end_company"] = self.serialize_company()
        self.run_log["turns"].append(turn_log)

    def calculate_finances(self):
        revenue = 0
        expenses = 0
        for owned in self.company.businesses:
            business = self.businesses[owned.business_id]
            level_multiplier = 1 + (owned.level - 1) * 0.45
            demand_factor = 1 + ((self.macro.demand - 1) * business["demand_sensitivity"])
            inflation_revenue = 1 + self.macro.inflation * 0.7
            inflation_expense = 1 + self.macro.inflation
            energy_factor = 1 + ((self.macro.energy_cost - 1) * business["energy_use"])
            revenue += business["revenue"] * level_multiplier * demand_factor * inflation_revenue
            expenses += business["expense"] * level_multiplier * max(0.5, energy_factor) * inflation_expense

        synergy_bonus = self.active_synergy_bonus()
        revenue *= 1 + self.company.revenue_bonus + synergy_bonus["revenue"]
        expenses *= max(0.2, 1 + self.company.expense_bonus + synergy_bonus["expense"])
        interest = self.company.debt * self.macro.interest_rate
        profit = revenue - expenses - interest
        return {
            "revenue": revenue,
            "expenses": expenses,
            "interest": interest,
            "profit": profit,
            "valuation": self.valuation(profit),
        }

    def active_synergy_bonus(self):
        owned_ids = {item.business_id for item in self.company.businesses}
        revenue = 0
        expense = 0
        for synergy in self.synergies:
            if all(item in owned_ids for item in synergy["requires"]):
                revenue += synergy.get("revenue_bonus", 0)
                expense += synergy.get("expense_bonus", 0)
        return {"revenue": revenue, "expense": expense}

    def valuation(self, profit):
        asset_value = sum(self.businesses[item.business_id]["cost"] * (1 + item.level * 0.25) for item in self.company.businesses)
        return self.company.cash + asset_value + max(0, profit * 8) - self.company.debt

    def print_report(self, report):
        self.print_subsection("Company")
        print(f"Cash:       {money(self.company.cash)}")
        print(f"Debt:       {money(self.company.debt)}")
        print(f"Risk:       {self.company.risk:.0%}")
        print(f"Valuation:  {money(report['valuation'])}")
        self.print_subsection("Macro")
        print(f"Rate:       {self.macro.interest_rate:.1%}")
        print(f"Demand:     {self.macro.demand:.2f}")
        print(f"Energy:     {self.macro.energy_cost:.2f}")
        print(f"Market:     {self.macro.market_risk:.0%}")
        self.print_subsection("Turn P&L")
        print(f"Revenue:    {money(report['revenue'])}")
        print(f"Expenses:   {money(report['expenses'])}")
        print(f"Interest:   {money(report['interest'])}")
        print(f"Profit:     {money(report['profit'])}")
        active = self.active_synergies()
        if active:
            self.print_subsection("Synergies")
            print(", ".join(item["name"] for item in active))

    def resolve_event(self):
        event = self.choose_event()
        self.print_subsection(f"Event: {event['title']}")
        print(event["text"])
        for key, value in event.get("effects", {}).items():
            setattr(self.macro, key, max(0.01, getattr(self.macro, key) + value))
        preview = self.describe_effects(event)
        if preview:
            print(f"Preview: {preview}")

        choices = event["choices"]
        for index, choice in enumerate(choices, 1):
            print(f"{index}. {choice['title']}")
            choice_preview = self.describe_effects(choice)
            if choice_preview:
                print(f"   {choice_preview}")
        choice = choices[self.ask_number("Choose", 1, len(choices)) - 1]
        self.apply_choice(choice)
        return {
            "event": event["id"],
            "choice": choice["title"],
        }

    def apply_choice(self, choice):
        self.company.cash += choice.get("cash", 0)
        self.company.debt = max(0, self.company.debt + choice.get("debt", 0))
        self.company.risk = max(0.01, min(0.95, self.company.risk + choice.get("risk", 0)))
        self.company.revenue_bonus += choice.get("revenue_bonus", 0)
        self.company.expense_bonus += choice.get("expense_bonus", 0)

    def player_action(self):
        self.print_subsection("Action")
        print("1. Buy business")
        print("2. Upgrade business")
        print("3. Play decision card")
        print("4. Take loan")
        print("5. Repay debt")
        print("6. Skip")
        print(f"Preview loan: +{money(10000)} cash, +{money(10000)} debt, +3% risk")
        if self.company.debt > 0:
            repay_amount = min(5000, self.company.cash, self.company.debt)
            print(f"Preview repay: -{money(repay_amount)} cash, -{money(repay_amount)} debt")
        action = self.ask_number("Choose", 1, 6)
        if action == 1:
            return self.buy_business()
        elif action == 2:
            return self.upgrade_business()
        elif action == 3:
            return self.play_card()
        elif action == 4:
            amount = 10000
            self.company.cash += amount
            self.company.debt += amount
            self.company.risk += 0.03
            print(f"Took loan: {money(amount)}")
            return {"type": "loan", "amount": amount}
        elif action == 5:
            amount = min(5000, self.company.cash, self.company.debt)
            self.company.cash -= amount
            self.company.debt -= amount
            print(f"Repaid: {money(amount)}")
            return {"type": "repay_debt", "amount": amount}
        return {"type": "skip"}

    def play_card(self):
        options = random.sample(self.cards, k=min(3, len(self.cards)))
        self.print_subsection("Decision Cards")
        for index, card in enumerate(options, 1):
            cost = card.get("cost", 0)
            print(f"{index}. {card['title']} - {money(cost)}")
            print(f"   {card['text']}")
            preview = self.describe_effects(card, include_cost=False)
            if preview:
                print(f"   Preview: {preview}")
        card = options[self.ask_number("Card", 1, len(options)) - 1]
        cost = card.get("cost", 0)
        if self.company.cash < cost:
            print("Not enough cash.")
            return {"type": "card_failed", "reason": "not_enough_cash", "card": card["id"]}
        self.company.cash -= cost
        self.apply_choice(card)
        print(f"Played: {card['title']}")
        return {"type": "card", "card": card["id"], "cost": cost}

    def buy_business(self):
        owned = {item.business_id for item in self.company.businesses}
        available = [item for item in self.businesses.values() if item["id"] not in owned and item["cost"] <= self.company.cash]
        if not available:
            print("No affordable businesses.")
            return {"type": "buy_failed", "reason": "no_affordable_business"}
        available = sorted(available, key=lambda item: item["cost"])[:5]
        self.print_subsection("Buy Business")
        for index, business in enumerate(available, 1):
            print(f"{index}. {business['name']} ({business['industry']}) - {money(business['cost'])}")
            print(f"   Revenue {money(business['revenue'])} | Expense {money(business['expense'])} | Risk {business['risk']:.0%}")
        business = available[self.ask_number("Buy", 1, len(available)) - 1]
        self.company.cash -= business["cost"]
        self.company.businesses.append(OwnedBusiness(business["id"]))
        print(f"Bought: {business['name']}")
        return {"type": "buy_business", "business": business["id"], "cost": business["cost"]}

    def upgrade_business(self):
        upgradeable = []
        for owned in self.company.businesses:
            business = self.businesses[owned.business_id]
            if owned.level < business["max_level"]:
                cost = round(business["cost"] * (0.55 + owned.level * 0.25))
                if cost <= self.company.cash:
                    upgradeable.append((owned, business, cost))
        if not upgradeable:
            print("No affordable upgrades.")
            return {"type": "upgrade_failed", "reason": "no_affordable_upgrade"}
        self.print_subsection("Upgrade Business")
        for index, (_, business, cost) in enumerate(upgradeable, 1):
            print(f"{index}. {business['name']} - {money(cost)}")
            next_level = next(item.level for item, item_business, _ in upgradeable if item_business["id"] == business["id"]) + 1
            print(f"   Next level: L{next_level} | Revenue and expense scale up")
        owned, business, cost = upgradeable[self.ask_number("Upgrade", 1, len(upgradeable)) - 1]
        self.company.cash -= cost
        owned.level += 1
        print(f"Upgraded: {business['name']} to level {owned.level}")
        return {"type": "upgrade_business", "business": business["id"], "level": owned.level, "cost": cost}

    def is_bankrupt(self):
        debt_pressure = self.company.debt > max(10000, self.company.cash * 4)
        return self.company.cash < -5000 or (debt_pressure and random.random() < self.company.risk)

    def active_synergies(self):
        owned_ids = {item.business_id for item in self.company.businesses}
        return [item for item in self.synergies if all(required in owned_ids for required in item["requires"])]

    def validate_content(self):
        business_ids = set(self.businesses)
        industry_ids = set(self.industries)
        for business in self.businesses.values():
            if business["industry"] not in industry_ids:
                raise ValueError(f"Unknown industry: {business['industry']}")
        for synergy in self.synergies:
            missing = [item for item in synergy["requires"] if item not in business_ids]
            if missing:
                raise ValueError(f"Unknown business in synergy {synergy['id']}: {missing}")
        for event in self.events:
            for industry_id in event.get("allowed_industries", []):
                if industry_id not in industry_ids:
                    raise ValueError(f"Unknown industry in event {event['id']}: {industry_id}")

    def choose_event(self):
        eligible = []
        for event in self.events:
            if self.event_allowed(event):
                eligible.append((event, max(1, event.get("weight", 1))))
        if not eligible:
            return random.choice(self.events)
        total_weight = sum(weight for _, weight in eligible)
        roll = random.uniform(0, total_weight)
        current = 0
        for event, weight in eligible:
            current += weight
            if roll <= current:
                return event
        return eligible[-1][0]

    def event_allowed(self, event):
        min_turn = event.get("min_turn", 1)
        max_turn = event.get("max_turn", MAX_TURNS)
        if not (min_turn <= self.turn <= max_turn):
            return False
        min_debt = event.get("min_debt")
        max_debt = event.get("max_debt")
        if min_debt is not None and self.company.debt < min_debt:
            return False
        if max_debt is not None and self.company.debt > max_debt:
            return False
        min_demand = event.get("min_demand")
        max_demand = event.get("max_demand")
        if min_demand is not None and self.macro.demand < min_demand:
            return False
        if max_demand is not None and self.macro.demand > max_demand:
            return False
        min_energy = event.get("min_energy_cost")
        if min_energy is not None and self.macro.energy_cost < min_energy:
            return False
        allowed_industries = event.get("allowed_industries", [])
        if allowed_industries:
            owned_industries = {self.businesses[item.business_id]["industry"] for item in self.company.businesses}
            if not owned_industries.intersection(allowed_industries):
                return False
        return True

    def serialize_macro(self):
        return {
            "interest_rate": round(self.macro.interest_rate, 4),
            "inflation": round(self.macro.inflation, 4),
            "demand": round(self.macro.demand, 4),
            "energy_cost": round(self.macro.energy_cost, 4),
            "credit_availability": round(self.macro.credit_availability, 4),
            "market_risk": round(self.macro.market_risk, 4),
        }

    def serialize_company(self):
        return {
            "cash": self.company.cash,
            "debt": self.company.debt,
            "risk": round(self.company.risk, 4),
            "businesses": [
                {"id": item.business_id, "level": item.level}
                for item in self.company.businesses
            ],
        }

    def serialize_report(self, report):
        return {
            "revenue": round(report["revenue"], 2),
            "expenses": round(report["expenses"], 2),
            "interest": round(report["interest"], 2),
            "profit": round(report["profit"], 2),
            "valuation": round(report["valuation"], 2),
        }

    def save_run_log(self):
        LOGS_DIR.mkdir(exist_ok=True)
        with open(LOGS_DIR / "last_run.json", "w", encoding="utf-8") as file:
            json.dump(self.run_log, file, indent=2)

    def show_result(self):
        report = self.calculate_finances()
        self.run_log["result"] = {
            "completed": not self.is_bankrupt(),
            "final_report": self.serialize_report(report),
            "final_company": self.serialize_company(),
        }
        self.save_run_log()
        self.print_section("Run Result")
        if self.is_bankrupt():
            print("Bankrupt.")
        else:
            print("Run completed.")
        print(f"Final cash: {money(self.company.cash)}")
        print(f"Final debt: {money(self.company.debt)}")
        print(f"Final valuation: {money(report['valuation'])}")
        print(f"Owned businesses: {len(self.company.businesses)}")
        print(f"Active synergies: {len(self.active_synergies())}")
        print(f"Run log: {LOGS_DIR / 'last_run.json'}")
        self.print_subsection("Portfolio")
        for owned in self.company.businesses:
            print(f"- {self.businesses[owned.business_id]['name']} L{owned.level}")
        self.print_subsection("Summary")
        print(f"Best turn profit: {money(self.best_turn_profit())}")
        print(f"Average turn profit: {money(self.average_turn_profit())}")
        print(f"Final risk: {self.company.risk:.0%}")

    def ask_number(self, label, low, high):
        while True:
            raw = input(f"{label} [{low}-{high}]: ").strip()
            if raw.isdigit() and low <= int(raw) <= high:
                return int(raw)
            print("Invalid choice.")

    def print_section(self, title):
        border = "=" * max(24, len(title) + 4)
        print(f"\n{border}")
        print(title)
        print(border)

    def print_subsection(self, title):
        print(f"\n[{title}]")

    def describe_effects(self, source, include_cost=True):
        parts = []
        if include_cost and source.get("cost"):
            parts.append(f"cost {money(source['cost'])}")
        if source.get("cash"):
            parts.append(f"cash {signed_money(source['cash'])}")
        if source.get("debt"):
            parts.append(f"debt {signed_money(source['debt'])}")
        if source.get("risk"):
            parts.append(f"risk {signed_percent(source['risk'])}")
        if source.get("revenue_bonus"):
            parts.append(f"revenue {signed_percent(source['revenue_bonus'])}")
        if source.get("expense_bonus"):
            parts.append(f"expenses {signed_percent(source['expense_bonus'])}")
        for field, label in (
            ("interest_rate", "rate"),
            ("inflation", "inflation"),
            ("demand", "demand"),
            ("energy_cost", "energy"),
            ("credit_availability", "credit"),
            ("market_risk", "market risk"),
        ):
            if source.get(field):
                parts.append(f"{label} {signed_percent(source[field])}")
        return " | ".join(parts)

    def best_turn_profit(self):
        profits = [turn["start_report"]["profit"] for turn in self.run_log["turns"]]
        return max(profits, default=0)

    def average_turn_profit(self):
        profits = [turn["start_report"]["profit"] for turn in self.run_log["turns"]]
        if not profits:
            return 0
        return sum(profits) / len(profits)


if __name__ == "__main__":
    Game().start()

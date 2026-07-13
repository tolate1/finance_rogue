import { clearRunState, loadRunState, saveRunState } from "./src/persistence.js";
import {
  RUN_DIFFICULTIES,
  RUN_SCENARIOS,
  applyDifficultyToDebtThreshold,
  applyDifficultyToKnowledgeReward,
  createRunConfiguration,
  difficultyById,
  scenarioById
} from "./src/engine/run-config.js";

const MAX_TURNS = 10;
const STARTING_CASH = 12000;
const LANGUAGE_KEY = "financeRoguelike.language";
const META_KEY = "financeRoguelike.meta";
const RUN_KEY = "financeRoguelike.currentRun";
const STARTING_UNLOCKED_INDUSTRIES = ["retail", "it", "logistics", "manufacturing"];
const ADVANCED_FINANCE_CARD_IDS = ["fixed_rate", "bridge_loan", "repay_package", "refinance"];
const META_UNLOCKS = [
  { id: "unlock_real_estate", titleKey: "unlockRealEstate", descriptionKey: "unlockRealEstateDesc", cost: 10, type: "industry", category: "real_estate", payload: { industry: "real_estate" } },
  { id: "unlock_media", titleKey: "unlockMedia", descriptionKey: "unlockMediaDesc", cost: 12, type: "industry", category: "business", payload: { industry: "media" } },
  { id: "unlock_advanced_finance_cards", titleKey: "unlockAdvancedFinanceCards", descriptionKey: "unlockAdvancedFinanceCardsDesc", cost: 15, type: "cards", category: "economy", payload: { cards: ADVANCED_FINANCE_CARD_IDS } },
  { id: "unlock_energy_sector", titleKey: "unlockEnergySector", descriptionKey: "unlockEnergySectorDesc", cost: 18, type: "industry", category: "business", payload: { industry: "energy" } },
  { id: "unlock_extra_cash", titleKey: "unlockExtraCash", descriptionKey: "unlockExtraCashDesc", cost: 20, type: "starting_bonus", category: "start_bonus", payload: { extraCash: 5000 } },
  { id: "unlock_lower_debt_risk", titleKey: "unlockLowerDebtRisk", descriptionKey: "unlockLowerDebtRiskDesc", cost: 25, type: "starting_bonus", category: "economy", payload: { debtThresholdBonus: 5000 } },
  { id: "unlock_synergy_scanner", titleKey: "unlockSynergyScanner", descriptionKey: "unlockSynergyScannerDesc", cost: 12, type: "feature", category: "assets", payload: { synergyScanner: true } },
  { id: "unlock_extended_run", titleKey: "unlockExtendedRun", descriptionKey: "unlockExtendedRunDesc", cost: 18, type: "run_bonus", category: "meta", payload: { extraTurns: 2 }, repeatable: true, maxLevel: 5, costScaling: 1.25 }
];

const translations = {
  en: {
    gameTitle: "Finance Roguelike",
    chooseLanguage: "Choose language",
    russian: "Russian",
    english: "English",
    currentRun: "Current Run",
    turn: "Turn",
    cash: "Cash",
    profit: "Profit",
    debt: "Debt",
    valuation: "Valuation",
    dashboard: "Dashboard",
    decisions: "Decisions",
    portfolio: "Portfolio",
    market: "Market",
    stocks: "Stocks",
    economy: "Economy",
    nextTurn: "Next",
    reset: "Reset",
    language: "Language",
    resolveEventBeforeNextTurn: "Resolve the event before next turn",
    eventPending: "Event pending",
    actionPending: "Action pending",
    currentTurnStatus: "Turn {turn} of {maxTurns}",
    runFinishedAtTurn: "Run finished at turn {turn}",
    dashboardSubtitle: "Overview only. This screen explains the run at a glance.",
    decisionsSubtitle: "Resolve the current event here. One event choice only.",
    portfolioSubtitle: "Owned assets, upgrades, and synergy progress.",
    marketSubtitle: "Buy new businesses here. Market stays separate from overview.",
    economySubtitle: "Macro regime, recent history, and sector hints.",
    whatNeedsAttention: "What needs attention now",
    runComplete: "Run complete",
    eventResolved: "Event resolved",
    eventPendingShort: "Event pending",
    actionDone: "Action done",
    actionPendingShort: "Action pending",
    macroRegime: "Macro Regime",
    runSnapshot: "Run Snapshot",
    currentEvent: "Current Event",
    actionCards: "Action Cards",
    temporaryEffects: "Temporary Effects",
    activeSynergies: "Active Synergies",
    almostReady: "Almost ready",
    noActiveSynergies: "No active synergies yet.",
    noBusinessesMatchFilter: "No businesses match this filter.",
    noBusinessesMatchMarketFilter: "No businesses match this market filter.",
    all: "All",
    allIndustries: "All Industries",
    allRisk: "All Risk",
    lowRisk: "Low Risk",
    midRisk: "Mid Risk",
    highRisk: "High Risk",
    tech: "Tech",
    realEstate: "Real Estate",
    industry: "Industry",
    energy: "Energy",
    retail: "Retail",
    finance: "Finance",
    media: "Media",
    logistics: "Logistics",
    offers: "offers",
    level: "Level",
    revenue: "Revenue",
    expenses: "Expenses",
    risk: "Risk",
    upgrade: "Upgrade",
    sell: "Sell",
    buy: "Buy",
    expectedProfit: "Expected Profit",
    macroSensitivity: "Macro Sensitivity",
    synergyHooks: "Synergy Hooks",
    industryLabel: "Industry",
    recentEvents: "Recent Events",
    whoWinsAndLoses: "Who wins and loses",
    positive: "Positive",
    negative: "Negative",
    noCost: "No cost",
    strategicShift: "Strategic shift",
    lower: "Lower",
    neutral: "Neutral",
    medium: "Medium",
    high: "High",
    decisionLocked: "Decision locked. Take one move, then advance.",
    nextTurnReady: "Next Turn is ready.",
    resolveEventThenAction: "Resolve the event before taking an action.",
    chooseAction: "Pick one action below.",
    chooseLanguageLater: "Change language without resetting the current run.",
    actionCompleted: "Action completed",
    runStarted: "Run started",
    runRestored: "Saved run restored",
    choiceSelected: "Choice selected",
    boughtBusiness: "Bought {name}",
    upgradedBusiness: "Upgraded {name} to L{level}",
    soldBusiness: "Sold {name} for {value}",
    cardPlayed: "Card played: {name}",
    runEndedInsolvency: "Run ended in insolvency.",
    runCompletedSuccessfully: "Run completed successfully.",
    finalValuation: "Final valuation: {value}",
    debtPressureBrokeCompany: "Debt pressure broke the company.",
    startingAsset: "Starting asset: {name}",
    noLongDashboard: "No long dashboard. One active tab at a time.",
    cashBuffer: "Cash buffer {cash}, debt load {debt}, projected turn profit {profit}.",
    changeLanguage: "Change language",
    close: "Close",
    rate: "Interest Rate",
    inflation: "Inflation",
    demand: "Demand",
    energyCost: "Energy Cost",
    creditAvailability: "Credit Availability",
    marketRisk: "Market Risk",
    balancedExpansion: "Balanced Expansion",
    balancedExpansionDesc: "No strong macro stress. Portfolio construction matters most.",
    energyCrisis: "Energy Crisis",
    energyCrisisDesc: "Energy and transport margins are under pressure.",
    highRateSqueeze: "High Rate Squeeze",
    highRateSqueezeDesc: "Capital is expensive and debt-heavy growth gets punished.",
    inflationShock: "Inflation Shock",
    inflationShockDesc: "Topline rises, but cost control matters even more.",
    recession: "Recession",
    recessionDesc: "Consumers slow down and cash discipline matters.",
    cheapCreditBoom: "Cheap Credit Boom",
    cheapCreditBoomDesc: "Expansion is cheap and aggressive scaling works.",
    growthPlays: "growth plays",
    idleCash: "idle cash",
    slowOperators: "slow operators",
    diversifiedPortfolios: "diversified portfolios",
    synergyStacks: "synergy stacks",
    singleAssetRuns: "single-asset runs",
    leveragedExpansion: "leveraged expansion",
    pricingPower: "pricing power",
    efficientOperators: "efficient operators",
    cashLabel: "cash",
    defensiveBusinesses: "defensive businesses",
    realEstateBusinesses: "real estate",
    speculativeAssets: "speculative assets",
    transport: "logistics",
    manufacturingBusinesses: "manufacturing",
    consumerBusiness: "Consumer-facing business with demand exposure.",
    scalableUpside: "Scalable digital upside with higher volatility.",
    infrastructurePlay: "Infrastructure play with energy sensitivity.",
    defensiveAsset: "Defensive asset against cost shocks.",
    audienceBusiness: "Audience business with fast swings.",
    longDurationAsset: "Long-duration asset tied to rates.",
    standalone: "Standalone",
    rates: "rates",
    balanced: "balanced",
    lowRiskBucket: "Low risk",
    midRiskBucket: "Mid risk",
    highRiskBucket: "High risk",
    rateInsightLow: "Funding remains manageable.",
    rateInsightHigh: "Debt-heavy growth is under pressure.",
    inflationInsightLow: "Inflation is not the main threat.",
    inflationInsightHigh: "Pricing helps, but costs climb faster.",
    demandInsightLow: "Consumers are pulling back.",
    demandInsightHigh: "Demand still supports expansion.",
    energyInsightLow: "Operating costs stay contained.",
    energyInsightHigh: "Transport and factories lose margin.",
    creditInsightLow: "Credit is selective.",
    creditInsightHigh: "Expansion financing is accessible.",
    marketRiskInsightLow: "Background volatility is moderate.",
    marketRiskInsightHigh: "Risky lines can collapse quickly.",
    metaProgress: "Prestige",
    knowledge: "Knowledge",
    knowledgeEarned: "Knowledge Earned",
    completedRuns: "Completed Runs",
    bestValuation: "Best Valuation",
    bestTurnReached: "Best Turn Reached",
    turnReached: "Turn Reached",
    unlock: "Unlock",
    locked: "Locked",
    unlocked: "Unlocked",
    newRun: "New Run",
    backToDashboard: "Back to Dashboard",
    runEndTitle: "Run Complete",
    completedAllTurns: "Completed all turns",
    bankruptcy: "Bankruptcy",
    debtCollapse: "Debt Collapse",
    unlockInMetaProgression: "Unlock in Meta Progression",
    metaSubtitle: "Persistent progress between runs. Spend knowledge on new sectors and bonuses.",
    runEndSubtitle: "This reward is granted once per completed run.",
    finalCash: "Final Cash",
    finalDebt: "Final Debt",
    finalProfit: "Final Profit",
    finalValuationLabel: "Final Valuation",
    completionReason: "Completion Reason",
    resetMeta: "Reset Meta",
    resetMetaConfirm: "Meta progression reset.",
    noUnlocksYet: "No unlocks purchased yet.",
    availableUnlocks: "Available Unlocks",
    purchasedUnlocks: "Purchased Unlocks",
    rewardAlreadyClaimed: "Reward already claimed.",
    unlockPurchased: "Unlock purchased",
    notEnoughKnowledge: "Not enough Knowledge.",
    unlockRealEstate: "Unlock Real Estate",
    unlockRealEstateDesc: "Unlocks real estate businesses in Market.",
    unlockMedia: "Unlock Media",
    unlockMediaDesc: "Unlocks media businesses in Market.",
    unlockAdvancedFinanceCards: "Unlock Advanced Finance Cards",
    unlockAdvancedFinanceCardsDesc: "Adds debt, rates, and refinancing decision cards.",
    unlockEnergySector: "Unlock Energy Sector",
    unlockEnergySectorDesc: "Unlocks energy businesses in Market.",
    unlockExtraCash: "Starting Bonus: Extra Cash",
    unlockExtraCashDesc: "New runs start with +$5,000 cash.",
    unlockLowerDebtRisk: "Starting Bonus: Lower Debt Risk",
    unlockLowerDebtRiskDesc: "Debt pressure threshold becomes slightly safer.",
    unlockSynergyScanner: "Unlock Synergy Scanner",
    unlockSynergyScannerDesc: "Portfolio shows almost-complete synergies more clearly.",
    unlockExtendedRun: "Extended Mandate",
    unlockExtendedRunDesc: "New runs last 2 extra turns.",
    metaUnlockedContent: "Unlocked Content",
    devValidationPassed: "Game data validation passed.",
    highOutputAsset: "High-output operator with heavy cost exposure.",
    resolveEventThenChooseAction: "Resolve the event first, then choose one action.",
    turnProgress: "Turn Progress",
    eventStep: "Event",
    actionStep: "Action",
    completed: "Completed",
    active: "Active",
    pending: "Pending",
    actionSelected: "Action selected",
    actionNotSelected: "Action not selected",
    nextTurnLocked: "Next Turn locked",
    turnReadyToAdvance: "Turn ready to advance",
    currentEventPanel: "Current Event",
    turnAction: "Turn Action",
    effectLabel: "Effect",
    riskLabelTitle: "Risk",
    select: "Select",
    chooseCategory: "Choose one action category.",
    buyAsset: "Buy Asset",
    upgradeAsset: "Upgrade Asset",
    sellAsset: "Sell Asset",
    playCardAction: "Play Card",
    eventResolvedPanel: "Event resolved",
    actionPanelLocked: "Action unlocks after the event choice.",
    actionCategoryBuyHint: "Pick one new business to add this turn.",
    actionCategoryUpgradeHint: "Upgrade one owned business this turn.",
    actionCategorySellHint: "Sell one owned business for liquidity.",
    actionCategoryCardsHint: "Play one decision card this turn.",
    turnShort: "Turn",
    cashShort: "Cash",
    marketReady: "Can buy 1 asset",
    portfolioReady: "Can manage assets",
    economyWatch: "Macro watch",
    eventNeedsDecision: "Event unresolved",
    swipeMoreOptions: "Swipe to see more options",
    selected: "Selected",
    chooseOption: "Choose option",
    eventCompleted: "Event completed",
    actionActiveLabel: "Action active",
    lastsTurns: "for {turns} turns",
    resolveEventCta: "Resolve Event",
    openDecisions: "Open Decisions",
    chooseActionType: "Choose one action type.",
    back: "Back",
    repayDebt: "Repay Debt",
    repayDebtHint: "Use cash to reduce debt and risk.",
    repayQuarter: "Repay 25%",
    repayHalf: "Repay 50%",
    repayAll: "Repay All",
    debtCleared: "Debt cleared",
    debtPayment: "Debt payment"
    ,
    marketBusinesses: "Private Assets",
    marketStocks: "Stock Market",
    businessesCategory: "Businesses",
    realEstateCategory: "Real Estate",
    stockMarketCategory: "Stock Market",
    businessesCategoryDesc: "Buy companies and scale operating income.",
    realEstateCategoryDesc: "Buy properties for steady passive income.",
    stockMarketCategoryDesc: "Trade public equities and manage positions.",
    chooseAssetType: "Choose asset type",
    backToMarket: "Back to market",
    turnActionBuyOneAsset: "Turn action: buy one asset",
    assetPurchased: "Asset purchased",
    turnActionCompletedLabel: "Turn action completed",
    backToDecisions: "Back to Decisions",
    actionAlreadyCompleted: "Action already completed",
    shares: "Shares",
    price: "Price",
    sector: "Sector",
    buyShares: "Buy Shares",
    sellShares: "Sell Shares",
    stockCycle: "Market Cycle",
    momentum: "Momentum",
    dividend: "Dividend",
    availableCash: "Available Cash",
    yourPosition: "Your Position",
    buyPower: "Buy Power",
    sellPosition: "Sell Position",
    maxBuy: "Max buy",
    maxSell: "Max sell",
    boughtShares: "Bought {count} shares",
    soldShares: "Sold {count} shares",
    tapOrDrag: "Tap or drag to choose amount",
    openChart: "Open chart",
    ownedShares: "Owned: {count}",
    thisTurn: "this turn",
    valueLabel: "Value",
    amountLabel: "Amount",
    stockDetails: "Stock details",
    noPosition: "No position yet.",
    closeSheet: "Close",
    chartRange: "Price range",
    averagePrice: "Avg. cost",
    turnChange: "Turn change",
    repayDebtTile: "Debt Desk",
    positionValue: "Position value",
    profitLoss: "Profit / loss",
    dividendIncome: "Dividend income",
    dividendPerTurn: "Per turn",
    dividendIncomePerTurn: "Dividend income: {value} this turn",
    noDividendIncome: "This stock does not pay dividends",
    peRatioLabel: "P/E",
    valuationLabel: "Valuation",
    cheapValuation: "Cheap",
    fairValuation: "Fair",
    expensiveValuation: "Expensive",
    confirmBuy: "Confirm buy",
    confirmSell: "Confirm sell",
    dragToChooseAmount: "Drag to choose amount",
    lastIterations: "Last 100 iterations",
    growthStock: "Growth",
    dividendStock: "Dividend",
    stockTypeLabel: "Type",
    dividendYieldLabel: "Dividend yield",
    priceHistoryEmpty: "No price history yet.",
    turnLabelShort: "Turn",
    currentPriceLabel: "Current price",
    allFilter: "All",
    availableFilter: "Available",
    purchasedFilter: "Purchased",
    assetsCategory: "Assets",
    businessCategory: "Business",
    realEstateCategoryShort: "Real Estate",
    marketCategoryShort: "Market",
    economyCategoryShort: "Economy",
    startCategoryShort: "Start",
    metaCategoryShort: "Meta",
    statusClosed: "Closed",
    statusAvailable: "Available",
    statusOpened: "Opened",
    statusUpgradable: "Upgradable",
    statusMax: "Max",
    statusNoKnowledge: "Not enough Knowledge",
    upgradeAction: "Upgrade",
    unavailableAction: "Unavailable",
    maxAction: "Max.",
    currentEffectLabel: "Current effect",
    nextEffectLabel: "Next level",
    costLabel: "Cost",
    statusLabel: "Status",
    levelProgressLabel: "Level",
    repeatableLabel: "Repeatable",
    nextRunLengthLabel: "Next run length",
    confirmResetMeta: "Reset all prestige progress?",
    noMetaItemsMatchFilter: "No prestige upgrades match this filter.",
    stockRising: "Stock rising",
    stockFalling: "Stock falling",
    stockNeutral: "Neutral",
    newRunSetup: "New Run",
    newRunSetupDesc: "Choose the opening position and how much pressure the run should apply.",
    chooseScenario: "Starting scenario",
    chooseDifficulty: "Difficulty",
    startConfiguredRun: "Start run",
    cancelSetup: "Keep current run",
    scenarioLabel: "Scenario",
    difficultyLabel: "Difficulty",
    scenarioBalancedTitle: "Balanced Start",
    scenarioBalancedDesc: "A classic opening with one random operating business and no debt.",
    scenarioLeveragedTitle: "Leveraged Growth",
    scenarioLeveragedDesc: "Start with a SaaS business, extra liquidity, and dangerous debt pressure.",
    scenarioTraderTitle: "Market Trader",
    scenarioTraderDesc: "Start with a tech business and an Aplix stock position in a more volatile market.",
    difficultyRelaxedTitle: "Relaxed",
    difficultyRelaxedDesc: "More cash, lower risk, and a safer debt threshold. Prestige rewards are reduced.",
    difficultyNormalTitle: "Normal",
    difficultyNormalDesc: "The intended balance for the main game.",
    difficultyHardTitle: "Hard",
    difficultyHardDesc: "Less cash, higher risk, and faster debt collapse. Prestige rewards are increased.",
    setupCash: "Starting cash",
    setupDebt: "Starting debt",
    setupRisk: "Starting risk",
    setupReward: "Prestige reward",
    setupRewardReduced: "×0.75",
    setupRewardNormal: "×1.00",
    setupRewardIncreased: "×1.25",
    startingConfiguration: "{scenario} · {difficulty}"
  },
  ru: {
    gameTitle: "Finance Roguelike",
    chooseLanguage: "Выберите язык",
    russian: "Русский",
    english: "English",
    currentRun: "Текущая партия",
    turn: "Ход",
    cash: "Деньги",
    profit: "Прибыль",
    debt: "Долг",
    valuation: "Оценка",
    dashboard: "Обзор",
    decisions: "Решения",
    portfolio: "Портфель",
    market: "Рынок",
    stocks: "Акции",
    economy: "Экономика",
    nextTurn: "Следующий",
    reset: "Сброс",
    language: "Язык",
    resolveEventBeforeNextTurn: "Решите событие перед следующим ходом",
    eventPending: "Событие не решено",
    actionPending: "Действие не выбрано",
    currentTurnStatus: "Ход {turn} из {maxTurns}",
    runFinishedAtTurn: "Партия завершена на ходу {turn}",
    dashboardSubtitle: "Только обзор. Этот экран объясняет состояние партии с первого взгляда.",
    decisionsSubtitle: "Здесь решается текущее событие. Только один выбор события.",
    portfolioSubtitle: "Ваши активы, улучшения и прогресс синергий.",
    marketSubtitle: "Покупка новых бизнесов. Рынок отделен от обзора.",
    economySubtitle: "Макро-режим, история и подсказки по секторам.",
    whatNeedsAttention: "Что важно прямо сейчас",
    runComplete: "Партия завершена",
    eventResolved: "Событие решено",
    eventPendingShort: "Событие не решено",
    actionDone: "Действие сделано",
    actionPendingShort: "Действие не выбрано",
    macroRegime: "Макро-режим",
    runSnapshot: "Снимок партии",
    currentEvent: "Текущее событие",
    actionCards: "Карты действий",
    temporaryEffects: "Временные эффекты",
    activeSynergies: "Активные синергии",
    almostReady: "Почти собрано",
    noActiveSynergies: "Пока нет активных синергий.",
    noBusinessesMatchFilter: "Нет бизнесов под этот фильтр.",
    noBusinessesMatchMarketFilter: "Нет предложений под этот фильтр рынка.",
    all: "Все",
    allIndustries: "Все отрасли",
    allRisk: "Любой риск",
    lowRisk: "Низкий риск",
    midRisk: "Средний риск",
    highRisk: "Высокий риск",
    tech: "Тех",
    realEstate: "Недвижимость",
    industry: "Промышленность",
    energy: "Энергия",
    retail: "Ритейл",
    finance: "Финансы",
    media: "Медиа",
    logistics: "Логистика",
    offers: "предложений",
    level: "Уровень",
    revenue: "Доход",
    expenses: "Расходы",
    risk: "Риск",
    upgrade: "Улучшить",
    sell: "Продать",
    buy: "Купить",
    expectedProfit: "Ожидаемая прибыль",
    macroSensitivity: "Чувствительность к макро",
    synergyHooks: "Синергии",
    industryLabel: "Отрасль",
    recentEvents: "Последние события",
    whoWinsAndLoses: "Кто выигрывает и проигрывает",
    positive: "Плюс",
    negative: "Минус",
    noCost: "Без стоимости",
    strategicShift: "Стратегический сдвиг",
    lower: "Ниже",
    neutral: "Нейтрально",
    medium: "Средний",
    high: "Высокий",
    decisionLocked: "Выбор зафиксирован. Сделайте одно действие и переходите к следующему ходу.",
    nextTurnReady: "Следующий ход готов.",
    resolveEventThenAction: "Решите событие перед действием.",
    chooseAction: "Выберите одно действие ниже.",
    chooseLanguageLater: "Сменить язык без сброса текущей партии.",
    actionCompleted: "Действие выполнено",
    runStarted: "Партия началась",
    runRestored: "Сохранённая партия восстановлена",
    choiceSelected: "Выбран вариант",
    boughtBusiness: "Куплен {name}",
    upgradedBusiness: "{name} улучшен до ур. {level}",
    soldBusiness: "{name} продан за {value}",
    cardPlayed: "Разыграна карта: {name}",
    runEndedInsolvency: "Партия закончилась из-за неплатежеспособности.",
    runCompletedSuccessfully: "Партия успешно завершена.",
    finalValuation: "Итоговая оценка: {value}",
    debtPressureBrokeCompany: "Долговое давление сломало компанию.",
    startingAsset: "Стартовый актив: {name}",
    noLongDashboard: "Без длинной прокрутки. Только одна активная вкладка.",
    cashBuffer: "Подушка денег {cash}, долг {debt}, прибыль хода {profit}.",
    changeLanguage: "Сменить язык",
    close: "Закрыть",
    rate: "Ставка",
    inflation: "Инфляция",
    demand: "Спрос",
    energyCost: "Цена энергии",
    creditAvailability: "Доступность кредита",
    marketRisk: "Рыночный риск",
    balancedExpansion: "Сбалансированный рост",
    balancedExpansionDesc: "Сильного макро-стресса нет. Важнее сборка портфеля.",
    energyCrisis: "Энергокризис",
    energyCrisisDesc: "Маржа энергии и транспорта под давлением.",
    highRateSqueeze: "Давление высоких ставок",
    highRateSqueezeDesc: "Капитал дорогой, а рост на долге наказывается.",
    inflationShock: "Инфляционный шок",
    inflationShockDesc: "Выручка растет, но контроль расходов еще важнее.",
    recession: "Рецессия",
    recessionDesc: "Потребители замедляются, важна дисциплина по кэшу.",
    cheapCreditBoom: "Бум дешевого кредита",
    cheapCreditBoomDesc: "Расширяться дешево, агрессивный рост работает.",
    growthPlays: "ростовые активы",
    idleCash: "простой кэш",
    slowOperators: "медленные операторы",
    diversifiedPortfolios: "диверсифицированные портфели",
    synergyStacks: "сборки синергий",
    singleAssetRuns: "забеги в один актив",
    leveragedExpansion: "рост на долге",
    pricingPower: "сильное ценообразование",
    efficientOperators: "эффективные операторы",
    cashLabel: "кэш",
    defensiveBusinesses: "защитные бизнесы",
    realEstateBusinesses: "недвижимость",
    speculativeAssets: "спекулятивные активы",
    transport: "логистика",
    manufacturingBusinesses: "производство",
    consumerBusiness: "Потребительский бизнес с зависимостью от спроса.",
    scalableUpside: "Цифровой рост с более высокой волатильностью.",
    infrastructurePlay: "Инфраструктурный актив с чувствительностью к энергии.",
    defensiveAsset: "Защитный актив против шока затрат.",
    audienceBusiness: "Медиа-бизнес с быстрыми колебаниями аудитории.",
    longDurationAsset: "Длинный актив, завязанный на ставках.",
    standalone: "Самостоятельно",
    rates: "ставки",
    balanced: "сбалансированно",
    lowRiskBucket: "Низкий риск",
    midRiskBucket: "Средний риск",
    highRiskBucket: "Высокий риск",
    rateInsightLow: "Финансирование пока остается управляемым.",
    rateInsightHigh: "Рост на долге под давлением.",
    inflationInsightLow: "Инфляция не главный риск.",
    inflationInsightHigh: "Цены помогают, но расходы растут быстрее.",
    demandInsightLow: "Потребители сокращают траты.",
    demandInsightHigh: "Спрос пока поддерживает рост.",
    energyInsightLow: "Операционные затраты остаются под контролем.",
    energyInsightHigh: "Логистика и фабрики теряют маржу.",
    creditInsightLow: "Кредит выдают осторожно.",
    creditInsightHigh: "Финансирование расширения доступно.",
    marketRiskInsightLow: "Фоновая волатильность умеренная.",
    marketRiskInsightHigh: "Рискованные линии могут резко просесть.",
    metaProgress: "Престиж",
    knowledge: "Знания",
    knowledgeEarned: "Получено знаний",
    completedRuns: "Завершённые партии",
    bestValuation: "Лучшая оценка",
    bestTurnReached: "Лучший достигнутый ход",
    turnReached: "Достигнутый ход",
    unlock: "Открыть",
    locked: "Закрыто",
    unlocked: "Открыто",
    newRun: "Новая партия",
    backToDashboard: "Назад к обзору",
    runEndTitle: "Партия завершена",
    completedAllTurns: "Пройдены все ходы",
    bankruptcy: "Банкротство",
    debtCollapse: "Долговой крах",
    unlockInMetaProgression: "Откройте в мета-прогрессии",
    metaSubtitle: "Постоянный прогресс между партиями. Тратьте знания на новые секторы и бонусы.",
    runEndSubtitle: "Эта награда выдаётся один раз за каждую партию.",
    finalCash: "Итоговые деньги",
    finalDebt: "Итоговый долг",
    finalProfit: "Итоговая прибыль",
    finalValuationLabel: "Итоговая оценка",
    completionReason: "Причина завершения",
    resetMeta: "Сбросить мета-прогресс",
    resetMetaConfirm: "Мета-прогресс сброшен.",
    noUnlocksYet: "Пока нет купленных открытий.",
    availableUnlocks: "Доступные открытия",
    purchasedUnlocks: "Купленные открытия",
    rewardAlreadyClaimed: "Награда уже начислена.",
    unlockPurchased: "Открытие куплено",
    notEnoughKnowledge: "Не хватает Знаний.",
    unlockRealEstate: "Открыть недвижимость",
    unlockRealEstateDesc: "Открывает бизнесы недвижимости на рынке.",
    unlockMedia: "Открыть медиа",
    unlockMediaDesc: "Открывает медиа-бизнесы на рынке.",
    unlockAdvancedFinanceCards: "Открыть продвинутые финкарты",
    unlockAdvancedFinanceCardsDesc: "Добавляет карты про долг, ставки и refinance.",
    unlockEnergySector: "Открыть энергетику",
    unlockEnergySectorDesc: "Открывает энергетические бизнесы на рынке.",
    unlockExtraCash: "Стартовый бонус: доп. кэш",
    unlockExtraCashDesc: "Новые партии начинаются с +$5,000.",
    unlockLowerDebtRisk: "Стартовый бонус: ниже долговой риск",
    unlockLowerDebtRiskDesc: "Порог долгового давления становится чуть мягче.",
    unlockSynergyScanner: "Открыть сканер синергий",
    unlockSynergyScannerDesc: "Портфель лучше показывает почти собранные синергии.",
    unlockExtendedRun: "Расширить мандат",
    unlockExtendedRunDesc: "Новые партии идут на 2 хода дольше.",
    metaUnlockedContent: "Открытый контент",
    devValidationPassed: "Проверка игровых данных пройдена.",
    highOutputAsset: "Производительный актив с высокой чувствительностью к затратам.",
    resolveEventThenChooseAction: "Сначала решите событие, затем выберите одно действие.",
    turnProgress: "Прогресс хода",
    eventStep: "Событие",
    actionStep: "Действие",
    completed: "Выполнено",
    active: "Активно",
    pending: "Ожидание",
    actionSelected: "Действие выполнено",
    actionNotSelected: "Действие не выполнено",
    nextTurnLocked: "Следующий ход недоступен",
    turnReadyToAdvance: "Ход готов к завершению",
    currentEventPanel: "Текущее событие",
    turnAction: "Действие хода",
    effectLabel: "Эффект",
    riskLabelTitle: "Риск",
    select: "Выбрать",
    chooseCategory: "Выберите одну категорию действия.",
    buyAsset: "Купить актив",
    upgradeAsset: "Улучшить актив",
    sellAsset: "Продать актив",
    playCardAction: "Сыграть карту",
    eventResolvedPanel: "Событие решено",
    actionPanelLocked: "Действие откроется после выбора по событию.",
    actionCategoryBuyHint: "Выберите один новый бизнес на этот ход.",
    actionCategoryUpgradeHint: "Улучшите один свой бизнес на этот ход.",
    actionCategorySellHint: "Продайте один бизнес для ликвидности.",
    actionCategoryCardsHint: "Сыграйте одну карту действия на этот ход.",
    turnShort: "Ход",
    cashShort: "Деньги",
    marketReady: "Можно купить 1 актив",
    portfolioReady: "Можно управлять активами",
    economyWatch: "Наблюдение за макро",
    eventNeedsDecision: "\u0421\u043e\u0431\u044b\u0442\u0438\u0435 \u043d\u0435 \u0440\u0435\u0448\u0435\u043d\u043e",
    swipeMoreOptions: "\u0421\u0432\u0430\u0439\u043f\u043d\u0438\u0442\u0435, \u0447\u0442\u043e\u0431\u044b \u0443\u0432\u0438\u0434\u0435\u0442\u044c \u0434\u0440\u0443\u0433\u0438\u0435 \u0432\u0430\u0440\u0438\u0430\u043d\u0442\u044b",
    selected: "\u0412\u044b\u0431\u0440\u0430\u043d\u043e",
    chooseOption: "\u0412\u044b\u0431\u0440\u0430\u0442\u044c \u0432\u0430\u0440\u0438\u0430\u043d\u0442",
    eventCompleted: "\u0421\u043e\u0431\u044b\u0442\u0438\u0435 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u043e",
    actionActiveLabel: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u0430\u043a\u0442\u0438\u0432\u043d\u043e",
    lastsTurns: "\u043d\u0430 {turns} \u0445\u043e\u0434\u0430",
    resolveEventCta: "Решить событие",
    openDecisions: "Открыть решения",
    chooseActionType: "Выберите один тип действия.",
    back: "Назад",
    repayDebt: "Погасить долг",
    repayDebtHint: "Используйте деньги, чтобы снизить долг и риск.",
    repayQuarter: "Погасить 25%",
    repayHalf: "Погасить 50%",
    repayAll: "Погасить всё",
    debtCleared: "Долг погашен",
    debtPayment: "Платёж по долгу"
    ,
    marketBusinesses: "Частные активы",
    marketStocks: "Фондовый рынок",
    businessesCategory: "Бизнесы",
    realEstateCategory: "Недвижимость",
    stockMarketCategory: "Биржа",
    businessesCategoryDesc: "Покупайте компании и развивайте доход.",
    realEstateCategoryDesc: "Покупайте объекты с пассивным доходом.",
    stockMarketCategoryDesc: "Покупайте и продавайте акции.",
    chooseAssetType: "Выберите тип актива",
    backToMarket: "Назад к рынку",
    turnActionBuyOneAsset: "Действие хода: купите один актив",
    assetPurchased: "Актив куплен",
    turnActionCompletedLabel: "Действие хода выполнено",
    backToDecisions: "Вернуться к решениям",
    actionAlreadyCompleted: "Действие уже выполнено",
    shares: "Акции",
    price: "Цена",
    sector: "Сектор",
    buyShares: "Купить акции",
    sellShares: "Продать акции",
    stockCycle: "Рыночный цикл",
    momentum: "Импульс",
    dividend: "Дивиденд",
    availableCash: "Доступно денег",
    yourPosition: "Ваша позиция",
    buyPower: "Покупательная сила",
    sellPosition: "Продажа позиции",
    maxBuy: "Максимум покупки",
    maxSell: "Максимум продажи",
    boughtShares: "Куплено {count} акций",
    soldShares: "Продано {count} акций",
    tapOrDrag: "Нажмите или потяните, чтобы выбрать сумму",
    openChart: "Открыть график",
    ownedShares: "Акций: {count}",
    thisTurn: "за ход",
    valueLabel: "Стоимость",
    amountLabel: "Сумма",
    stockDetails: "Детали акции",
    noPosition: "Позиции пока нет.",
    closeSheet: "Закрыть",
    chartRange: "Диапазон цены",
    averagePrice: "Средняя цена",
    turnChange: "Изменение за ход",
    repayDebtTile: "Стол долга",
    positionValue: "Стоимость позиции",
    profitLoss: "Прибыль / убыток",
    dividendIncome: "Доход с дивидендов",
    dividendPerTurn: "За ход",
    dividendIncomePerTurn: "Доход с дивидендов: {value} за ход",
    noDividendIncome: "Эта акция не платит дивиденды",
    peRatioLabel: "P/E",
    valuationLabel: "Оценка",
    cheapValuation: "Дешевая",
    fairValuation: "Нормальная",
    expensiveValuation: "Дороже рынка",
    confirmBuy: "Подтвердить покупку",
    confirmSell: "Подтвердить продажу",
    dragToChooseAmount: "Потяните, чтобы выбрать сумму",
    lastIterations: "Последние 100 итераций",
    growthStock: "Акция роста",
    dividendStock: "Дивидендная",
    stockTypeLabel: "Тип",
    dividendYieldLabel: "Див. доходность",
    priceHistoryEmpty: "История цены пока недоступна.",
    turnLabelShort: "Ход",
    currentPriceLabel: "Текущая цена",
    allFilter: "Все",
    availableFilter: "Доступные",
    purchasedFilter: "Купленные",
    assetsCategory: "Активы",
    businessCategory: "Бизнес",
    realEstateCategoryShort: "Недвижимость",
    marketCategoryShort: "Биржа",
    economyCategoryShort: "Экономика",
    startCategoryShort: "Старт",
    metaCategoryShort: "Мета",
    statusClosed: "Закрыто",
    statusAvailable: "Доступно",
    statusOpened: "Открыто",
    statusUpgradable: "Улучшаемо",
    statusMax: "Макс.",
    statusNoKnowledge: "Не хватает знаний",
    upgradeAction: "Улучшить",
    unavailableAction: "Недоступно",
    maxAction: "Макс.",
    currentEffectLabel: "Текущий эффект",
    nextEffectLabel: "Следующий уровень",
    costLabel: "Стоимость",
    statusLabel: "Статус",
    levelProgressLabel: "Уровень",
    repeatableLabel: "Повторяемое",
    nextRunLengthLabel: "Длина новой партии",
    confirmResetMeta: "Сбросить весь прогресс престижа?",
    noMetaItemsMatchFilter: "Нет улучшений престижа для этого фильтра.",
    stockRising: "Акция растет",
    stockFalling: "Акция падает",
    stockNeutral: "Нейтрально",
    newRunSetup: "Новая партия",
    newRunSetupDesc: "Выберите стартовую позицию и уровень давления в партии.",
    chooseScenario: "Стартовый сценарий",
    chooseDifficulty: "Сложность",
    startConfiguredRun: "Начать партию",
    cancelSetup: "Оставить текущую партию",
    scenarioLabel: "Сценарий",
    difficultyLabel: "Сложность",
    scenarioBalancedTitle: "Сбалансированный старт",
    scenarioBalancedDesc: "Классический старт с одним случайным бизнесом и без долга.",
    scenarioLeveragedTitle: "Рост на заёмные",
    scenarioLeveragedDesc: "SaaS-бизнес, дополнительная ликвидность и опасное долговое давление.",
    scenarioTraderTitle: "Биржевой трейдер",
    scenarioTraderDesc: "Технологический бизнес и позиция в Aplix на более волатильном рынке.",
    difficultyRelaxedTitle: "Спокойная",
    difficultyRelaxedDesc: "Больше денег, ниже риск и безопаснее долг. Награда престижа уменьшена.",
    difficultyNormalTitle: "Обычная",
    difficultyNormalDesc: "Основной задуманный баланс игры.",
    difficultyHardTitle: "Сложная",
    difficultyHardDesc: "Меньше денег, выше риск и быстрее долговой крах. Награда престижа увеличена.",
    setupCash: "Деньги на старте",
    setupDebt: "Долг на старте",
    setupRisk: "Стартовый риск",
    setupReward: "Награда престижа",
    setupRewardReduced: "×0,75",
    setupRewardNormal: "×1,00",
    setupRewardIncreased: "×1,25",
    startingConfiguration: "{scenario} · {difficulty}"
  }
};

const state = {
  businesses: [],
  stocks: [],
  events: [],
  cards: [],
  synergies: [],
  run: null,
  meta: loadMetaProgression(),
  activeTab: "dashboard",
  marketView: "root",
  portfolioFilter: "all",
  marketFilterIndustry: "all",
  marketFilterRisk: "all",
  selectedLanguage: localStorage.getItem(LANGUAGE_KEY),
  languageModalOpen: false,
  runSetupOpen: false,
  selectedScenarioId: "balanced",
  selectedDifficultyId: "normal",
  pendingActionType: null,
  selectedActionType: null,
  selectedActionItem: null,
  metaFilter: "all",
  activeStockId: null,
  selectedTradeMode: null,
  activeStockPointIndex: null,
  stockBuyPercent: 0,
  stockSellPercent: 0,
  decisionCarouselIndex: {}
};

const ui = {
  eyebrow: document.querySelector(".eyebrow"),
  headerTitle: document.querySelector(".header-top h1"),
  newRunButton: document.getElementById("new-run-button"),
  nextTurnButton: document.getElementById("next-turn-button"),
  turnLabel: document.getElementById("turn-label"),
  statusHint: document.getElementById("status-hint"),
  statsGrid: document.getElementById("stats-grid"),
  tabContent: document.getElementById("tab-content"),
  bottomNav: document.getElementById("bottom-nav")
};

const NAV_ITEMS = [
  { id: "dashboard", labelKey: "dashboard", icon: "./assets/icons/dashboard.webp" },
  { id: "decisions", labelKey: "decisions", icon: "./assets/icons/decisions.webp" },
  { id: "portfolio", labelKey: "portfolio", icon: "./assets/icons/portfolio.webp" },
  { id: "market", labelKey: "market", icon: "./assets/icons/market.webp" },
  { id: "economy", labelKey: "economy", icon: "./assets/icons/economy.webp" }
];

boot();

async function boot() {
  const [businesses, stocks, events, cards, synergies] = await Promise.all([
    fetchJson("./data/businesses.json"),
    fetchJson("./data/stocks.json"),
    fetchJson("./data/events.json"),
    fetchJson("./data/cards.json"),
    fetchJson("./data/synergies.json")
  ]);

  state.businesses = businesses;
  state.stocks = stocks;
  state.events = events;
  state.cards = cards;
  state.synergies = synergies;
  validateGameData();
  window.validateGameData = validateGameData;
  window.simulateRuns = simulateRuns;

  ui.newRunButton.addEventListener("click", openRunSetup);
  ui.nextTurnButton.addEventListener("click", advanceTurn);

  renderBottomNav();
  if (hasSelectedLanguage()) {
    if (!restoreSavedRun()) openRunSetup();
  } else {
    render();
  }
}

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  return response.json();
}

function hasSelectedLanguage() {
  return state.selectedLanguage === "ru" || state.selectedLanguage === "en";
}

function t(key, params = {}) {
  const language = hasSelectedLanguage() ? state.selectedLanguage : "en";
  const phrase = translations[language][key] || translations.en[key] || key;
  return phrase.replace(/\{(\w+)\}/g, (_, name) => (params[name] ?? `{${name}}`));
}

function setLanguage(language) {
  state.selectedLanguage = language;
  localStorage.setItem(LANGUAGE_KEY, language);
  state.languageModalOpen = false;
  if (!state.run) openRunSetup();
  else render();
}

function createDefaultMetaProgression() {
  return {
    totalKnowledge: 0,
    unlockedIndustries: [...STARTING_UNLOCKED_INDUSTRIES],
    unlockedBusinesses: [],
    unlockedCards: [],
    unlockedEvents: [],
    completedRuns: 0,
    bestValuation: 0,
    bestTurnReached: 0,
    purchasedUnlockIds: [],
    unlockLevels: {},
    achievements: []
  };
}

function loadMetaProgression() {
  try {
    const parsed = JSON.parse(localStorage.getItem(META_KEY) || "null");
    if (!parsed) return createDefaultMetaProgression();
    return {
      ...createDefaultMetaProgression(),
      ...parsed,
      unlockedIndustries: uniqueList([...(parsed.unlockedIndustries || []), ...STARTING_UNLOCKED_INDUSTRIES]),
      unlockedBusinesses: uniqueList(parsed.unlockedBusinesses || []),
      unlockedCards: uniqueList(parsed.unlockedCards || []),
      unlockedEvents: uniqueList(parsed.unlockedEvents || []),
      purchasedUnlockIds: uniqueList(parsed.purchasedUnlockIds || []),
      unlockLevels: parsed.unlockLevels || {}
    };
  } catch {
    return createDefaultMetaProgression();
  }
}

function saveMetaProgression() {
  localStorage.setItem(META_KEY, JSON.stringify(state.meta));
}

function openLanguageModal() {
  state.languageModalOpen = true;
  render();
}

function closeLanguageModal() {
  state.languageModalOpen = false;
  render();
}

function backToDecisionsTab() {
  state.activeTab = "decisions";
  state.marketView = "root";
  if (state.pendingActionType !== "buy_asset") state.pendingActionType = null;
  render();
}

function nextRunMaxTurns() {
  return MAX_TURNS + (unlockLevel("unlock_extended_run") * 2);
}

function restoreSavedRun() {
  const savedRun = loadRunState(localStorage, RUN_KEY);
  if (!savedRun) return false;
  state.run = savedRun;
  state.runSetupOpen = false;
  state.activeTab = "dashboard";
  state.marketView = "root";
  state.pendingActionType = null;
  state.selectedActionType = null;
  state.selectedActionItem = null;
  state.activeStockId = null;
  state.selectedTradeMode = null;
  state.stockBuyPercent = 0;
  state.stockSellPercent = 0;
  state.run.statusMessage = t("runRestored");
  if (!state.run.currentReport) state.run.currentReport = calculateReport();
  render();
  return true;
}

function saveCurrentRun() {
  if (!state.run || state.run.finished) return false;
  return saveRunState(localStorage, RUN_KEY, state.run);
}

function openRunSetup() {
  state.runSetupOpen = true;
  state.selectedScenarioId = "balanced";
  state.selectedDifficultyId = "normal";
  render();
}

function closeRunSetup() {
  if (!state.run) return;
  state.runSetupOpen = false;
  render();
}

function startRun() {
  clearRunState(localStorage, RUN_KEY);
  const startingBonus = metaStartingBonuses();
  const configuration = createRunConfiguration({
    scenarioId: state.selectedScenarioId,
    difficultyId: state.selectedDifficultyId,
    baseCash: STARTING_CASH,
    metaExtraCash: startingBonus.extraCash,
    stocks: state.stocks
  });
  const starter = configuration.company.businesses[0].businessId;
  state.run = {
    id: `run-${Date.now()}`,
    maxTurns: nextRunMaxTurns(),
    scenarioId: configuration.scenario.id,
    difficultyId: configuration.difficulty.id,
    turn: 1,
    finished: false,
    endReason: null,
    rewardClaimed: false,
    knowledgeEarned: 0,
    resultSummary: null,
    currentEvent: null,
    currentReport: null,
    currentCards: [],
    marketCycle: "balanced",
    selectedChoiceId: null,
    pendingActionDone: false,
    eventResolved: false,
    statusMessage: t("resolveEventBeforeNextTurn"),
    company: configuration.company,
    macro: configuration.macro,
    history: [
      {
        turn: 1,
        title: t("runStarted"),
        body: `${t("startingAsset", { name: businessById(starter).name })}. ${t("startingConfiguration", {
          scenario: t(configuration.scenario.titleKey),
          difficulty: t(configuration.difficulty.titleKey)
        })}`
      }
    ],
    activeModifiers: [],
    stockMarket: createInitialStockMarket()
  };
  state.runSetupOpen = false;
  state.activeTab = "dashboard";
  state.marketView = "root";
  state.pendingActionType = null;
  state.selectedActionType = null;
  state.selectedActionItem = null;
  state.activeStockPointIndex = null;
  beginTurn();
}

function beginTurn() {
  const run = state.run;
  if (!run || run.finished) {
    render();
    return;
  }
  updateMarketCycle();
  tickStockMarket();
  run.currentReport = calculateReport();
  run.company.cash += Math.round(run.currentReport.profit);
  run.company.risk = clamp(run.company.risk + run.macro.marketRisk * 0.1, 0.01, 0.95);
  tickModifiers();
  run.currentEvent = chooseEvent();
  run.currentCards = drawCards();
  run.selectedChoiceId = null;
  run.pendingActionDone = false;
  run.eventResolved = false;
  run.statusMessage = t("resolveEventBeforeNextTurn");
  state.pendingActionType = null;
  state.marketView = "root";
  saveCurrentRun();
  render();
}

function render() {
  renderHeader();
  renderBottomNav();
  if (!hasSelectedLanguage()) {
    ui.tabContent.innerHTML = renderLanguageSelectScreen();
    bindLanguageEvents();
    return;
  }
  if (state.runSetupOpen || !state.run) {
    ui.tabContent.innerHTML = renderRunSetupScreen();
    bindTabEvents();
    return;
  }
  ui.tabContent.innerHTML = `${state.languageModalOpen ? renderLanguageModal() : ""}${renderActiveTab()}`;
  bindTabEvents();
}

function renderHeader() {
  document.title = t("gameTitle");
  ui.eyebrow.textContent = t("gameTitle");
  ui.newRunButton.textContent = t("reset");
  if (hasSelectedLanguage() && (state.runSetupOpen || !state.run)) {
    ui.headerTitle.textContent = t("newRunSetup");
    ui.turnLabel.textContent = t("chooseScenario");
    ui.statusHint.textContent = t("newRunSetupDesc");
    ui.nextTurnButton.style.display = "none";
    ui.nextTurnButton.disabled = true;
    ui.newRunButton.style.display = "none";
    ui.statsGrid.innerHTML = "";
    return;
  }
  ui.newRunButton.style.display = "";
  if (!state.run || !hasSelectedLanguage()) {
    ui.newRunButton.style.display = "none";
    ui.headerTitle.textContent = t("currentRun");
    ui.turnLabel.textContent = t("gameTitle");
    ui.statusHint.textContent = t("chooseLanguage");
    ui.nextTurnButton.textContent = t("nextTurn");
    ui.nextTurnButton.disabled = true;
    ui.statsGrid.innerHTML = "";
    return;
  }

  const run = state.run;
  const report = run.currentReport || calculateReport();
  const dashboardMode = state.activeTab === "dashboard";
  ui.headerTitle.textContent = dashboardMode ? t("currentRun") : tabTitle();
  ui.turnLabel.textContent = dashboardMode
    ? (run.finished
      ? t("runFinishedAtTurn", { turn: Math.min(run.turn, currentMaxTurns()) })
      : t("currentTurnStatus", { turn: run.turn, maxTurns: currentMaxTurns() }))
    : "";
  ui.statusHint.textContent = dashboardMode ? headerStatusText(run) : "";
  ui.nextTurnButton.textContent = t("nextTurn");
  ui.nextTurnButton.disabled = !turnReady() || run.finished || !dashboardMode;
  ui.nextTurnButton.style.display = dashboardMode ? "" : "none";
  ui.statsGrid.innerHTML = dashboardMode
    ? [
      [t("cash"), money(run.company.cash)],
      [t("profit"), money(report.profit)],
      [t("debt"), money(run.company.debt)],
      [t("valuation"), money(report.valuation)]
    ].map(([label, value]) => `<div class="stat-tile"><span>${label}</span><strong>${value}</strong></div>`).join("")
    : "";
}

function renderBottomNav() {
  if (!hasSelectedLanguage() || state.runSetupOpen || !state.run) {
    ui.bottomNav.innerHTML = "";
    return;
  }
  ui.bottomNav.innerHTML = NAV_ITEMS.map((item) => `
    <button class="nav-item ${state.activeTab === item.id ? "active" : ""}" data-tab="${item.id}">
      <img src="${item.icon}" alt="${t(item.labelKey)}" class="nav-icon">
      <strong>${t(item.labelKey)}</strong>
    </button>
  `).join("");
  ui.bottomNav.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab;
      render();
    });
  });
}

function renderLanguageSelectScreen() {
  return `
    <section class="tab-content-wrap language-screen">
      <div class="language-card">
        <p class="eyebrow">${t("gameTitle")}</p>
        <h2>${t("chooseLanguage")}</h2>
        <p>${t("chooseLanguageLater")}</p>
        <div class="language-actions">
          <button class="language-button primary" data-language="ru">${translations.ru.russian}</button>
          <button class="language-button" data-language="en">${translations.en.english}</button>
        </div>
      </div>
    </section>
  `;
}

function renderLanguageModal() {
  return `
    <div class="language-modal">
      <div class="language-card">
        <p class="eyebrow">${t("changeLanguage")}</p>
        <h2>${t("chooseLanguage")}</h2>
        <p>${t("chooseLanguageLater")}</p>
        <div class="language-actions">
          <button class="language-button ${state.selectedLanguage === "ru" ? "primary" : ""}" data-language="ru">${translations.ru.russian}</button>
          <button class="language-button ${state.selectedLanguage === "en" ? "primary" : ""}" data-language="en">${translations.en.english}</button>
        </div>
        <button class="modal-close secondary-button" data-close-language>${t("close")}</button>
      </div>
    </div>
  `;
}

function previewRunConfiguration() {
  return createRunConfiguration({
    scenarioId: state.selectedScenarioId,
    difficultyId: state.selectedDifficultyId,
    baseCash: STARTING_CASH,
    metaExtraCash: metaStartingBonuses().extraCash,
    stocks: state.stocks,
    random: () => 0
  });
}

function difficultyRewardLabel(difficultyId) {
  if (difficultyId === "relaxed") return t("setupRewardReduced");
  if (difficultyId === "hard") return t("setupRewardIncreased");
  return t("setupRewardNormal");
}

function renderRunSetupScreen() {
  const preview = previewRunConfiguration();
  return `
    <section class="run-setup-screen">
      <div class="run-setup-intro">
        <p class="eyebrow">${t("gameTitle")}</p>
        <h2>${t("newRunSetup")}</h2>
        <p>${t("newRunSetupDesc")}</p>
      </div>

      <div class="run-setup-section">
        <div class="tab-header"><h2>${t("chooseScenario")}</h2></div>
        <div class="setup-option-grid scenario-option-grid">
          ${RUN_SCENARIOS.map((scenario) => `
            <button class="setup-option-card ${state.selectedScenarioId === scenario.id ? "selected" : ""}" data-run-scenario="${scenario.id}" aria-pressed="${state.selectedScenarioId === scenario.id}">
              <strong>${t(scenario.titleKey)}</strong>
              <span>${t(scenario.descriptionKey)}</span>
            </button>
          `).join("")}
        </div>
      </div>

      <div class="run-setup-section">
        <div class="tab-header"><h2>${t("chooseDifficulty")}</h2></div>
        <div class="setup-option-grid difficulty-option-grid">
          ${RUN_DIFFICULTIES.map((difficulty) => `
            <button class="setup-option-card ${state.selectedDifficultyId === difficulty.id ? "selected" : ""}" data-run-difficulty="${difficulty.id}" aria-pressed="${state.selectedDifficultyId === difficulty.id}">
              <strong>${t(difficulty.titleKey)}</strong>
              <span>${t(difficulty.descriptionKey)}</span>
            </button>
          `).join("")}
        </div>
      </div>

      <article class="setup-preview-card">
        <div><span>${t("setupCash")}</span><strong>${money(preview.company.cash)}</strong></div>
        <div><span>${t("setupDebt")}</span><strong>${money(preview.company.debt)}</strong></div>
        <div><span>${t("setupRisk")}</span><strong>${percent(preview.company.risk)}</strong></div>
        <div><span>${t("setupReward")}</span><strong>${difficultyRewardLabel(preview.difficulty.id)}</strong></div>
      </article>

      <div class="setup-actions">
        <button class="primary-button" data-start-configured-run>${t("startConfiguredRun")}</button>
        ${state.run ? `<button class="secondary-button" data-cancel-run-setup>${t("cancelSetup")}</button>` : ""}
      </div>
    </section>
  `;
}

function renderActiveTab() {
  if (state.activeTab === "meta") return renderMetaTab();
  if (state.activeTab === "runEnd") return renderRunEndScreen();
  if (state.activeTab === "dashboard") return renderDashboardTab();
  if (state.activeTab === "decisions") return renderDecisionsTab();
  if (state.activeTab === "portfolio") return renderPortfolioTab();
  if (state.activeTab === "market") return renderMarketTab();
  return renderEconomyTab();
}

function renderDashboardTab() {
  const run = state.run;
  const regime = economyRegime();
  const macro = effectiveMacro();
  const scenario = scenarioById(run.scenarioId);
  const difficulty = difficultyById(run.difficultyId);
  return `
    <section class="tab-screen">
      <button class="dashboard-cta" data-dashboard-primary>
        <strong>${turnReady() ? t("nextTurn") : run.eventResolved ? t("chooseAction") : t("resolveEventCta")}</strong>
        <span>${turnReady() ? t("turnReadyToAdvance") : run.eventResolved ? t("openDecisions") : run.statusMessage}</span>
      </button>
      <div class="dashboard-secondary-actions">
        <button class="secondary-button" data-open-meta>${t("metaProgress")}</button>
      </div>
      <div class="run-configuration-tags">
        ${tag(`${t("scenarioLabel")}: ${t(scenario.titleKey)}`)}
        ${tag(`${t("difficultyLabel")}: ${t(difficulty.titleKey)}`, "accent")}
      </div>
      <article class="overview-card">
        <h3>${t("macroRegime")}</h3>
        <p>${regime.description}</p>
        <div class="macro-strip">
          ${macroPill(t("rate"), percent(macro.interestRate))}
          ${macroPill(t("inflation"), percent(macro.inflation))}
          ${macroPill(t("demand"), macro.demand.toFixed(2))}
          ${macroPill(t("energyCost"), macro.energyCost.toFixed(2))}
          ${macroPill(t("creditAvailability"), macro.creditAvailability.toFixed(2))}
        </div>
      </article>
    </section>
  `;
}

function metaFilterOptions() {
  return [
    { id: "all", label: t("allFilter") },
    { id: "available", label: t("availableFilter") },
    { id: "purchased", label: t("purchasedFilter") },
    { id: "assets", label: t("assetsCategory") },
    { id: "business", label: t("businessCategory") },
    { id: "real_estate", label: t("realEstateCategoryShort") },
    { id: "market", label: t("marketCategoryShort") },
    { id: "economy", label: t("economyCategoryShort") },
    { id: "start_bonus", label: t("startCategoryShort") },
    { id: "meta", label: t("metaCategoryShort") }
  ];
}

function metaCost(unlock, level = unlockLevel(unlock.id)) {
  if (!unlock.repeatable) return unlock.cost;
  const scale = unlock.costScaling || 1;
  return Math.round(unlock.cost * Math.pow(scale, level));
}

function metaCategoryKey(unlock) {
  return unlock.category || "meta";
}

function metaCategoryLabel(unlock) {
  const key = {
    assets: "assetsCategory",
    business: "businessCategory",
    real_estate: "realEstateCategoryShort",
    market: "marketCategoryShort",
    economy: "economyCategoryShort",
    start_bonus: "startCategoryShort",
    meta: "metaCategoryShort"
  }[metaCategoryKey(unlock)] || "metaCategoryShort";
  return t(key);
}

function unlockCurrentEffect(unlock, level = unlockLevel(unlock.id)) {
  if (unlock.id === "unlock_extended_run") return `+${level * (unlock.payload.extraTurns || 0)} ${t("turn")}`;
  if (unlock.type === "starting_bonus" && unlock.payload.extraCash) return money(unlock.payload.extraCash);
  if (unlock.type === "starting_bonus" && unlock.payload.debtThresholdBonus) return money(unlock.payload.debtThresholdBonus);
  return t(unlock.descriptionKey);
}

function unlockNextEffect(unlock, level = unlockLevel(unlock.id)) {
  if (unlock.id === "unlock_extended_run") return `+${(level + 1) * (unlock.payload.extraTurns || 0)} ${t("turn")}`;
  return unlockCurrentEffect(unlock, level + 1);
}

function unlockState(unlock) {
  const level = unlockLevel(unlock.id);
  const purchased = hasPurchasedUnlock(unlock.id);
  const repeatable = !!unlock.repeatable;
  const maxed = repeatable && unlock.maxLevel && level >= unlock.maxLevel;
  const affordable = state.meta.totalKnowledge >= metaCost(unlock, level);
  if (repeatable) {
    if (maxed) return { status: t("statusMax"), button: t("maxAction"), disabled: true, tone: "unlocked" };
    if (level > 0 && affordable) return { status: t("statusUpgradable"), button: t("upgradeAction"), disabled: false, tone: "affordable" };
    if (level > 0) return { status: t("statusNoKnowledge"), button: t("upgradeAction"), disabled: true, tone: "unlocked" };
    if (affordable) return { status: t("statusAvailable"), button: t("upgradeAction"), disabled: false, tone: "affordable" };
    return { status: t("statusClosed"), button: t("upgradeAction"), disabled: true, tone: "locked" };
  }
  if (purchased) return { status: t("statusOpened"), button: t("unlocked"), disabled: true, tone: "unlocked" };
  if (affordable) return { status: t("statusAvailable"), button: t("unlock"), disabled: false, tone: "affordable" };
  return { status: t("statusClosed"), button: t("unavailableAction"), disabled: true, tone: "locked" };
}

function unlockMatchesFilter(unlock) {
  if (state.metaFilter === "all") return true;
  if (state.metaFilter === "available") return !unlockState(unlock).disabled;
  if (state.metaFilter === "purchased") return hasPurchasedUnlock(unlock.id);
  return metaCategoryKey(unlock) === state.metaFilter;
}

function sortUnlocks(unlocks) {
  return [...unlocks].sort((a, b) => {
    const aState = unlockState(a);
    const bState = unlockState(b);
    const score = (item, stateInfo) => {
      if (!stateInfo.disabled && item.repeatable) return 0;
      if (!stateInfo.disabled) return 1;
      if (hasPurchasedUnlock(item.id) && !(item.repeatable && !(item.maxLevel && unlockLevel(item.id) >= item.maxLevel))) return 3;
      return 2;
    };
    return score(a, aState) - score(b, bState);
  });
}

function renderMetaTab() {
  const filtered = sortUnlocks(META_UNLOCKS.filter(unlockMatchesFilter));
  return `
    <section class="tab-screen">
      <article class="overview-card prestige-summary">
        <div class="panel-head"><strong>${t("knowledge")}</strong>${statusChip(`${t("nextRunLengthLabel")}: ${nextRunMaxTurns()}`, "active")}</div>
        <div class="business-metrics">
          <div><span>${t("knowledge")}</span><strong>${state.meta.totalKnowledge}</strong></div>
          <div><span>${t("completedRuns")}</span><strong>${state.meta.completedRuns}</strong></div>
          <div><span>${t("bestValuation")}</span><strong>${money(state.meta.bestValuation)}</strong></div>
          <div><span>${t("bestTurnReached")}</span><strong>${state.meta.bestTurnReached}</strong></div>
        </div>
      </article>
      <div class="filter-row prestige-filter-row">
        ${metaFilterOptions().map((item) => `<button class="filter-chip ${state.metaFilter === item.id ? "active" : ""}" data-meta-filter="${item.id}">${item.label}</button>`).join("")}
      </div>
      <section class="prestige-section">
        <div class="tab-header prestige-section-head"><h2>${t("metaUnlockedContent")}</h2><span>${filtered.length}</span></div>
        ${filtered.length ? `<div class="prestige-grid">${filtered.map((unlock) => renderUnlockCard(unlock)).join("")}</div>` : `<div class="empty-state">${t("noMetaItemsMatchFilter")}</div>`}
      </section>
      <div class="prestige-reset-row">
        <button class="secondary-button" data-reset-meta>${t("resetMeta")}</button>
      </div>
    </section>
  `;
}

function renderRunEndScreen() {
  const summary = state.run.resultSummary || summarizeRun(state.run);
  return `
    <section class="tab-screen">
      <div class="tab-header"><h2>${t("runEndTitle")}</h2><p>${t("runEndSubtitle")}</p></div>
      <article class="regime-card">
        <h3>${t("completionReason")}</h3>
        <p>${endReasonLabel(state.run.endReason)}</p>
        <div class="business-metrics">
          <div><span>${t("finalCash")}</span><strong>${money(summary.cash)}</strong></div>
          <div><span>${t("finalDebt")}</span><strong>${money(summary.debt)}</strong></div>
          <div><span>${t("finalProfit")}</span><strong>${money(summary.profit)}</strong></div>
          <div><span>${t("finalValuationLabel")}</span><strong>${money(summary.valuation)}</strong></div>
          <div><span>${t("turnReached")}</span><strong>${summary.turnReached}</strong></div>
          <div><span>${t("knowledgeEarned")}</span><strong>${state.run.knowledgeEarned}</strong></div>
        </div>
      </article>
      <div class="button-stack">
        <button class="primary-button" data-new-run>${t("newRun")}</button>
        <button class="secondary-button" data-open-meta>${t("metaProgress")}</button>
        <button class="secondary-button" data-back-dashboard>${t("backToDashboard")}</button>
      </div>
    </section>
  `;
}

function renderTurnProgressCard() {
  return `
    <article class="overview-card">
      <h3>${t("turnProgress")}</h3>
      <div class="progress-list">
        <div class="progress-row">${statusChip(state.run.eventResolved ? "✓" : "•", state.run.eventResolved ? "done" : "active")}<span>${state.run.eventResolved ? t("eventResolved") : t("eventPendingShort")}</span></div>
        <div class="progress-row">${statusChip(state.run.pendingActionDone ? "✓" : "•", state.run.pendingActionDone ? "done" : "")}<span>${state.run.pendingActionDone ? t("actionSelected") : t("actionNotSelected")}</span></div>
        <div class="progress-row">${statusChip(turnReady() ? "✓" : "•", turnReady() ? "done" : "")}<span>${turnReady() ? t("turnReadyToAdvance") : t("nextTurnLocked")}</span></div>
      </div>
    </article>
  `;
}

function renderDecisionStepper(eventActive, actionActive) {
  return `
    <article class="stepper-card">
      <div class="step-item ${state.run.eventResolved ? "done" : eventActive ? "active" : ""}">
        <span class="step-index">1</span>
        <div><strong>${t("eventStep")}</strong><p>${state.run.eventResolved ? t("completed") : eventActive ? t("active") : t("pending")}</p></div>
      </div>
      <div class="step-line"></div>
      <div class="step-item ${state.run.pendingActionDone ? "done" : actionActive ? "active" : ""}">
        <span class="step-index">2</span>
        <div><strong>${t("actionStep")}</strong><p>${state.run.pendingActionDone ? t("completed") : actionActive ? t("active") : t("pending")}</p></div>
      </div>
    </article>
  `;
}

function renderEventChoiceCard(choice, index) {
  const effectText = describeEffects(choice)
    .replace(/ \/ (\d+)t/g, (_, turns) => `, ${t("lastsTurns", { turns })}`);
  const selected = state.run.selectedChoiceId === choice.title;
  return `
    <article class="choice-card ${selected ? "selected" : ""}">
      <div class="panel-head">
        <strong>${choice.title}</strong>
        ${statusChip(riskLabel(choice), riskTone(choice))}
      </div>
      <p>${decisionDescription(choice)}</p>
      <div class="choice-meta stacked">
        <div><span>${t("effectLabel")}</span><strong>${effectText || t("strategicShift")}</strong></div>
        <div><span>${t("riskLabelTitle")}</span><strong>${riskLabel(choice)}</strong></div>
      </div>
      <button class="business-button" data-choice="${index}" ${state.run.eventResolved || state.run.finished ? "disabled" : ""}>${selected ? t("selected") : t("chooseOption")}</button>
    </article>
  `;
}

function renderDecisionCardCarousel(id, items, slideRenderer, hint = "") {
  if (!items.length) return "";
  const activeIndex = Math.max(0, Math.min(state.decisionCarouselIndex[id] || 0, items.length - 1));
  return `
    <div class="choice-carousel ${items.length === 1 ? "single" : ""}" data-carousel="${id}">
      <div class="choice-carousel-track" data-carousel-track="${id}">
        ${items.map((item, index) => `<div class="choice-carousel-slide" data-carousel-slide="${id}" data-carousel-index="${index}">${slideRenderer(item, index)}</div>`).join("")}
      </div>
      ${items.length > 1 ? `<p class="carousel-hint">${hint || t("swipeMoreOptions")}</p>` : ""}
      ${items.length > 1 ? `<div class="carousel-dots">${items.map((_, index) => `<button class="carousel-dot ${index === activeIndex ? "active" : ""}" data-carousel-dot="${id}" data-carousel-index="${index}" aria-label="${index + 1}"></button>`).join("")}</div>` : ""}
    </div>
  `;
}

function renderActionCategoryContent() {
  return actionItemsForCurrentCategory().join("");
}

function actionItemsForCurrentCategory() {
  if (!state.run.eventResolved) {
    return [`<div class="empty-state">${t("actionPanelLocked")}</div>`];
  }
  if (state.selectedActionType === "buy") {
    const groups = groupedMarketBusinesses().filter((group) => !group.locked);
    const items = groups.flatMap((group) => group.items).slice(0, 6);
    return items.length ? items.map(renderDecisionBuyCard) : [`<div class="empty-state">${t("noBusinessesMatchMarketFilter")}</div>`];
  }
  if (state.selectedActionType === "upgrade") {
    const items = state.run.company.businesses.filter((owned) => owned.level < businessById(owned.businessId).max_level);
    return items.length ? items.map(renderDecisionUpgradeCard) : [`<div class="empty-state">${t("noBusinessesMatchFilter")}</div>`];
  }
  if (state.selectedActionType === "sell") {
    const items = state.run.company.businesses.filter((owned) => state.run.company.businesses.length > 1);
    return items.length ? items.map(renderDecisionSellCard) : [`<div class="empty-state">${t("noBusinessesMatchFilter")}</div>`];
  }
  if (state.selectedActionType === "cards") {
    return state.run.currentCards.length ? state.run.currentCards.map(renderDecisionCardPlay) : [`<div class="empty-state">${t("actionPanelLocked")}</div>`];
  }
  if (state.selectedActionType === "repay") {
    return debtRepayCardItems();
  }
  return [];
}

function renderDebtRepayCards() {
  return debtRepayCardItems().join("");
}

function debtRepayCardItems() {
  const debt = state.run.company.debt;
  if (debt <= 0) return [`<div class="empty-state">${t("debtCleared")}</div>`];
  const options = [
    { id: "quarter", label: t("repayQuarter"), amount: repaymentAmount(0.25) },
    { id: "half", label: t("repayHalf"), amount: repaymentAmount(0.5) },
    { id: "all", label: t("repayAll"), amount: repaymentAmount(1) }
  ].filter((item) => item.amount > 0);
  return options.map((item) => `
    <article class="business-card">
      <div class="tag-row">${tag(`${t("debt")} ${money(state.run.company.debt)}`, "accent")}${tag(`${t("cash")} ${money(state.run.company.cash)}`)}</div>
      <h3>${item.label}</h3>
      <p>${t("repayDebtHint")}</p>
      <div class="business-metrics">
        <div><span>${t("debtPayment")}</span><strong>${money(item.amount)}</strong></div>
        <div><span>${t("risk")}</span><strong>${signedPercent(-Math.min(0.03, item.amount / 100000))}</strong></div>
      </div>
      <button class="business-button" data-repay-debt="${item.id}" ${canTakeAction(item.amount) ? "" : "disabled"}>${item.label}</button>
    </article>
  `);
}

function renderDecisionsTab() {
  const run = state.run;
  const event = run.currentEvent;
  const eventActive = !run.eventResolved;
  const actionActive = run.eventResolved && !run.pendingActionDone;
  const categories = [
    { id: "buy", label: t("buyAsset"), hint: t("actionCategoryBuyHint"), icon: "./assets/icons/market.webp" },
    { id: "upgrade", label: t("upgradeAsset"), hint: t("actionCategoryUpgradeHint"), icon: "./assets/icons/portfolio.webp" },
    { id: "sell", label: t("sellAsset"), hint: t("actionCategorySellHint"), icon: "./assets/icons/dashboard.webp" },
    { id: "cards", label: t("playCardAction"), hint: t("actionCategoryCardsHint"), icon: "./assets/icons/decisions.webp" }
  ];
  if (run.company.debt > 0) {
    categories.push({ id: "repay", label: t("repayDebt"), hint: t("repayDebtHint"), icon: "./assets/icons/economy.webp" });
  }
  return `
    <section class="tab-screen">
      <div class="decision-subheader">
        <span>${t("cashShort")}: ${money(run.company.cash)}</span>
        <span>${t("turnShort")} ${Math.min(run.turn, currentMaxTurns())}/${currentMaxTurns()}</span>
        ${statusChip(compactStatusChip())}
      </div>
      ${renderDecisionStepper(eventActive, actionActive)}
      ${!run.eventResolved ? renderDecisionCardCarousel("event-choices", event.choices, renderEventChoiceCard, t("swipeMoreOptions")) : ``}
      ${run.eventResolved && !run.pendingActionDone ? `
        <article class="overview-card">
          <h3>${t("turnAction")}</h3>
          <p>${state.selectedActionType ? (categories.find((item) => item.id === state.selectedActionType)?.hint || "") : t("chooseActionType")}</p>
          ${state.selectedActionType
            ? `<div class="action-toolbar"><button class="secondary-button" data-action-back>${t("back")}</button></div>`
            : `<div class="action-type-grid">${categories.map((category) => `
                <button class="action-type-button" data-action-type="${category.id}">
                  <img src="${category.icon}" alt="${category.label}" class="action-type-icon">
                  <strong>${category.label}</strong>
                  <span>${category.hint}</span>
                </button>
              `).join("")}</div>`
          }
        </article>
      ` : ""}
      ${run.eventResolved && !run.pendingActionDone && state.selectedActionType ? `
        ${renderDecisionCardCarousel(`action-${state.selectedActionType}`, actionItemsForCurrentCategory(), (item) => item, t("swipeMoreOptions"))}
      ` : ""}
      ${run.pendingActionDone ? `<article class="overview-card"><h3>${t("turnProgress")}</h3><p>${t("turnReadyToAdvance")}</p></article>` : ""}
    </section>
  `;
}

function renderPortfolioTab() {
  const filters = [
    { id: "all", label: t("all") },
    { id: "finance", label: t("finance") },
    { id: "it", label: t("tech") },
    { id: "real_estate", label: t("realEstate") },
    { id: "manufacturing", label: t("industry") },
    { id: "energy", label: t("energy") },
    { id: "retail", label: t("retail") }
  ];
  const owned = filteredPortfolio();
  const active = activeSynergies();
  const near = hasPurchasedUnlock("unlock_synergy_scanner") ? almostSynergies() : [];
  return `
    <section class="tab-screen">
      <div class="tab-header"><p>${t("portfolioSubtitle")}</p></div>
      <div class="filter-row">
        ${filters.map((item) => `<button class="filter-chip ${state.portfolioFilter === item.id ? "active" : ""}" data-portfolio-filter="${item.id}">${item.label}</button>`).join("")}
      </div>
      <div class="portfolio-grid">${owned.map(renderOwnedBusinessCard).join("") || `<div class="empty-state">${t("noBusinessesMatchFilter")}</div>`}</div>
      <div class="tab-header"><h2>${t("activeSynergies")}</h2><p>${t("portfolioSubtitle")}</p></div>
      <div class="synergy-section">
        ${active.length ? active.map(renderActiveSynergy).join("") : `<div class="empty-state">${t("noActiveSynergies")}</div>`}
        ${near.map(renderNearSynergy).join("")}
      </div>
    </section>
  `;
}

function renderMarketTab() {
  const marketTiles = [
    { id: "businesses", label: t("businessesCategory"), description: t("businessesCategoryDesc"), icon: "./assets/icons/market.webp" },
    { id: "real_estate", label: t("realEstateCategory"), description: t("realEstateCategoryDesc"), icon: "./assets/icons/portfolio.webp" },
    { id: "stocks", label: t("stockMarketCategory"), description: t("stockMarketCategoryDesc"), icon: "./assets/icons/economy.webp" }
  ];
  const categoryView = state.marketView !== "root";
  const groups = groupedMarketBusinesses().filter((group) => state.marketView === "businesses"
    ? group.industry !== "real_estate"
    : state.marketView === "real_estate"
      ? group.industry === "real_estate"
      : true);
  return `
    <section class="tab-screen">
      ${state.pendingActionType === "buy_asset" ? `<article class="overview-card market-action-banner"><h3>${t("turnActionBuyOneAsset")}</h3><p>${runActionStatusText()}</p></article>` : ""}
      ${categoryView ? `<div class="market-back-row"><button class="dashboard-cta market-back-button" data-market-root><strong>${t("backToMarket")}</strong></button></div>` : ""}
      ${state.marketView === "root" ? `
        <article class="overview-card">
          <h3>${t("chooseAssetType")}</h3>
          <p>${t("availableCash")}: ${money(state.run.company.cash)}</p>
          <div class="market-category-grid">
            ${marketTiles.map((item) => `
              <button class="market-category-card" data-market-category="${item.id}">
                <img src="${item.icon}" alt="${item.label}" class="action-type-icon">
                <strong>${item.label}</strong>
                <span>${item.description}</span>
              </button>
            `).join("")}
          </div>
        </article>
      ` : state.marketView === "stocks" ? renderStockMarket() : `
        <div class="portfolio-grid">${groups.length ? groups.map(renderMarketGroup).join("") : `<div class="empty-state">${t("noBusinessesMatchMarketFilter")}</div>`}</div>
      `}
      ${state.pendingActionType === "buy_asset" && state.run.pendingActionDone ? `<div class="market-back-row"><button class="business-button" data-back-decisions>${t("backToDecisions")}</button></div>` : ""}
      ${state.activeStockId ? renderStockDetailSheet() : ""}
    </section>
  `;
}

function renderEconomyTab() {
  const run = state.run;
  const regime = economyRegime();
  const macro = effectiveMacro();
  const history = run.history.slice(0, 3);
  return `
    <section class="tab-screen">
      <article class="regime-card">
        <h3>${regime.name}</h3>
        <p>${regime.description}</p>
        <div class="tag-row">
          ${tag(`${t("rate")} ${percent(macro.interestRate)}`, "accent")}
          ${tag(`${t("inflation")} ${percent(macro.inflation)}`, "accent")}
          ${tag(`${t("demand")} ${macro.demand.toFixed(2)}`, "accent")}
          ${tag(`${t("energyCost")} ${macro.energyCost.toFixed(2)}`, "accent")}
          ${tag(`${t("creditAvailability")} ${macro.creditAvailability.toFixed(2)}`, "accent")}
          ${tag(`${t("marketRisk")} ${percent(macro.marketRisk)}`, "accent")}
        </div>
      </article>
      <div class="macro-grid">
        ${macroCard(t("rate"), percent(macro.interestRate), rateInsight(macro.interestRate))}
        ${macroCard(t("inflation"), percent(macro.inflation), inflationInsight(macro.inflation))}
        ${macroCard(t("demand"), macro.demand.toFixed(2), demandInsight(macro.demand))}
        ${macroCard(t("energyCost"), macro.energyCost.toFixed(2), energyInsight(macro.energyCost))}
        ${macroCard(t("creditAvailability"), macro.creditAvailability.toFixed(2), creditInsight(macro.creditAvailability))}
        ${macroCard(t("marketRisk"), percent(macro.marketRisk), marketRiskInsight(macro.marketRisk))}
      </div>
      ${run.activeModifiers.length ? `<article class="overview-card"><h3>${t("temporaryEffects")}</h3><p>${run.activeModifiers.map((modifier) => describeModifier(modifier)).join(", ")}</p></article>` : ""}
      <article class="overview-card">
        <h3>${t("whoWinsAndLoses")}</h3>
        <div class="winners-grid">
          <div><span class="eyebrow">${t("positive")}</span><p class="positive">${regime.winners.join(", ")}</p></div>
          <div><span class="eyebrow">${t("negative")}</span><p class="negative">${regime.losers.join(", ")}</p></div>
        </div>
      </article>
      <div class="tab-header"><h2>${t("recentEvents")}</h2></div>
      <div class="timeline-list">
        ${history.map((item) => `<article class="timeline-item"><strong>${t("turn")} ${item.turn}: ${item.title}</strong><p>${item.body}</p></article>`).join("")}
      </div>
    </section>
  `;
}

function renderStockMarket() {
  const cycle = currentCycleLabel();
  return `
    <article class="regime-card">
      <h3>${t("stockCycle")}: ${cycle.name}</h3>
      <p>${cycle.description}</p>
    </article>
    <div class="stock-list">
      ${state.run.stockMarket.listings.map(renderStockCard).join("")}
    </div>
  `;
}

function runActionStatusText() {
  if (state.run.pendingActionDone) return t("actionAlreadyCompleted");
  if (state.pendingActionType === "buy_asset") return t("turnActionBuyOneAsset");
  return t("chooseAssetType");
}

function bindTabEvents() {
  bindLanguageEvents();
  ui.tabContent.querySelectorAll("[data-run-scenario]").forEach((button) => button.addEventListener("click", () => {
    state.selectedScenarioId = button.dataset.runScenario;
    render();
  }));
  ui.tabContent.querySelectorAll("[data-run-difficulty]").forEach((button) => button.addEventListener("click", () => {
    state.selectedDifficultyId = button.dataset.runDifficulty;
    render();
  }));
  ui.tabContent.querySelectorAll("[data-start-configured-run]").forEach((button) => button.addEventListener("click", startRun));
  ui.tabContent.querySelectorAll("[data-cancel-run-setup]").forEach((button) => button.addEventListener("click", closeRunSetup));
  ui.tabContent.querySelectorAll("[data-open-meta]").forEach((button) => button.addEventListener("click", openMeta));
  ui.tabContent.querySelectorAll("[data-dashboard-primary]").forEach((button) => button.addEventListener("click", () => {
    if (turnReady()) advanceTurn();
    else {
      state.activeTab = "decisions";
      render();
    }
  }));
  ui.tabContent.querySelectorAll("[data-action-type]").forEach((button) => button.addEventListener("click", () => {
    const actionType = button.dataset.actionType;
    if (actionType === "buy") {
      state.pendingActionType = "buy_asset";
      state.selectedActionType = null;
      state.marketView = "root";
      state.activeTab = "market";
      render();
      return;
    }
    state.selectedActionType = actionType;
    render();
  }));
  ui.tabContent.querySelectorAll("[data-action-back]").forEach((button) => button.addEventListener("click", () => {
    state.selectedActionType = null;
    render();
  }));
  ui.tabContent.querySelectorAll("[data-meta-unlock]").forEach((button) => button.addEventListener("click", () => purchaseUnlock(button.dataset.metaUnlock)));
  ui.tabContent.querySelectorAll("[data-reset-meta]").forEach((button) => button.addEventListener("click", resetMetaProgression));
  ui.tabContent.querySelectorAll("[data-new-run]").forEach((button) => button.addEventListener("click", openRunSetup));
  ui.tabContent.querySelectorAll("[data-back-dashboard]").forEach((button) => button.addEventListener("click", backToDashboard));
  ui.tabContent.querySelectorAll("[data-choice]").forEach((button) => button.addEventListener("click", () => resolveEventChoice(Number(button.dataset.choice))));
  ui.tabContent.querySelectorAll("[data-play-card]").forEach((button) => button.addEventListener("click", () => playCard(button.dataset.playCard)));
  ui.tabContent.querySelectorAll("[data-repay-debt]").forEach((button) => button.addEventListener("click", () => repayDebt(button.dataset.repayDebt)));
  ui.tabContent.querySelectorAll("[data-upgrade]").forEach((button) => button.addEventListener("click", () => upgradeBusiness(button.dataset.upgrade)));
  ui.tabContent.querySelectorAll("[data-buy]").forEach((button) => button.addEventListener("click", () => buyBusiness(button.dataset.buy)));
  ui.tabContent.querySelectorAll("[data-sell]").forEach((button) => button.addEventListener("click", () => sellBusiness(button.dataset.sell)));
  ui.tabContent.querySelectorAll("[data-portfolio-filter]").forEach((button) => button.addEventListener("click", () => { state.portfolioFilter = button.dataset.portfolioFilter; render(); }));
  ui.tabContent.querySelectorAll("[data-market-industry]").forEach((button) => button.addEventListener("click", () => { state.marketFilterIndustry = button.dataset.marketIndustry; render(); }));
  ui.tabContent.querySelectorAll("[data-market-risk]").forEach((button) => button.addEventListener("click", () => { state.marketFilterRisk = button.dataset.marketRisk; render(); }));
  ui.tabContent.querySelectorAll("[data-market-view]").forEach((button) => button.addEventListener("click", () => { state.marketView = button.dataset.marketView; render(); }));
  ui.tabContent.querySelectorAll("[data-market-category]").forEach((button) => button.addEventListener("click", () => { state.marketView = button.dataset.marketCategory; render(); }));
  ui.tabContent.querySelectorAll("[data-market-root]").forEach((button) => button.addEventListener("click", () => { state.marketView = "root"; render(); }));
  ui.tabContent.querySelectorAll("[data-back-decisions]").forEach((button) => button.addEventListener("click", backToDecisionsTab));
  ui.tabContent.querySelectorAll("[data-open-stock]").forEach((button) => button.addEventListener("click", () => openStockSheet(button.dataset.openStock)));
  ui.tabContent.querySelectorAll("[data-close-stock-sheet]").forEach((button) => button.addEventListener("click", closeStockSheet));
  ui.tabContent.querySelectorAll("[data-stock-trade-mode]").forEach((button) => button.addEventListener("click", () => {
    state.selectedTradeMode = button.dataset.stockTradeMode;
    if (state.selectedTradeMode === "buy") state.stockSellPercent = 0;
    if (state.selectedTradeMode === "sell") state.stockBuyPercent = 0;
    render();
  }));
  ui.tabContent.querySelectorAll("[data-meta-filter]").forEach((button) => button.addEventListener("click", () => {
    state.metaFilter = button.dataset.metaFilter;
    render();
  }));
  ui.tabContent.querySelectorAll("[data-buy-stock]").forEach((button) => button.addEventListener("click", () => buyStock(button.dataset.buyStock)));
  ui.tabContent.querySelectorAll("[data-sell-stock]").forEach((button) => button.addEventListener("click", () => sellStock(button.dataset.sellStock)));
  bindCarouselInteractions();
  bindTradeBars();
}

function bindLanguageEvents() {
  ui.tabContent.querySelectorAll("[data-language]").forEach((button) => button.addEventListener("click", () => setLanguage(button.dataset.language)));
  ui.tabContent.querySelectorAll("[data-open-language]").forEach((button) => button.addEventListener("click", openLanguageModal));
  ui.tabContent.querySelectorAll("[data-close-language]").forEach((button) => button.addEventListener("click", closeLanguageModal));
}

function bindCarouselInteractions() {
  ui.tabContent.querySelectorAll("[data-carousel-track]").forEach((carousel) => {
    const carouselId = carousel.dataset.carouselTrack;
    const slides = carousel.querySelectorAll(`[data-carousel-slide="${carouselId}"]`);
    const gap = 14;
    const syncDots = () => {
      if (!slides.length) return;
      const slideWidth = slides[0].getBoundingClientRect().width + gap;
      const index = Math.max(0, Math.min(slides.length - 1, Math.round(carousel.scrollLeft / Math.max(1, slideWidth))));
      state.decisionCarouselIndex[carouselId] = index;
      ui.tabContent.querySelectorAll(`[data-carousel-dot="${carouselId}"]`).forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === index);
      });
    };

    syncDots();
    carousel.addEventListener("wheel", (event) => {
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        event.preventDefault();
        carousel.scrollLeft += event.deltaY;
      }
    }, { passive: false });

    let isDown = false;
    let startX = 0;
    let startLeft = 0;

    carousel.addEventListener("mousedown", (event) => {
      isDown = true;
      startX = event.pageX;
      startLeft = carousel.scrollLeft;
      carousel.classList.add("dragging");
    });
    window.addEventListener("mouseup", () => {
      isDown = false;
      carousel.classList.remove("dragging");
    });
    carousel.addEventListener("mouseleave", () => {
      isDown = false;
      carousel.classList.remove("dragging");
    });
    carousel.addEventListener("mousemove", (event) => {
      if (!isDown) return;
      event.preventDefault();
      carousel.scrollLeft = startLeft - (event.pageX - startX);
    });
    carousel.addEventListener("scroll", syncDots, { passive: true });
  });

  ui.tabContent.querySelectorAll("[data-carousel-dot]").forEach((dot) => {
    dot.addEventListener("click", () => {
      const carouselId = dot.dataset.carouselDot;
      const index = Number(dot.dataset.carouselIndex || 0);
      const track = ui.tabContent.querySelector(`[data-carousel-track="${carouselId}"]`);
      const slide = track?.querySelector(`[data-carousel-slide="${carouselId}"][data-carousel-index="${index}"]`);
      if (!track || !slide) return;
      track.scrollTo({ left: slide.offsetLeft - 20, behavior: "smooth" });
      state.decisionCarouselIndex[carouselId] = index;
      ui.tabContent.querySelectorAll(`[data-carousel-dot="${carouselId}"]`).forEach((item, dotIndex) => {
        item.classList.toggle("active", dotIndex === index);
      });
    });
  });
}

function resolveEventChoice(choiceIndex) {
  const run = state.run;
  if (run.finished || run.eventResolved) return;
  const choice = run.currentEvent.choices[choiceIndex];
  applyEffects(run.currentEvent);
  applyEffects(choice);
  run.selectedChoiceId = choice.title;
  run.eventResolved = true;
  run.statusMessage = t("decisionLocked");
  run.history.unshift({ turn: run.turn, title: run.currentEvent.title, body: `${t("choiceSelected")}: ${choice.title}` });
  state.selectedActionType = null;
  state.activeTab = "decisions";
  saveCurrentRun();
  render();
}

function playCard(cardId) {
  const run = state.run;
  const card = run.currentCards.find((item) => item.id === cardId);
  if (!card || !canTakeAction(card.cost || 0)) return;
  state.selectedActionItem = cardId;
  run.company.cash -= card.cost || 0;
  applyEffects(card);
  finalizeTurnAction(t("cardPlayed", { name: card.title }));
}

function buyBusiness(businessId) {
  const run = state.run;
  const business = businessById(businessId);
  if (!business || !canTakeAction(business.cost)) return;
  if (run.company.businesses.some((item) => item.businessId === businessId)) return;
  state.selectedActionItem = businessId;
  run.company.cash -= business.cost;
  run.company.businesses.push({ businessId, level: 1 });
  if (state.pendingActionType === "buy_asset") {
    finalizeTurnAction(`${t("assetPurchased")}. ${t("turnActionCompletedLabel")}.`, { activeTab: "market" });
    return;
  }
  finalizeTurnAction(t("boughtBusiness", { name: business.name }));
}

function upgradeBusiness(businessId) {
  const run = state.run;
  const owned = run.company.businesses.find((item) => item.businessId === businessId);
  const business = businessById(businessId);
  if (!owned || !business) return;
  const cost = upgradeCost(owned);
  if (!canTakeAction(cost) || owned.level >= business.max_level) return;
  state.selectedActionItem = businessId;
  run.company.cash -= cost;
  owned.level += 1;
  finalizeTurnAction(t("upgradedBusiness", { name: business.name, level: owned.level }));
}

function sellBusiness(businessId) {
  const run = state.run;
  const owned = run.company.businesses.find((item) => item.businessId === businessId);
  if (!owned || !canTakeAction(0)) return;
  const business = businessById(businessId);
  const saleValue = Math.round(business.cost * (0.55 + owned.level * 0.15));
  state.selectedActionItem = businessId;
  run.company.businesses = run.company.businesses.filter((item) => item.businessId !== businessId);
  run.company.cash += saleValue;
  finalizeTurnAction(t("soldBusiness", { name: business.name, value: money(saleValue) }));
}

function buyStock(stockId) {
  const listing = stockById(stockId);
  if (!listing) return;
  const order = calculateBuyOrder(stockId, state.stockBuyPercent);
  const lotSize = order.shares;
  const totalCost = order.cost;
  if (!lotSize) return;
  if (!canTakeAction(totalCost)) return;
  state.selectedActionItem = stockId;
  const holding = state.run.company.stocks.find((item) => item.stockId === stockId);
  if (holding) {
    holding.shares += lotSize;
    holding.averagePrice = +((((holding.averagePrice * (holding.shares - lotSize)) + totalCost) / holding.shares).toFixed(2));
  } else {
    state.run.company.stocks.push({ stockId, shares: lotSize, averagePrice: listing.price });
  }
  state.run.company.cash -= totalCost;
  finalizeTurnAction(t("boughtShares", { count: lotSize }));
}

function sellStock(stockId) {
  const listing = stockById(stockId);
  if (!listing) return;
  const order = calculateSellOrder(stockId, state.stockSellPercent);
  const holding = state.run.company.stocks.find((item) => item.stockId === stockId);
  if (!holding || !order.shares || !canTakeAction(0)) return;
  state.selectedActionItem = stockId;
  holding.shares -= order.shares;
  state.run.company.cash += order.value;
  if (holding.shares <= 0) state.run.company.stocks = state.run.company.stocks.filter((item) => item.stockId !== stockId);
  finalizeTurnAction(t("soldShares", { count: order.shares }));
}

function repaymentAmount(fraction) {
  return Math.max(0, Math.min(state.run.company.debt, Math.floor(state.run.company.debt * fraction), state.run.company.cash));
}

function repayDebt(mode) {
  const map = { quarter: 0.25, half: 0.5, all: 1 };
  const fraction = map[mode];
  if (!fraction) return;
  const amount = repaymentAmount(fraction);
  if (!amount || !canTakeAction(amount)) return;
  state.selectedActionItem = `repay-${mode}`;
  state.run.company.cash -= amount;
  state.run.company.debt = Math.max(0, state.run.company.debt - amount);
  state.run.company.risk = clamp(state.run.company.risk - Math.min(0.03, amount / 100000), 0.01, 0.95);
  finalizeTurnAction(`${t("debtPayment")}: ${money(amount)}`);
}

function finalizeTurnAction(message, options = {}) {
  const run = state.run;
  run.pendingActionDone = true;
  run.statusMessage = t("nextTurnReady");
  run.history.unshift({ turn: run.turn, title: t("actionCompleted"), body: message });
  if (!options.keepSelectedActionType) state.selectedActionType = null;
  state.selectedActionItem = null;
  state.activeStockId = null;
  state.selectedTradeMode = null;
  state.stockBuyPercent = 0;
  state.stockSellPercent = 0;
  state.activeTab = options.activeTab || "dashboard";
  if (options.marketView) state.marketView = options.marketView;
  saveCurrentRun();
  render();
}

function advanceTurn() {
  const run = state.run;
  if (!run || !run.eventResolved || !run.pendingActionDone || run.finished) return;
  run.turn += 1;
  if (checkGameEnd()) {
    render();
    return;
  }
  beginTurn();
}

function checkGameEnd() {
  const run = state.run;
  const debtPressure = run.company.debt > debtPressureThreshold(run);
  const cashBankruptcy = run.company.cash < -5000;
  const debtCollapse = !cashBankruptcy && debtPressure && Math.random() < run.company.risk;
  const bankrupt = cashBankruptcy || debtCollapse;
  const maxed = run.turn > currentMaxTurns();
  if (bankrupt || maxed) {
    run.finished = true;
    run.endReason = maxed ? "completed_all_turns" : debtCollapse ? "debt_collapse" : "bankruptcy";
    run.statusMessage = bankrupt ? t("runEndedInsolvency") : t("runCompletedSuccessfully");
    run.resultSummary = summarizeRun(run);
    run.knowledgeEarned = calculateKnowledgeReward(run);
    claimRunReward(run);
    clearRunState(localStorage, RUN_KEY);
    run.history.unshift({
      turn: Math.min(run.turn, currentMaxTurns()),
      title: t("runComplete"),
      body: bankrupt
        ? debtCollapse ? t("debtCollapse") : t("bankruptcy")
        : t("finalValuation", { value: money(run.resultSummary.valuation) })
    });
    state.activeTab = "runEnd";
    return true;
  }
  return false;
}

function calculateReport() {
  const run = state.run;
  const temporary = activeTemporaryTotals();
  const macro = effectiveMacro();
  let revenue = 0;
  let expenses = 0;
  for (const owned of run.company.businesses) {
    const business = businessById(owned.businessId);
    const levelMultiplier = 1 + (owned.level - 1) * 0.45;
    const demandFactor = 1 + ((macro.demand - 1) * business.demand_sensitivity);
    const inflationRevenue = 1 + macro.inflation * 0.7;
    const inflationExpense = 1 + macro.inflation;
    const energyFactor = 1 + ((macro.energyCost - 1) * business.energy_use);
    revenue += business.revenue * levelMultiplier * demandFactor * inflationRevenue;
    expenses += business.expense * levelMultiplier * Math.max(0.5, energyFactor) * inflationExpense;
  }
  const synergy = activeSynergyBonus();
  revenue *= 1 + run.company.revenueBonus + temporary.revenue_bonus + synergy.revenue;
  expenses *= Math.max(0.2, 1 + run.company.expenseBonus + temporary.expense_bonus + synergy.expense);
  const effectiveRisk = clamp(run.company.risk + temporary.risk, 0.01, 0.95);
  const interest = run.company.debt * macro.interestRate;
  const dividends = stockDividends();
  const profit = revenue - expenses - interest + dividends;
  const valuation = run.company.cash + assetValue() + stockHoldingsValue() + Math.max(0, profit * 8) - run.company.debt;
  return { revenue, expenses, interest, profit, valuation, effectiveRisk, dividends };
}

function assetValue() {
  return state.run.company.businesses.reduce((sum, owned) => {
    const business = businessById(owned.businessId);
    return sum + business.cost * (1 + owned.level * 0.25);
  }, 0);
}

function stockHoldingsValue() {
  return state.run.company.stocks.reduce((sum, holding) => {
    const listing = stockById(holding.stockId);
    return sum + (listing ? listing.price * holding.shares : 0);
  }, 0);
}

function stockDividends() {
  return state.run.company.stocks.reduce((sum, holding) => {
    const listing = stockById(holding.stockId);
    if (!listing) return sum;
    return sum + (listing.price * holding.shares * (listing.dividend_yield || 0));
  }, 0);
}

function createInitialStockMarket() {
  return {
    listings: state.stocks.map((stock) => ({ ...stock, price: stock.price, momentum: 0, priceHistory: createStockHistory(stock.price, 0, stock.priceHistory) }))
  };
}

function stockById(id) {
  return state.run.stockMarket.listings.find((item) => item.id === id);
}

function stockHolding(stockId) {
  return state.run.company.stocks.find((item) => item.stockId === stockId) || null;
}

function createStockHistory(price, momentum, seed = []) {
  if (seed?.length) return seed.slice(-100);
  const history = [];
  let cursor = price;
  for (let i = 0; i < 99; i += 1) {
    const drift = momentum * 0.4;
    cursor = Math.max(1, +(cursor * (1 - drift + (Math.random() - 0.5) * 0.03)).toFixed(2));
    history.unshift(cursor);
  }
  history.push(price);
  return history.slice(-100);
}

function openStockSheet(stockId) {
  state.activeStockId = stockId;
  state.selectedTradeMode = null;
  state.activeStockPointIndex = null;
  state.stockBuyPercent = 0;
  state.stockSellPercent = 0;
  render();
}

function closeStockSheet() {
  state.activeStockId = null;
  state.selectedTradeMode = null;
  state.activeStockPointIndex = null;
  state.stockBuyPercent = 0;
  state.stockSellPercent = 0;
  render();
}

function getPercentFromPointer(event, element) {
  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const raw = x / rect.width;
  return Math.max(0, Math.min(1, raw));
}

function calculateMaxBuyShares(stockId) {
  const stock = stockById(stockId);
  if (!stock) return 0;
  return Math.floor(state.run.company.cash / stock.price);
}

function calculateBuyOrder(stockId, percentValue) {
  const stock = stockById(stockId);
  if (!stock) return { shares: 0, cost: 0 };
  const maxShares = calculateMaxBuyShares(stockId);
  const shares = Math.floor(maxShares * percentValue);
  return { shares, cost: +(shares * stock.price).toFixed(2) };
}

function calculateSellOrder(stockId, percentValue) {
  const stock = stockById(stockId);
  const holding = stockHolding(stockId);
  if (!stock || !holding) return { shares: 0, value: 0 };
  const shares = Math.floor(holding.shares * percentValue);
  return { shares, value: +(shares * stock.price).toFixed(2) };
}

function bindTradeBars() {
  ui.tabContent.querySelectorAll("[data-trade-bar]").forEach((bar) => {
    let dragging = false;
    const mode = bar.dataset.tradeBar;
    const setValue = (event) => {
      const value = getPercentFromPointer(event, bar);
      if (mode === "buy") state.stockBuyPercent = value;
      else state.stockSellPercent = value;
      refreshActiveStockTradeUI();
    };
    bar.addEventListener("pointerdown", (event) => {
      dragging = true;
      bar.setPointerCapture(event.pointerId);
      setValue(event);
    });
    bar.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      setValue(event);
    });
    const stop = () => { dragging = false; };
    bar.addEventListener("pointerup", stop);
    bar.addEventListener("pointercancel", stop);
  });
}

function refreshActiveStockTradeUI() {
  const stockId = state.activeStockId;
  if (!stockId) return;
  const buyOrder = calculateBuyOrder(stockId, state.stockBuyPercent);
  const sellOrder = calculateSellOrder(stockId, state.stockSellPercent);
  const sharesLabel = t("shares").toLowerCase();

  const sync = (mode, percentValue, order, canSubmit) => {
    const bar = ui.tabContent.querySelector(`[data-trade-bar="${mode}"]`);
    const fill = bar?.querySelector(".trade-bar-fill");
    const thumb = bar?.querySelector(".trade-bar-thumb");
    const percentLabel = ui.tabContent.querySelector(`[data-trade-percent-label="${mode}"]`);
    const amount = ui.tabContent.querySelector(`[data-trade-amount="${mode}"]`);
    const shares = ui.tabContent.querySelector(`[data-trade-shares="${mode}"]`);
    const action = ui.tabContent.querySelector(`[data-trade-action="${mode}"]`);
    const width = `${Math.round(percentValue * 100)}%`;
    if (fill) fill.style.width = width;
    if (thumb) thumb.style.left = width;
    if (percentLabel) percentLabel.textContent = width;
    if (amount) amount.textContent = `${t("amountLabel")} ${stockMoney(mode === "buy" ? order.cost : order.value)}`;
    if (shares) shares.textContent = `${order.shares} ${sharesLabel}`;
    if (action) action.disabled = !canSubmit;
  };

  sync("buy", state.stockBuyPercent, buyOrder, buyOrder.shares > 0 && canTakeAction(buyOrder.cost));
  sync("sell", state.stockSellPercent, sellOrder, sellOrder.shares > 0 && canTakeAction(0));
}

function updateMarketCycle() {
  const macro = effectiveMacro();
  if (macro.interestRate >= 0.055) state.run.marketCycle = "rates";
  else if (macro.inflation >= 0.05) state.run.marketCycle = "inflation";
  else if (macro.demand <= 0.92) state.run.marketCycle = "consumer";
  else if (macro.creditAvailability >= 1.1) state.run.marketCycle = "growth";
  else state.run.marketCycle = "balanced";
}

function currentCycleLabel() {
  const map = {
    balanced: { name: t("balancedExpansion"), description: t("balancedExpansionDesc") },
    consumer: { name: t("demand"), description: t("demandInsightHigh") },
    growth: { name: t("cheapCreditBoom"), description: t("cheapCreditBoomDesc") },
    inflation: { name: t("inflationShock"), description: t("inflationShockDesc") },
    rates: { name: t("highRateSqueeze"), description: t("highRateSqueezeDesc") }
  };
  return map[state.run.marketCycle] || map.balanced;
}

function tickStockMarket() {
  const cycle = state.run.marketCycle;
  state.run.stockMarket.listings = state.run.stockMarket.listings.map((listing) => {
    const cycleBoost = listing.cycle_bias === cycle ? 0.03 : cycle === "balanced" ? 0.01 : -0.01;
    const macroPenalty = listing.sector === "real_estate" && cycle === "rates" ? -0.03 : 0;
    const randomShock = (Math.random() - 0.5) * listing.volatility;
    const change = cycleBoost + macroPenalty + randomShock;
    const nextPrice = Math.max(1, +(listing.price * (1 + change)).toFixed(2));
    return { ...listing, momentum: +change.toFixed(3), price: nextPrice, priceHistory: [...(listing.priceHistory || []), nextPrice].slice(-100) };
  });
}

function applyEffects(source) {
  const run = state.run;
  run.company.cash += source.cash || 0;
  run.company.debt = Math.max(0, run.company.debt + (source.debt || 0));
  run.company.risk = clamp(run.company.risk + (source.risk || 0), 0.01, 0.95);
  run.company.revenueBonus += source.revenue_bonus || 0;
  run.company.expenseBonus += source.expense_bonus || 0;
  if (source.interest_rate) run.macro.interestRate = Math.max(0.01, run.macro.interestRate + source.interest_rate);
  if (source.inflation) run.macro.inflation = Math.max(0.01, run.macro.inflation + source.inflation);
  if (source.demand) run.macro.demand = Math.max(0.01, run.macro.demand + source.demand);
  if (source.energy_cost) run.macro.energyCost = Math.max(0.01, run.macro.energyCost + source.energy_cost);
  if (source.credit_availability) run.macro.creditAvailability = Math.max(0.01, run.macro.creditAvailability + source.credit_availability);
  if (source.market_risk) run.macro.marketRisk = Math.max(0.01, run.macro.marketRisk + source.market_risk);
  if (source.temporary_effects && source.duration_turns) {
    run.activeModifiers.push({
      label: source.title || source.id || "Modifier",
      effects: source.temporary_effects,
      remainingTurns: source.duration_turns
    });
  }
}

function chooseEvent() {
  const eligible = state.events.filter(eventUnlocked).filter(eventAllowed);
  if (!eligible.length) return sample(state.events);
  const total = eligible.reduce((sum, item) => sum + Math.max(1, item.weight || 1), 0);
  let roll = Math.random() * total;
  for (const event of eligible) {
    roll -= Math.max(1, event.weight || 1);
    if (roll <= 0) return event;
  }
  return eligible[eligible.length - 1];
}

function eventAllowed(event) {
  const run = state.run;
  const macro = effectiveMacro();
  if (run.turn < (event.min_turn || 1)) return false;
  if (run.turn > (event.max_turn || currentMaxTurns())) return false;
  if (event.min_debt != null && run.company.debt < event.min_debt) return false;
  if (event.max_debt != null && run.company.debt > event.max_debt) return false;
  if (event.min_demand != null && macro.demand < event.min_demand) return false;
  if (event.max_demand != null && macro.demand > event.max_demand) return false;
  if (event.min_energy_cost != null && macro.energyCost < event.min_energy_cost) return false;
  if (event.allowed_industries?.length) {
    const ownedIndustries = new Set(state.run.company.businesses.map((item) => businessById(item.businessId).industry));
    if (!event.allowed_industries.some((industry) => ownedIndustries.has(industry))) return false;
  }
  return true;
}

function drawCards() {
  const pool = state.cards.filter(cardUnlocked);
  const cards = [];
  while (pool.length && cards.length < 3) {
    const index = Math.floor(Math.random() * pool.length);
    cards.push(pool.splice(index, 1)[0]);
  }
  return cards;
}

function activeSynergies() {
  const owned = new Set(state.run.company.businesses.map((item) => item.businessId));
  return state.synergies.filter((synergy) => synergy.requires.every((id) => owned.has(id)));
}

function almostSynergies() {
  const owned = new Set(state.run.company.businesses.map((item) => item.businessId));
  return state.synergies.filter((synergy) => synergy.requires.filter((id) => owned.has(id)).length === synergy.requires.length - 1).slice(0, 3);
}

function activeSynergyBonus() {
  return activeSynergies().reduce((acc, synergy) => ({
    revenue: acc.revenue + (synergy.revenue_bonus || 0),
    expense: acc.expense + (synergy.expense_bonus || 0)
  }), { revenue: 0, expense: 0 });
}

function filteredPortfolio() {
  return state.run.company.businesses.filter((owned) => {
    if (state.portfolioFilter === "all") return true;
    const business = businessById(owned.businessId);
    if (state.portfolioFilter === "finance") return business.industry === "media";
    return business.industry === state.portfolioFilter;
  });
}

function groupedMarketBusinesses() {
  const owned = new Set(state.run.company.businesses.map((item) => item.businessId));
  const visible = state.businesses.filter((business) => !owned.has(business.id)).filter((business) => {
    const industryOk = state.marketFilterIndustry === "all" || business.industry === state.marketFilterIndustry;
    const riskOk = state.marketFilterRisk === "all" || matchRiskFilter(business.risk, state.marketFilterRisk);
    return industryOk && riskOk;
  });
  const groups = new Map();
  for (const business of visible) {
    if (!groups.has(business.industry)) groups.set(business.industry, []);
    groups.get(business.industry).push(business);
  }
  return [...groups.entries()].map(([industry, items]) => ({
    industry,
    locked: !industryUnlocked(industry),
    items: industryUnlocked(industry) ? items : []
  }));
}

function renderOwnedBusinessCard(owned) {
  const business = businessById(owned.businessId);
  const revenue = business.revenue * (1 + (owned.level - 1) * 0.45);
  const expenses = business.expense * (1 + (owned.level - 1) * 0.45);
  const profit = revenue - expenses;
  const cost = upgradeCost(owned);
  return `
    <article class="business-card">
      <div class="tag-row">${tag(industryName(business.industry), "accent")}${tag(`${t("level")} ${owned.level}`)}</div>
      <h3>${business.name}</h3>
      <p>${businessBlurb(business)}</p>
      <div class="business-metrics">
        <div><span>${t("revenue")}</span><strong>${money(revenue)}</strong></div>
        <div><span>${t("expenses")}</span><strong>${money(expenses)}</strong></div>
        <div><span>${t("profit")}</span><strong>${money(profit)}</strong></div>
        <div><span>${t("risk")}</span><strong>${percent(business.risk)}</strong></div>
      </div>
      <div class="button-row">
        <button class="business-button" data-upgrade="${business.id}" ${canTakeAction(cost) && owned.level < business.max_level ? "" : "disabled"}>${t("upgrade")}</button>
        <button class="secondary-button" data-sell="${business.id}" ${canTakeAction(0) && state.run.company.businesses.length > 1 ? "" : "disabled"}>${t("sell")}</button>
      </div>
    </article>
  `;
}

function renderDecisionBuyCard(business) {
  return `
    <article class="business-card">
      <div class="tag-row">${tag(`${t("buy")} ${money(business.cost)}`, "accent")}${tag(industryName(business.industry))}${tag(riskBucketLabel(business.risk))}</div>
      <h3>${business.name}</h3>
      <p>${businessBlurb(business)}</p>
      <div class="business-metrics">
        <div><span>${t("expectedProfit")}</span><strong>${money(business.revenue - business.expense)}</strong></div>
        <div><span>${t("risk")}</span><strong>${percent(business.risk)}</strong></div>
        <div><span>${t("synergyHooks")}</span><strong>${synergyHooks(business.id)}</strong></div>
        <div><span>${t("macroSensitivity")}</span><strong>${macroSensitivity(business)}</strong></div>
      </div>
      <button class="business-button" data-buy="${business.id}" ${canTakeAction(business.cost) ? "" : "disabled"}>${t("buyAsset")}</button>
    </article>
  `;
}

function renderDecisionUpgradeCard(owned) {
  const business = businessById(owned.businessId);
  const upgradePrice = upgradeCost(owned);
  const revenueGain = Math.round(business.revenue * 0.45);
  return `
    <article class="business-card">
      <div class="tag-row">${tag(industryName(business.industry), "accent")}${tag(`${t("level")} ${owned.level}`)}</div>
      <h3>${business.name}</h3>
      <p>${businessBlurb(business)}</p>
      <div class="business-metrics">
        <div><span>${t("upgrade")}</span><strong>${money(upgradePrice)}</strong></div>
        <div><span>${t("revenue")}</span><strong>+${money(revenueGain)}</strong></div>
      </div>
      <button class="business-button" data-upgrade="${business.id}" ${canTakeAction(upgradePrice) ? "" : "disabled"}>${t("upgradeAsset")}</button>
    </article>
  `;
}

function renderDecisionSellCard(owned) {
  const business = businessById(owned.businessId);
  const saleValue = Math.round(business.cost * (0.55 + owned.level * 0.15));
  return `
    <article class="business-card">
      <div class="tag-row">${tag(industryName(business.industry), "accent")}${tag(`${t("level")} ${owned.level}`)}</div>
      <h3>${business.name}</h3>
      <p>${businessBlurb(business)}</p>
      <div class="business-metrics">
        <div><span>${t("sell")}</span><strong>${money(saleValue)}</strong></div>
        <div><span>${t("expectedProfit")}</span><strong>${money(business.revenue - business.expense)}</strong></div>
      </div>
      <button class="business-button" data-sell="${business.id}" ${canTakeAction(0) ? "" : "disabled"}>${t("sellAsset")}</button>
    </article>
  `;
}

function renderDecisionCardPlay(card) {
  return `
    <article class="business-card">
      <div class="tag-row">${tag(card.cost ? `${t("buy")} ${money(card.cost)}` : t("noCost"), "accent")}</div>
      <h3>${card.title}</h3>
      <p>${card.text}</p>
      <div class="choice-meta stacked">
        <div><span>${t("effectLabel")}</span><strong>${describeEffects(card) || t("strategicShift")}</strong></div>
        <div><span>${t("riskLabelTitle")}</span><strong>${riskLabel(card)}</strong></div>
      </div>
      <button class="business-button" data-play-card="${card.id}" ${canTakeAction(card.cost || 0) ? "" : "disabled"}>${t("playCardAction")}</button>
    </article>
  `;
}

function renderActiveSynergy(synergy) {
  return `<article class="synergy-card"><strong>${synergy.name}</strong><p>${synergy.requires.map((id) => businessById(id).name).join(" + ")}</p><div class="tag-row">${synergy.revenue_bonus ? tag(`${t("revenue")} ${signedPercent(synergy.revenue_bonus)}`, "accent") : ""}${synergy.expense_bonus ? tag(`${t("expenses")} ${signedPercent(synergy.expense_bonus)}`, "accent") : ""}</div></article>`;
}

function renderNearSynergy(synergy) {
  const missing = synergy.requires.filter((id) => !state.run.company.businesses.some((item) => item.businessId === id));
  return `<article class="synergy-card"><strong>${t("almostReady")}: ${synergy.name}</strong><p>${missing.map((id) => businessById(id).name).join(", ")}</p><div class="tag-row">${synergy.revenue_bonus ? tag(`${t("revenue")} ${signedPercent(synergy.revenue_bonus)}`) : ""}${synergy.expense_bonus ? tag(`${t("expenses")} ${signedPercent(synergy.expense_bonus)}`) : ""}</div></article>`;
}

function renderMarketGroup(group) {
  if (group.locked) {
    return `
      <section class="market-group">
        <div class="market-group-header"><h3>${industryName(group.industry)}</h3><p>${t("locked")}</p></div>
        <article class="business-card locked-card">
          <div class="tag-row">${tag(t("locked"))}</div>
          <h3>${industryName(group.industry)}</h3>
          <p>${t("unlockInMetaProgression")}</p>
          <button class="secondary-button" data-open-meta>${t("metaProgress")}</button>
        </article>
      </section>
    `;
  }
  return `
    <section class="market-group">
      <div class="market-group-header"><h3>${industryName(group.industry)}</h3><p>${group.items.length} ${t("offers")}</p></div>
      <div class="market-grid">
        ${group.items.map((business) => `
          <article class="business-card">
            <div class="tag-row">${tag(`${t("buy")} ${money(business.cost)}`, "accent")}${tag(riskBucketLabel(business.risk))}</div>
            <h3>${business.name}</h3>
            <p>${businessBlurb(business)}</p>
            <div class="business-metrics">
              <div><span>${t("expectedProfit")}</span><strong>${money(business.revenue - business.expense)}</strong></div>
              <div><span>${t("industryLabel")}</span><strong>${industryName(business.industry)}</strong></div>
              <div><span>${t("macroSensitivity")}</span><strong>${macroSensitivity(business)}</strong></div>
              <div><span>${t("synergyHooks")}</span><strong>${synergyHooks(business.id)}</strong></div>
            </div>
            <button class="business-button" data-buy="${business.id}" ${canTakeAction(business.cost) ? "" : "disabled"}>${t("buy")}</button>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function stockLogoMarkup(stock, size = "small") {
  const className = size === "large" ? "stock-logo stock-logo-large" : "stock-logo";
  return stock.logo
    ? `<div class="${className}"><img src="${stock.logo}" alt="${stock.name}"></div>`
    : `<div class="${className}">${stock.ticker.slice(0, 2)}</div>`;
}

function stockValuationKey(stock) {
  const pe = stock.peRatio || 0;
  if (stock.sector === "tech") {
    if (pe < 22) return "cheapValuation";
    if (pe <= 48) return "fairValuation";
    return "expensiveValuation";
  }
  if (pe < 15) return "cheapValuation";
  if (pe <= 35) return "fairValuation";
  return "expensiveValuation";
}

function stockTypeKey(stock) {
  return stock.stockType === "dividend" ? "dividendStock" : "growthStock";
}

function stockTrendKey(stock) {
  if (stock.momentum > 0.004) return "stockRising";
  if (stock.momentum < -0.004) return "stockFalling";
  return "stockNeutral";
}

function chartPoints(points, width, height, padding = { left: 38, right: 14, top: 12, bottom: 28 }) {
  const values = points?.length ? points : [1, 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(0.01, max - min);
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  return values.map((point, index) => {
    const x = values.length === 1 ? padding.left + (plotWidth / 2) : padding.left + ((index / (values.length - 1)) * plotWidth);
    const y = padding.top + (plotHeight - (((point - min) / range) * plotHeight));
    return { x, y, value: point, index };
  });
}

function renderInteractiveStockChart(points, momentum) {
  if (!points?.length) return `<div class="stock-chart-empty">${t("priceHistoryEmpty")}</div>`;
  const width = 320;
  const height = 220;
  const coords = chartPoints(points, width, height);
  const values = points;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const mid = (min + max) / 2;
  const stroke = momentum >= 0 ? "#0f8b72" : "#bb4a42";
  const fill = momentum >= 0 ? "rgba(15,139,114,0.12)" : "rgba(187,74,66,0.12)";
  const plotFloor = height - 28;
  const path = coords.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
  const area = `${path} L ${coords[coords.length - 1].x.toFixed(2)} ${plotFloor.toFixed(2)} L ${coords[0].x.toFixed(2)} ${plotFloor.toFixed(2)} Z`;
  const yLabels = [max, mid, min];
  const xLabels = [
    { x: coords[0].x, label: `${t("turnLabelShort")} 1` },
    { x: coords[Math.floor((coords.length - 1) / 2)].x, label: `${t("turnLabelShort")} ${Math.floor((coords.length + 1) / 2)}` },
    { x: coords[coords.length - 1].x, label: `${t("turnLabelShort")} ${coords.length}` }
  ];
  return `
    <svg class="stock-full-chart" viewBox="0 0 ${width} ${height}" aria-label="${t("openChart")}">
      ${yLabels.map((value, index) => {
        const y = 12 + (index * ((height - 40) / 2));
        return `<g><line x1="38" y1="${y}" x2="${width - 14}" y2="${y}" stroke="rgba(24,23,20,0.08)" stroke-width="1"></line><text x="2" y="${y + 4}" class="stock-axis-text">${stockMoney(value)}</text></g>`;
      }).join("")}
      <path d="${area}" fill="${fill}"></path>
      <path d="${path}" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"></path>
      ${xLabels.map((item) => `<text x="${item.x}" y="${height - 6}" text-anchor="middle" class="stock-axis-text">${item.label}</text>`).join("")}
    </svg>
  `;
}

function renderStockCard(stock) {
  const holding = state.run.company.stocks.find((item) => item.stockId === stock.id);
  return `
    <button class="stock-list-item" data-open-stock="${stock.id}">
      ${stockLogoMarkup(stock)}
      <div class="stock-main">
        <strong>${stock.name}</strong>
        <span>${stock.ticker} · ${industryName(stock.sector)}</span>
        <div class="tag-row compact-tags">${tag(t(stockTypeKey(stock)), "accent")}${stock.stockType === "dividend" ? tag(`${t("dividendYieldLabel")} ${percent(stock.dividend_yield)}`) : ""}</div>${holding ? `<em>${t("ownedShares", { count: holding.shares })}</em>` : ""}
      </div>
      <div class="stock-side">
        <strong>${stockMoney(stock.price)}</strong>
        <span class="${stock.momentum >= 0 ? "positive" : "negative"}">${signedStockPercent(stock.momentum)}</span>
        ${renderSparkline(stock.priceHistory || [], stock.momentum)}
      </div>
    </button>
  `;
}

function renderSparkline(points, momentum) {
  const path = chartPath(points, 92, 34);
  const tone = momentum >= 0 ? "#0f8b72" : "#bb4a42";
  return `<svg class="sparkline" viewBox="0 0 92 34" aria-hidden="true"><path d="${path}" fill="none" stroke="${tone}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function renderFullChart(points, momentum) {
  const width = 320;
  const height = 200;
  const path = chartPath(points, width, height);
  const area = chartArea(points, width, height);
  const stroke = momentum >= 0 ? "#0f8b72" : "#bb4a42";
  const fill = momentum >= 0 ? "rgba(15,139,114,0.12)" : "rgba(187,74,66,0.12)";
  return `<svg class="stock-full-chart" viewBox="0 0 ${width} ${height}" aria-label="${t("openChart")}"><path d="${area}" fill="${fill}"></path><path d="${path}" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
}

function chartPath(points, width, height) {
  const values = points?.length ? points : [1, 1, 1, 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(0.01, max - min);
  return values.map((point, index) => {
    const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
    const y = height - ((point - min) / range) * (height - 10) - 5;
    return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
}

function chartArea(points, width, height) {
  const line = chartPath(points, width, height);
  const values = points?.length ? points : [1, 1, 1, 1];
  return `${line} L ${width} ${height} L 0 ${height} Z`;
}

function renderStockDetailSheet() {
  const stock = stockById(state.activeStockId);
  if (!stock) return "";
  const holding = stockHolding(stock.id);
  const history = (stock.priceHistory || [stock.price]).slice(-100);
  const buyOrder = calculateBuyOrder(stock.id, state.stockBuyPercent);
  const sellOrder = calculateSellOrder(stock.id, state.stockSellPercent);
  const positionValue = holding ? +(holding.shares * stock.price).toFixed(2) : 0;
  const costBasis = holding ? +(holding.averagePrice * holding.shares).toFixed(2) : 0;
  const profitLoss = holding ? +(positionValue - costBasis).toFixed(2) : 0;
  const profitLossPercent = holding && costBasis > 0 ? profitLoss / costBasis : 0;
  const dividendIncome = holding ? +(stock.price * holding.shares * (stock.dividend_yield || 0)).toFixed(2) : 0;
  const tradeMode = state.selectedTradeMode;
  return `
    <div class="stock-sheet-overlay" data-close-stock-sheet>
      <article class="stock-sheet" onclick="event.stopPropagation()">
        <div class="stock-sheet-head stock-sheet-head-compact">
          <button class="secondary-button slim stock-close-button" data-close-stock-sheet>${t("closeSheet")}</button>
        </div>
        <div class="stock-identity-row">
          ${stockLogoMarkup(stock, "large")}
          <div class="stock-identity-text">
            <h3>${stock.name}</h3>
            <div class="stock-meta-line">
              <p class="stock-ticker-line">${stock.ticker} · ${industryName(stock.sector)}</p>
              <span class="stock-growth-pill">${t(stockTypeKey(stock))}</span>
            </div>
          </div>
        </div>
        <div class="stock-sheet-price">
          <strong>${stockMoney(stock.price)}</strong>
          <span class="${stock.momentum >= 0 ? "positive" : "negative"}">${signedStockPercent(stock.momentum)} ${t("thisTurn")}</span>
        </div>
        <div class="stock-chart-card">
          ${renderInteractiveStockChart(history, stock.momentum)}
        </div>
        <div class="stock-sheet-side-info">
          <div><span>${t("peRatioLabel")}</span><strong>${stock.peRatio.toFixed(1)}</strong></div>
        </div>
        ${holding ? `
          <article class="trade-card">
            <div class="panel-head"><strong>${t("yourPosition")}</strong></div>
            <div class="stock-dividend-inline ${dividendIncome > 0 ? "positive" : "muted"}">${dividendIncome > 0 ? t("dividendIncomePerTurn", { value: stockMoney(dividendIncome) }) : t("noDividendIncome")}</div>
            <div class="business-metrics stock-detail-metrics">
              <div><span>${t("shares")}</span><strong>${holding.shares}</strong></div>
              <div><span>${t("averagePrice")}</span><strong>${stockMoney(holding.averagePrice)}</strong></div>
              <div><span>${t("positionValue")}</span><strong>${stockMoney(positionValue)}</strong></div>
              <div><span>${t("profitLoss")}</span><strong class="${profitLoss >= 0 ? "positive" : "negative"}">${signedStockMoney(profitLoss)} / ${signedStockPercent(profitLossPercent)}</strong></div>
              <div><span>${t("dividendIncome")}</span><strong>${stockMoney(dividendIncome)}</strong></div>
              <div><span>${t("dividendPerTurn")}</span><strong>${percent(stock.dividend_yield)}</strong></div>
            </div>
          </article>
        ` : ""}
        <article class="trade-card">
          <div class="stock-trade-actions">
            <button class="business-button ${tradeMode === "buy" ? "selected-trade-mode" : ""}" data-stock-trade-mode="buy">${holding ? t("buyShares") : t("buy")}</button>
            <button class="secondary-button ${tradeMode === "sell" ? "selected-trade-mode" : ""}" data-stock-trade-mode="sell" ${holding ? "" : "disabled"}>${t("sell")}</button>
          </div>
          ${tradeMode === "buy" ? `
            <div class="stock-trade-panel">
              ${renderTradePercentBar("buy", state.stockBuyPercent)}
              <div class="trade-summary"><span data-trade-amount="buy">${t("amountLabel")} ${stockMoney(buyOrder.cost)}</span><strong data-trade-shares="buy">${buyOrder.shares} ${t("shares").toLowerCase()}</strong></div>
              <button class="business-button" data-buy-stock="${stock.id}" data-trade-action="buy" ${buyOrder.shares > 0 && canTakeAction(buyOrder.cost) ? "" : "disabled"}>${t("confirmBuy")}</button>
            </div>
          ` : ""}
          ${tradeMode === "sell" ? `
            <div class="stock-trade-panel">
              ${renderTradePercentBar("sell", state.stockSellPercent)}
              <div class="trade-summary"><span data-trade-amount="sell">${t("amountLabel")} ${stockMoney(sellOrder.value)}</span><strong data-trade-shares="sell">${sellOrder.shares} ${t("shares").toLowerCase()}</strong></div>
              <button class="secondary-button" data-sell-stock="${stock.id}" data-trade-action="sell" ${sellOrder.shares > 0 && canTakeAction(0) ? "" : "disabled"}>${t("confirmSell")}</button>
            </div>
          ` : ""}
        </article>
      </article>
    </div>
  `;
}

function renderTradePercentBar(mode, value) {
  return `
    <div class="trade-bar-block">
      <div class="trade-bar" data-trade-bar="${mode}">
        <div class="trade-bar-fill" style="width:${Math.round(value * 100)}%"></div>
        <div class="trade-bar-thumb" style="left:${Math.round(value * 100)}%"></div>
      </div>
    </div>
  `;
}

function macroCard(title, value, helper) {
  return `<article class="macro-card"><h3>${title}</h3><p class="helper">${helper}</p><div class="tag-row">${tag(value, "accent")}</div></article>`;
}

function macroPill(label, value) {
  return `<div class="macro-pill"><span>${label}</span><strong>${value}</strong></div>`;
}

function economyRegime() {
  const macro = effectiveMacro();
  if (macro.energyCost >= 1.15) return { name: t("energyCrisis"), description: t("energyCrisisDesc"), winners: [t("energy"), t("cashLabel")], losers: [t("transport"), t("manufacturingBusinesses")] };
  if (macro.interestRate >= 0.055) return { name: t("highRateSqueeze"), description: t("highRateSqueezeDesc"), winners: [t("cashLabel"), t("defensiveBusinesses")], losers: [t("realEstateBusinesses"), t("leveragedExpansion")] };
  if (macro.inflation >= 0.05) return { name: t("inflationShock"), description: t("inflationShockDesc"), winners: [t("pricingPower"), t("media")], losers: [t("retail"), t("energy")] };
  if (macro.demand <= 0.92) return { name: t("recession"), description: t("recessionDesc"), winners: [t("cashLabel"), t("efficientOperators")], losers: [t("retail"), t("speculativeAssets")] };
  if (macro.creditAvailability >= 1.12 && macro.interestRate <= 0.035) return { name: t("cheapCreditBoom"), description: t("cheapCreditBoomDesc"), winners: [t("realEstateBusinesses"), t("growthPlays")], losers: [t("idleCash"), t("slowOperators")] };
  return { name: t("balancedExpansion"), description: t("balancedExpansionDesc"), winners: [t("diversifiedPortfolios"), t("synergyStacks")], losers: [t("singleAssetRuns"), t("leveragedExpansion")] };
}

function decisionDescription(choice) {
  if (choice.revenue_bonus && choice.risk > 0) return t("high");
  if (choice.debt && choice.debt < 0) return t("lower");
  if (choice.cash && choice.cash > 0) return t("cashLabel");
  if (choice.expense_bonus && choice.expense_bonus < 0) return t("expenses");
  return t("strategicShift");
}

function riskLabel(choice) {
  if ((choice.risk || 0) >= 0.04) return t("high");
  if ((choice.risk || 0) > 0) return t("medium");
  if ((choice.risk || 0) < 0) return t("lower");
  return t("neutral");
}

function riskTone(choice) {
  if ((choice.risk || 0) >= 0.04) return "";
  if ((choice.risk || 0) <= 0) return "done";
  return "active";
}

function canTakeAction(cost) {
  const run = state.run;
  return run.eventResolved && !run.pendingActionDone && !run.finished && run.company.cash >= cost;
}

function upgradeCost(owned) {
  const business = businessById(owned.businessId);
  return Math.round(business.cost * (0.55 + owned.level * 0.25));
}

function businessById(id) {
  return state.businesses.find((item) => item.id === id);
}

function industryName(id) {
  const map = { retail: t("retail"), it: t("tech"), tech: t("tech"), logistics: t("logistics"), manufacturing: t("industry"), industry: t("industry"), energy: t("energy"), real_estate: t("realEstate"), media: t("media"), fund: t("finance") };
  return map[id] || id;
}

function businessBlurb(business) {
  if (business.industry === "retail") return t("consumerBusiness");
  if (business.industry === "it") return t("scalableUpside");
  if (business.industry === "logistics") return t("infrastructurePlay");
  if (business.industry === "manufacturing") return t("highOutputAsset");
  if (business.industry === "energy") return t("defensiveAsset");
  if (business.industry === "real_estate") return t("longDurationAsset");
  return t("audienceBusiness");
}

function synergyHooks(businessId) {
  const hooks = state.synergies.filter((item) => item.requires.includes(businessId)).map((item) => item.name);
  return hooks.length ? hooks.slice(0, 2).join(", ") : t("standalone");
}

function macroSensitivity(business) {
  const signals = [];
  if (business.rate_sensitivity >= 0.4) signals.push(t("rates"));
  if (business.demand_sensitivity >= 0.7) signals.push(t("demand"));
  if (business.energy_use >= 0.7) signals.push(t("energy"));
  return signals.length ? signals.join(", ") : t("balanced");
}

function matchRiskFilter(risk, filter) {
  if (filter === "low") return risk <= 0.05;
  if (filter === "mid") return risk > 0.05 && risk <= 0.09;
  if (filter === "high") return risk > 0.09;
  return true;
}

function riskBucketLabel(risk) {
  if (risk <= 0.05) return t("lowRiskBucket");
  if (risk <= 0.09) return t("midRiskBucket");
  return t("highRiskBucket");
}

function rateInsight(value) {
  return value >= 0.055 ? t("rateInsightHigh") : t("rateInsightLow");
}

function inflationInsight(value) {
  return value >= 0.05 ? t("inflationInsightHigh") : t("inflationInsightLow");
}

function demandInsight(value) {
  return value <= 0.92 ? t("demandInsightLow") : t("demandInsightHigh");
}

function energyInsight(value) {
  return value >= 1.15 ? t("energyInsightHigh") : t("energyInsightLow");
}

function creditInsight(value) {
  return value >= 1.12 ? t("creditInsightHigh") : t("creditInsightLow");
}

function marketRiskInsight(value) {
  return value >= 0.12 ? t("marketRiskInsightHigh") : t("marketRiskInsightLow");
}

function describeEffects(source) {
  const parts = [];
  if (source.cash) parts.push(`${t("cash")} ${signedMoney(source.cash)}`);
  if (source.debt) parts.push(`${t("debt")} ${signedMoney(source.debt)}`);
  if (source.risk) parts.push(`${t("risk")} ${signedPercent(source.risk)}`);
  if (source.revenue_bonus) parts.push(`${t("revenue")} ${signedPercent(source.revenue_bonus)}`);
  if (source.expense_bonus) parts.push(`${t("expenses")} ${signedPercent(source.expense_bonus)}`);
  if (source.interest_rate) parts.push(`${t("rate")} ${signedPercent(source.interest_rate)}`);
  if (source.inflation) parts.push(`${t("inflation")} ${signedPercent(source.inflation)}`);
  if (source.demand) parts.push(`${t("demand")} ${signedPercent(source.demand)}`);
  if (source.energy_cost) parts.push(`${t("energyCost")} ${signedPercent(source.energy_cost)}`);
  if (source.credit_availability) parts.push(`${t("creditAvailability")} ${signedPercent(source.credit_availability)}`);
  if (source.market_risk) parts.push(`${t("marketRisk")} ${signedPercent(source.market_risk)}`);
  if (source.temporary_effects && source.duration_turns) {
    parts.push(`${formatTemporaryEffects(source.temporary_effects)} / ${source.duration_turns}t`);
  }
  return parts.join(" | ");
}

function activeTemporaryTotals() {
  return state.run.activeModifiers.reduce((acc, modifier) => {
    for (const [key, value] of Object.entries(modifier.effects)) {
      acc[key] = (acc[key] || 0) + value;
    }
    return acc;
  }, { revenue_bonus: 0, expense_bonus: 0, risk: 0, interest_rate: 0, inflation: 0, demand: 0, energy_cost: 0, credit_availability: 0, market_risk: 0 });
}

function effectiveMacro() {
  const base = state.run.macro;
  const temporary = activeTemporaryTotals();
  return {
    interestRate: Math.max(0.01, base.interestRate + (temporary.interest_rate || 0)),
    inflation: Math.max(0.01, base.inflation + (temporary.inflation || 0)),
    demand: Math.max(0.01, base.demand + (temporary.demand || 0)),
    energyCost: Math.max(0.01, base.energyCost + (temporary.energy_cost || 0)),
    creditAvailability: Math.max(0.01, base.creditAvailability + (temporary.credit_availability || 0)),
    marketRisk: Math.max(0.01, base.marketRisk + (temporary.market_risk || 0))
  };
}

function tickModifiers() {
  state.run.activeModifiers = state.run.activeModifiers
    .map((modifier) => ({ ...modifier, remainingTurns: modifier.remainingTurns - 1 }))
    .filter((modifier) => modifier.remainingTurns > 0);
}

function formatTemporaryEffects(effects) {
  const parts = [];
  if (effects.revenue_bonus) parts.push(`${t("revenue")} ${signedPercent(effects.revenue_bonus)}`);
  if (effects.expense_bonus) parts.push(`${t("expenses")} ${signedPercent(effects.expense_bonus)}`);
  if (effects.risk) parts.push(`${t("risk")} ${signedPercent(effects.risk)}`);
  if (effects.interest_rate) parts.push(`${t("rate")} ${signedPercent(effects.interest_rate)}`);
  if (effects.demand) parts.push(`${t("demand")} ${signedPercent(effects.demand)}`);
  if (effects.energy_cost) parts.push(`${t("energyCost")} ${signedPercent(effects.energy_cost)}`);
  return parts.join(", ");
}

function describeModifier(modifier) {
  return `${modifier.label}: ${formatTemporaryEffects(modifier.effects)} (${modifier.remainingTurns}t)`;
}

function headerActions() {
  return "";
}

function tabTitle() {
  const map = {
    dashboard: t("dashboard"),
    decisions: t("decisions"),
    portfolio: t("portfolio"),
    market: t("market"),
    economy: t("economy"),
    meta: t("metaProgress"),
    runEnd: t("runEndTitle")
  };
  return map[state.activeTab] || t("gameTitle");
}

function headerStatusText(run) {
  if (run.finished) return run.statusMessage;
  if (run.eventResolved) return run.pendingActionDone ? t("turnReadyToAdvance") : t("chooseAction");
  return t("resolveEventThenAction");
}

function compactStatusChip() {
  if (!state.run.eventResolved && ["decisions", "portfolio", "market"].includes(state.activeTab)) {
    return t("eventNeedsDecision");
  }
  if (state.activeTab === "decisions") {
    if (!state.run.eventResolved) return t("eventNeedsDecision");
    if (!state.run.pendingActionDone) return t("chooseAction");
    return t("turnReadyToAdvance");
  }
  if (state.activeTab === "portfolio") return state.run.pendingActionDone ? t("turnReadyToAdvance") : t("portfolioReady");
  if (state.activeTab === "market") return state.run.pendingActionDone ? t("turnReadyToAdvance") : t("marketReady");
  if (state.activeTab === "economy") return t("economyWatch");
  return state.run.pendingActionDone ? t("turnReadyToAdvance") : t("active");
}

function statusChip(text, tone = "") {
  return `<span class="status-chip ${tone}">${text}</span>`;
}

function turnReady() {
  return !!(state.run && state.run.eventResolved && state.run.pendingActionDone);
}

function openMeta() {
  state.activeTab = "meta";
  render();
}

function backToDashboard() {
  state.activeTab = "dashboard";
  render();
}

function renderUnlockCard(unlock) {
  const level = unlockLevel(unlock.id);
  const stateInfo = unlockState(unlock);
  const cost = metaCost(unlock, level);
  const maxLabel = unlock.maxLevel ? `${level}/${unlock.maxLevel}` : `${level}`;
  return `
    <article class="prestige-card ${stateInfo.tone}">
      <div class="prestige-card-top">
        <div class="tag-row">
          ${tag(metaCategoryLabel(unlock), "accent")}
          ${tag(stateInfo.status)}
          ${unlock.repeatable ? tag(`${t("levelProgressLabel")} ${maxLabel}`) : ""}
        </div>
        <strong class="prestige-cost">${state.meta.totalKnowledge}/${cost}</strong>
      </div>
      <h3>${t(unlock.titleKey)}</h3>
      <p>${t(unlock.descriptionKey)}</p>
      <div class="business-metrics">
        <div><span>${t("costLabel")}</span><strong>${cost} ${t("knowledge").toLowerCase()}</strong></div>
        <div><span>${t("statusLabel") || "Status"}</span><strong>${stateInfo.status}</strong></div>
        ${unlock.repeatable ? `<div><span>${t("currentEffectLabel")}</span><strong>${unlockCurrentEffect(unlock, level)}</strong></div>` : `<div><span>${t("currentEffectLabel")}</span><strong>${unlockCurrentEffect(unlock, Math.max(1, level))}</strong></div>`}
        ${unlock.repeatable && !(unlock.maxLevel && level >= unlock.maxLevel) ? `<div><span>${t("nextEffectLabel")}</span><strong>${unlockNextEffect(unlock, level)}</strong></div>` : ""}
      </div>
      <button class="business-button prestige-button" data-meta-unlock="${unlock.id}" ${stateInfo.disabled ? "disabled" : ""}>${stateInfo.button}</button>
    </article>
  `;
}

function purchaseUnlock(unlockId) {
  const unlock = META_UNLOCKS.find((item) => item.id === unlockId);
  const level = unlockLevel(unlockId);
  const effectiveCost = unlock ? metaCost(unlock, level) : 0;
  if (!unlock || (hasPurchasedUnlock(unlockId) && !unlock.repeatable)) return;
  if (unlock.repeatable && unlock.maxLevel && level >= unlock.maxLevel) return;
  if (state.meta.totalKnowledge < effectiveCost) {
    if (state.run) state.run.statusMessage = t("notEnoughKnowledge");
    render();
    return;
  }
  state.meta.totalKnowledge -= effectiveCost;
  state.meta.purchasedUnlockIds.push(unlock.id);
  state.meta.unlockLevels[unlock.id] = level + 1;
  if (unlock.type === "industry") state.meta.unlockedIndustries.push(unlock.payload.industry);
  if (unlock.type === "cards") state.meta.unlockedCards.push(...unlock.payload.cards);
  state.meta.unlockedIndustries = uniqueList(state.meta.unlockedIndustries);
  state.meta.unlockedCards = uniqueList(state.meta.unlockedCards);
  state.meta.purchasedUnlockIds = uniqueList(state.meta.purchasedUnlockIds);
  saveMetaProgression();
  if (state.run) state.run.statusMessage = `${t("unlockPurchased")}: ${t(unlock.titleKey)}`;
  saveCurrentRun();
  render();
}

function resetMetaProgression() {
  if (!window.confirm(t("confirmResetMeta"))) return;
  state.meta = createDefaultMetaProgression();
  state.metaFilter = "all";
  saveMetaProgression();
  if (state.run) state.run.statusMessage = t("resetMetaConfirm");
  render();
}

function metaStartingBonuses() {
  return META_UNLOCKS.reduce((acc, unlock) => {
    if (!hasPurchasedUnlock(unlock.id) || unlock.type !== "starting_bonus") return acc;
    acc.extraCash += unlock.payload.extraCash || 0;
    acc.debtThresholdBonus += unlock.payload.debtThresholdBonus || 0;
    return acc;
  }, { extraCash: 0, debtThresholdBonus: 0 });
}

function currentMaxTurns(targetRun = state.run) {
  return targetRun?.maxTurns || nextRunMaxTurns();
}

function debtPressureThreshold(run) {
  const baseThreshold = Math.max(10000 + metaStartingBonuses().debtThresholdBonus, run.company.cash * 4);
  return applyDifficultyToDebtThreshold(baseThreshold, run.difficultyId);
}

function summarizeRun(run) {
  const report = calculateReport();
  return {
    turnReached: Math.min(run.turn, currentMaxTurns(run)),
    cash: run.company.cash,
    debt: run.company.debt,
    profit: report.profit,
    valuation: report.valuation
  };
}

function calculateKnowledgeReward(run) {
  const summary = run.resultSummary || summarizeRun(run);
  if (run.endReason !== "completed_all_turns" && summary.turnReached < 3) return 0;
  let reward = 5;
  reward += summary.turnReached;
  reward += Math.floor(Math.max(0, summary.valuation) / 25000);
  if (summary.turnReached >= currentMaxTurns(run)) reward += 3;
  if (summary.valuation > 150000) reward += 5;
  return applyDifficultyToKnowledgeReward(reward, run.difficultyId);
}

function claimRunReward(run) {
  if (run.rewardClaimed) return;
  run.rewardClaimed = true;
  state.meta.totalKnowledge += run.knowledgeEarned;
  state.meta.completedRuns += 1;
  state.meta.bestValuation = Math.max(state.meta.bestValuation, run.resultSummary.valuation);
  state.meta.bestTurnReached = Math.max(state.meta.bestTurnReached, run.resultSummary.turnReached);
  saveMetaProgression();
}

function hasPurchasedUnlock(unlockId) {
  return state.meta.purchasedUnlockIds.includes(unlockId);
}

function unlockLevel(unlockId) {
  return Number(state.meta.unlockLevels?.[unlockId] || 0);
}

function industryUnlocked(industry) {
  return state.meta.unlockedIndustries.includes(industry);
}

function cardUnlocked(card) {
  if (!ADVANCED_FINANCE_CARD_IDS.includes(card.id)) return true;
  return state.meta.unlockedCards.includes(card.id);
}

function eventUnlocked(event) {
  if (!event.meta_unlock_id) return true;
  return state.meta.unlockedEvents.includes(event.id) || hasPurchasedUnlock(event.meta_unlock_id);
}

function unlockedContentTags() {
  const tags = state.meta.unlockedIndustries
    .filter((industry) => !STARTING_UNLOCKED_INDUSTRIES.includes(industry))
    .map(industryName);
  if (hasPurchasedUnlock("unlock_advanced_finance_cards")) tags.push(t("unlockAdvancedFinanceCards"));
  if (hasPurchasedUnlock("unlock_extra_cash")) tags.push(t("unlockExtraCash"));
  if (hasPurchasedUnlock("unlock_lower_debt_risk")) tags.push(t("unlockLowerDebtRisk"));
  if (hasPurchasedUnlock("unlock_synergy_scanner")) tags.push(t("unlockSynergyScanner"));
  return tags.length ? tags : [t("noUnlocksYet")];
}

function endReasonLabel(reason) {
  if (reason === "completed_all_turns") return t("completedAllTurns");
  if (reason === "debt_collapse") return t("debtCollapse");
  return t("bankruptcy");
}

function uniqueList(items) {
  return [...new Set(items)];
}

function validateGameData() {
  const errors = [];
  const businessIds = new Set();
  const eventIds = new Set();
  const cardIds = new Set();
  const validIndustries = new Set(["retail", "it", "logistics", "manufacturing", "energy", "real_estate", "media"]);

  state.businesses.forEach((business) => {
    if (!business.id) errors.push("Business missing id");
    if (businessIds.has(business.id)) errors.push(`Duplicate business id: ${business.id}`);
    businessIds.add(business.id);
    if (!(business.cost > 0)) errors.push(`Business cost invalid: ${business.id}`);
    if (business.revenue < 0) errors.push(`Business revenue invalid: ${business.id}`);
    if (business.expense < 0) errors.push(`Business expense invalid: ${business.id}`);
    if (!validIndustries.has(business.industry)) errors.push(`Business industry invalid: ${business.id}`);
    if (!(business.max_level > 0)) errors.push(`Business max_level invalid: ${business.id}`);
    if (business.risk < 0 || business.risk > 1) errors.push(`Business risk invalid: ${business.id}`);
  });

  state.events.forEach((event) => {
    if (!event.id) errors.push("Event missing id");
    if (eventIds.has(event.id)) errors.push(`Duplicate event id: ${event.id}`);
    eventIds.add(event.id);
    if (!(event.weight > 0)) errors.push(`Event weight invalid: ${event.id}`);
    if (!Array.isArray(event.choices) || !event.choices.length) errors.push(`Event choices missing: ${event.id}`);
    (event.choices || []).forEach((choice, index) => {
      if (!choice.title) errors.push(`Event choice title missing: ${event.id}:${index}`);
    });
  });

  state.cards.forEach((card) => {
    if (!card.id) errors.push("Card missing id");
    if (cardIds.has(card.id)) errors.push(`Duplicate card id: ${card.id}`);
    cardIds.add(card.id);
    if (card.cost != null && card.cost < 0) errors.push(`Card cost invalid: ${card.id}`);
  });

  state.synergies.forEach((synergy) => {
    (synergy.requires || []).forEach((id) => {
      if (!businessIds.has(id)) errors.push(`Synergy references missing business: ${synergy.id}:${id}`);
    });
    if (typeof synergy.revenue_bonus !== "number" && typeof synergy.expense_bonus !== "number") {
      errors.push(`Synergy bonus missing: ${synergy.id}`);
    }
  });

  Object.keys(translations.en).forEach((key) => {
    if (!(key in translations.ru)) errors.push(`Missing ru translation: ${key}`);
  });
  Object.keys(translations.ru).forEach((key) => {
    if (!(key in translations.en)) errors.push(`Missing en translation: ${key}`);
  });

  if (errors.length) console.error("validateGameData()", errors);
  else console.info(t("devValidationPassed"));
  return errors;
}

function simulateRuns(count = 100) {
  const results = Array.from({ length: count }, () => simulateSingleRun());
  const valuations = results.map((item) => item.valuation).sort((a, b) => a - b);
  const completedRuns = results.filter((item) => item.reason === "completed_all_turns").length;
  const summary = {
    runs: count,
    averageFinalValuation: average(results.map((item) => item.valuation)),
    medianFinalValuation: valuations[Math.floor(valuations.length / 2)] || 0,
    bankruptcyRate: `${Math.round(((count - completedRuns) / Math.max(1, count)) * 100)}%`,
    averageTurnReached: average(results.map((item) => item.turnReached)),
    averageDebt: average(results.map((item) => item.debt)),
    averageCash: average(results.map((item) => item.cash)),
    bestValuation: Math.max(...results.map((item) => item.valuation)),
    worstValuation: Math.min(...results.map((item) => item.valuation)),
    completedAll10Turns: `${Math.round((completedRuns / Math.max(1, count)) * 100)}%`
  };
  console.table(summary);
  return { summary, results };
}

function simulateSingleRun() {
  const sim = {
    maxTurns: nextRunMaxTurns(),
    turn: 1,
    company: {
      cash: STARTING_CASH + metaStartingBonuses().extraCash,
      debt: 0,
      risk: 0.05,
      revenueBonus: 0,
      expenseBonus: 0,
      businesses: [{ businessId: sample(["coffee_shop", "mini_market", "mobile_studio"]), level: 1 }]
    },
    macro: { interestRate: 0.04, inflation: 0.03, demand: 1, energyCost: 1, creditAvailability: 1, marketRisk: 0.05 },
    activeModifiers: []
  };

  while (sim.turn <= currentMaxTurns(sim)) {
    const report = simulationReport(sim);
    sim.company.cash += Math.round(report.profit);
    sim.company.risk = clamp(sim.company.risk + sim.macro.marketRisk * 0.1, 0.01, 0.95);
    sim.activeModifiers = sim.activeModifiers.map((modifier) => ({ ...modifier, remainingTurns: modifier.remainingTurns - 1 })).filter((modifier) => modifier.remainingTurns > 0);

    const eventPool = state.events.filter((event) => simulationEventAllowed(sim, event)).filter(eventUnlocked);
    const event = eventPool.length ? sample(eventPool) : null;
    if (event) {
      simulationApplyEffects(sim, event);
      const choice = pickBestChoice(event.choices || []);
      if (choice) simulationApplyEffects(sim, choice);
    }

    const bestBusiness = pickBestBusiness(state.businesses.filter((business) => industryUnlocked(business.industry)), sim);
    const bestCard = pickBestCard(state.cards.filter(cardUnlocked), sim);
    if (bestBusiness && sim.company.cash >= bestBusiness.cost && !sim.company.businesses.some((owned) => owned.businessId === bestBusiness.id)) {
      sim.company.cash -= bestBusiness.cost;
      sim.company.businesses.push({ businessId: bestBusiness.id, level: 1 });
    } else if (bestCard && sim.company.cash >= (bestCard.cost || 0)) {
      sim.company.cash -= bestCard.cost || 0;
      simulationApplyEffects(sim, bestCard);
    } else {
      const upgrade = pickUpgradeTarget(sim);
      if (upgrade) {
        const upgradePrice = Math.round(businessById(upgrade.businessId).cost * (0.55 + upgrade.level * 0.25));
        if (sim.company.cash >= upgradePrice) {
          sim.company.cash -= upgradePrice;
          upgrade.level += 1;
        }
      }
    }

    const simulationThreshold = Math.max(10000 + metaStartingBonuses().debtThresholdBonus, sim.company.cash * 4);
    const debtPressure = sim.company.debt > applyDifficultyToDebtThreshold(simulationThreshold, sim.difficultyId);
    const cashBankruptcy = sim.company.cash < -5000;
    const debtCollapse = !cashBankruptcy && debtPressure && Math.random() < sim.company.risk;
    if (cashBankruptcy || debtCollapse) {
      const finalReport = simulationReport(sim);
      return { reason: debtCollapse ? "debt_collapse" : "bankruptcy", turnReached: sim.turn, cash: sim.company.cash, debt: sim.company.debt, valuation: finalReport.valuation };
    }

    sim.turn += 1;
  }

  const finalReport = simulationReport(sim);
  return { reason: "completed_all_turns", turnReached: currentMaxTurns(sim), cash: sim.company.cash, debt: sim.company.debt, valuation: finalReport.valuation };
}

function simulationReport(sim) {
  const temporary = sim.activeModifiers.reduce((acc, modifier) => {
    for (const [key, value] of Object.entries(modifier.effects)) acc[key] = (acc[key] || 0) + value;
    return acc;
  }, { revenue_bonus: 0, expense_bonus: 0, risk: 0, interest_rate: 0, inflation: 0, demand: 0, energy_cost: 0, credit_availability: 0, market_risk: 0 });
  const macro = {
    interestRate: Math.max(0.01, sim.macro.interestRate + (temporary.interest_rate || 0)),
    inflation: Math.max(0.01, sim.macro.inflation + (temporary.inflation || 0)),
    demand: Math.max(0.01, sim.macro.demand + (temporary.demand || 0)),
    energyCost: Math.max(0.01, sim.macro.energyCost + (temporary.energy_cost || 0)),
    creditAvailability: Math.max(0.01, sim.macro.creditAvailability + (temporary.credit_availability || 0)),
    marketRisk: Math.max(0.01, sim.macro.marketRisk + (temporary.market_risk || 0))
  };
  let revenue = 0;
  let expenses = 0;
  for (const owned of sim.company.businesses) {
    const business = businessById(owned.businessId);
    const levelMultiplier = 1 + (owned.level - 1) * 0.45;
    revenue += business.revenue * levelMultiplier * (1 + ((macro.demand - 1) * business.demand_sensitivity)) * (1 + macro.inflation * 0.7);
    expenses += business.expense * levelMultiplier * Math.max(0.5, 1 + ((macro.energyCost - 1) * business.energy_use)) * (1 + macro.inflation);
  }
  revenue *= 1 + sim.company.revenueBonus + temporary.revenue_bonus;
  expenses *= Math.max(0.2, 1 + sim.company.expenseBonus + temporary.expense_bonus);
  const interest = sim.company.debt * macro.interestRate;
  const profit = revenue - expenses - interest;
  const assetTotal = sim.company.businesses.reduce((sum, owned) => sum + businessById(owned.businessId).cost * (1 + owned.level * 0.25), 0);
  return { profit, valuation: sim.company.cash + assetTotal + Math.max(0, profit * 8) - sim.company.debt };
}

function simulationApplyEffects(sim, source) {
  sim.company.cash += source.cash || 0;
  sim.company.debt = Math.max(0, sim.company.debt + (source.debt || 0));
  sim.company.risk = clamp(sim.company.risk + (source.risk || 0), 0.01, 0.95);
  sim.company.revenueBonus += source.revenue_bonus || 0;
  sim.company.expenseBonus += source.expense_bonus || 0;
  if (source.interest_rate) sim.macro.interestRate = Math.max(0.01, sim.macro.interestRate + source.interest_rate);
  if (source.inflation) sim.macro.inflation = Math.max(0.01, sim.macro.inflation + source.inflation);
  if (source.demand) sim.macro.demand = Math.max(0.01, sim.macro.demand + source.demand);
  if (source.energy_cost) sim.macro.energyCost = Math.max(0.01, sim.macro.energyCost + source.energy_cost);
  if (source.credit_availability) sim.macro.creditAvailability = Math.max(0.01, sim.macro.creditAvailability + source.credit_availability);
  if (source.market_risk) sim.macro.marketRisk = Math.max(0.01, sim.macro.marketRisk + source.market_risk);
  if (source.temporary_effects && source.duration_turns) {
    sim.activeModifiers.push({ effects: source.temporary_effects, remainingTurns: source.duration_turns });
  }
}

function simulationEventAllowed(sim, event) {
  if (sim.turn < (event.min_turn || 1)) return false;
  if (sim.turn > (event.max_turn || currentMaxTurns(sim))) return false;
  if (event.min_debt != null && sim.company.debt < event.min_debt) return false;
  if (event.max_debt != null && sim.company.debt > event.max_debt) return false;
  if (event.allowed_industries?.length) {
    const ownedIndustries = new Set(sim.company.businesses.map((item) => businessById(item.businessId).industry));
    if (!event.allowed_industries.some((industry) => ownedIndustries.has(industry))) return false;
  }
  return true;
}

function pickBestChoice(choices) {
  return [...choices].sort((a, b) => choiceScore(b) - choiceScore(a))[0];
}

function pickBestCard(cards, sim) {
  return cards.filter((card) => sim.company.cash >= (card.cost || 0)).sort((a, b) => choiceScore(b) - choiceScore(a))[0];
}

function pickBestBusiness(businesses, sim) {
  return businesses
    .filter((business) => !sim.company.businesses.some((owned) => owned.businessId === business.id))
    .sort((a, b) => ((b.revenue - b.expense) / b.cost) - ((a.revenue - a.expense) / a.cost))[0];
}

function pickUpgradeTarget(sim) {
  return [...sim.company.businesses]
    .filter((owned) => owned.level < businessById(owned.businessId).max_level)
    .sort((a, b) => (businessById(b.businessId).revenue - businessById(b.businessId).expense) - (businessById(a.businessId).revenue - businessById(a.businessId).expense))[0];
}

function choiceScore(choice) {
  return (choice.cash || 0) + ((choice.debt || 0) * -0.4) + ((choice.revenue_bonus || 0) * 10000) - ((choice.expense_bonus || 0) * 7000) - ((choice.risk || 0) * 12000);
}

function average(values) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
}

function money(value) {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function stockMoney(value) {
  return `$${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function percent(value) {
  return `${Math.round(value * 100)}%`;
}

function signedPercent(value) {
  return `${value >= 0 ? "+" : ""}${Math.round(value * 100)}%`;
}

function signedStockPercent(value) {
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
}

function signedMoney(value) {
  return `${value >= 0 ? "+" : "-"}$${Math.abs(Math.round(value)).toLocaleString("en-US")}`;
}

function signedStockMoney(value) {
  return `${value >= 0 ? "+" : "-"}$${Math.abs(Number(value || 0)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function tag(text, tone = "") {
  return `<span class="tag ${tone}">${text}</span>`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function sample(items) {
  return items[Math.floor(Math.random() * items.length)];
}

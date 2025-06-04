type Plan = "free" | "basic" | "standard" | "pro";

const PLAN_LIMITS = {
  free: {
    pricing: 0,
    interviews: 5,
    aiBasedQuestions: 5,
    questionsPerInterview: 10,
    attemptsPerInterview: 1,
    candidatesPerInterview: 5,
  },
  standard: {
    pricing: 19,
    interviews: 10,
    aiBasedQuestions: 10,
    questionsPerInterview: 20,
    attemptsPerInterview: 3,
    candidatesPerInterview: 10,
  },
  pro: {
    pricing: 49,
    interviews: 25,
    aiBasedQuestions: 15,
    questionsPerInterview: 30,
    attemptsPerInterview: 5,
    candidatesPerInterview: 20,
  },
};

const getCreditsForPlan = (plan: Plan) => {
  switch (plan) {
    case "free":
      return 5;
    case "basic":
      return 10;
    case "standard":
      return 20;
    case "pro":
      return 30;
    default:
      return 0;
  }
};

const isDowngrade = (current: Plan, target: Plan) => {
  const planRanks = {
    free: 0,
    basic: 1,
    standard: 2,
    pro: 3,
  };

  return planRanks[target] < planRanks[current];
};

const getSubscriptionPricingId = (plan: Plan) => {
  switch (plan) {
    case "basic":
      return process.env.STRIPE_BASIC_PLAN_ID!;
    case "standard":
      return process.env.STRIPE_STANDARD_PLAN_ID!;
    case "pro":
      return process.env.STRIPE_PRO_PLAN_ID!;
  }
};

export {
  getCreditsForPlan,
  isDowngrade,
  PLAN_LIMITS,
  getSubscriptionPricingId,
};

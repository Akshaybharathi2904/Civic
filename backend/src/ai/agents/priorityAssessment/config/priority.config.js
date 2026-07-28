export const PriorityConfig = Object.freeze({
  BASE_SEVERITY_SCORES: {
    Critical: 85,
    High: 65,
    Medium: 45,
    Low: 25,
  },
  SLA_HOURS: {
    Critical: 6,
    High: 24,
    Medium: 48,
    Low: 72,
  },
  PRIORITY_BOUNDARIES: {
    Critical: 85,
    High: 65,
    Medium: 40,
  },
  EMERGENCY_HAZARD_KEYWORDS: [
    'open manhole',
    'live wire',
    'spark',
    'flood',
    'collapse',
    'toxic',
    'fire',
    'explosion',
    'gas leak',
  ],
  BOOSTS: {
    EMERGENCY_KEYWORD: 15,
    COMMUNITY_VERIFIED: 10,
    DUPLICATE_PER_TICKET: 5,
    MAX_DUPLICATE_BOOST: 20,
  },
});

export default PriorityConfig;

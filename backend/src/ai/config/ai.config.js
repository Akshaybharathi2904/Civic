export const AIConfig = Object.freeze({
  DEFAULT_MODEL: process.env.AI_MODEL || 'claude-3-5-sonnet-20241022',
  FALLBACK_MODEL: 'gpt-4o-mini',
  TEMPERATURE: 0.2,
  MAX_TOKENS: 1024,
  TIMEOUT_MS: 15000,
  DUPLICATE_RADIUS_METERS: 500,
  SIMILARITY_THRESHOLD: 0.75,
  SLA_HOURS: {
    Critical: 6,
    High: 24,
    Medium: 48,
    Low: 72,
  },
  AGENT_STEPS: [
    { number: 1, name: 'Complaint Understanding Agent', key: 'understanding' },
    { number: 2, name: 'Vision Analysis Agent', key: 'vision' },
    { number: 3, name: 'Location Intelligence Agent', key: 'location' },
    { number: 4, name: 'Duplicate Detection Agent', key: 'duplicate' },
    { number: 5, name: 'Department Routing Agent', key: 'routing' },
    { number: 6, name: 'Priority Scoring Agent', key: 'priority' },
  ],
});

export default AIConfig;

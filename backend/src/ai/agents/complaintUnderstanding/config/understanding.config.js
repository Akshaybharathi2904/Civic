export const UnderstandingConfig = Object.freeze({
  DEFAULT_CONFIDENCE: 0.95,
  CATEGORIES: [
    'Road Infrastructure',
    'Water & Sanitation',
    'Solid Waste Management',
    'Public Lighting',
    'Drainage & Sewage',
    'Traffic & Public Safety',
    'Parks & Environment',
    'General Civic Nuisance',
  ],
  SEVERITY_KEYWORDS: {
    Critical: ['danger', 'emergency', 'collapse', 'fire', 'spark', 'open manhole', 'flood', 'toxic'],
    High: ['pothole', 'burst', 'leak', 'overflow', 'broken', 'garbage dump', 'sewage'],
    Medium: ['stagnant', 'flickering', 'debris', 'uncollected', 'damaged'],
    Low: ['noise', 'litter', 'faded', 'cosmetic'],
  },
});

export default UnderstandingConfig;

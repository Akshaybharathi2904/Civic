export const STORAGE_KEYS = {
  AUTH_TOKEN: 'civicswarm_token',
  USER_DATA: 'civicswarm_user',
  THEME_MODE: 'civicswarm_theme',
} as const;

export const COMPLAINT_CATEGORIES = [
  'Pothole / Road Hazard',
  'Garbage Overflow / Waste',
  'Water Supply / Leakage',
  'Streetlight Outage',
  'Drainage Blockage',
  'Traffic Light Malfunction',
  'Unauthorized Construction',
  'Tree Fall / Fallen Debris',
  'Public Nuisance',
  'Other Civic Issue',
] as const;

export const DEPARTMENTS = [
  { code: 'PWD', name: 'Public Works Department' },
  { code: 'BBMP', name: 'Bruhat Bengaluru Mahanagara Palike' },
  { code: 'BWSSB', name: 'Water Supply and Sewerage Board' },
  { code: 'BESCOM', name: 'Electricity Supply Company' },
  { code: 'TRAFFIC', name: 'Traffic Management Directorate' },
] as const;

export const MAP_DEFAULTS = {
  CENTER: [12.9716, 77.5946] as [number, number],
  ZOOM: 12,
} as const;

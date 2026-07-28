export const LocationConfig = Object.freeze({
  DEFAULT_CONFIDENCE: 0.98,
  DEFAULT_CITY: 'Coimbatore',
  DEFAULT_STATE: 'Tamil Nadu',
  DEFAULT_MUNICIPALITY: 'Coimbatore Municipal Corporation',
  DEFAULT_DISTRICT: 'Coimbatore District',
  DEFAULT_POSTAL_CODE: '641002',
  DEFAULT_ADMINISTRATIVE_REGION: 'Urban West Zone 4',

  WARDS: [
    { name: 'Ward 72 - RS Puram', zone: 'Central Zone', landmark: 'Brookefields Mall' },
    { name: 'Ward 45 - Gandhipuram', zone: 'North Zone', landmark: 'Cross Cut Road Market' },
    { name: 'Ward 80 - Peelamedu', zone: 'East Zone', landmark: 'TIDEL Park' },
    { name: 'Ward 30 - Singanallur', zone: 'South Zone', landmark: 'Singanallur Bus Stand' },
  ],
});

export default LocationConfig;

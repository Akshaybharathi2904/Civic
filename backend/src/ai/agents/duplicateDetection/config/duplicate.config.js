export const DuplicateConfig = Object.freeze({
  SIMILARITY_THRESHOLD: 0.75,
  MAX_SPATIAL_RADIUS_METERS: 500,
  WEIGHTS: {
    geoProximity: 0.35,
    summarySimilarity: 0.25,
    categoryMatch: 0.15,
    keywordOverlap: 0.15,
    timeProximity: 0.10,
  },
  TIME_WINDOW_HOURS: 72,
});

export default DuplicateConfig;

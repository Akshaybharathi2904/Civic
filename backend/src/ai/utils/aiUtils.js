export const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

export const sanitizeJsonResponse = (rawText) => {
  if (typeof rawText !== 'string') return rawText;
  const clean = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch (err) {
    return null;
  }
};

export const estimateTokenCount = (text) => {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
};

export default {
  calculateDistanceMeters,
  sanitizeJsonResponse,
  estimateTokenCount,
};

/**
 * Calculate Haversine distance between two sets of [lng, lat] in meters
 */
export function calculateDistanceMeters(coord1, coord2) {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Reverse Geocode approximation for Bengaluru wards
 */
export function reverseGeocodeApprox(lat, lng) {
  // Common wards in Bengaluru based on coordinates
  if (lat > 12.97 && lng > 77.62) {
    return { ward: 'Ward 80 - Indiranagar', zone: 'East Zone', district: 'Bengaluru Urban', city: 'Bengaluru', state: 'Karnataka' };
  } else if (lat > 12.93 && lng > 77.61) {
    return { ward: 'Ward 150 - Koramangala', zone: 'South Zone', district: 'Bengaluru Urban', city: 'Bengaluru', state: 'Karnataka' };
  } else if (lat > 12.91 && lng > 77.58) {
    return { ward: 'Ward 177 - Jayanagar', zone: 'South Zone', district: 'Bengaluru Urban', city: 'Bengaluru', state: 'Karnataka' };
  } else if (lat > 12.98 && lng > 77.59) {
    return { ward: 'Ward 93 - Vasanth Nagar', zone: 'Central Zone', district: 'Bengaluru Urban', city: 'Bengaluru', state: 'Karnataka' };
  } else if (lat > 13.01 && lng > 77.56) {
    return { ward: 'Ward 36 - Malleshwaram', zone: 'West Zone', district: 'Bengaluru Urban', city: 'Bengaluru', state: 'Karnataka' };
  } else if (lat > 12.92 && lng > 77.67) {
    return { ward: 'Ward 149 - HSR Layout & Bellandur', zone: 'Mahadevapura Zone', district: 'Bengaluru Urban', city: 'Bengaluru', state: 'Karnataka' };
  }

  return {
    ward: `Ward ${Math.floor(Math.abs(lat * 100) % 198) + 1} - Central`,
    zone: 'BBMP Central Zone',
    district: 'Bengaluru Urban',
    city: 'Bengaluru',
    state: 'Karnataka'
  };
}

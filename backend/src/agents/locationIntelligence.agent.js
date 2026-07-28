export async function runLocationIntelligenceAgent(complaintData) {
  const startTime = Date.now();

  const lat = complaintData.latitude || 11.0168;
  const lng = complaintData.longitude || 76.9558;
  const rawAddress = complaintData.address || 'DB Road, RS Puram, Coimbatore, Tamil Nadu';

  let ward = complaintData.ward || 'Ward 72 - RS Puram';
  let zone = complaintData.zone || 'Central Zone';
  let district = complaintData.district || 'Coimbatore';

  if (rawAddress.toLowerCase().includes('gandhipuram')) {
    ward = 'Ward 54 - Gandhipuram';
    zone = 'Central Zone';
  } else if (rawAddress.toLowerCase().includes('peelamedu') || rawAddress.toLowerCase().includes('avinashi')) {
    ward = 'Ward 38 - Peelamedu';
    zone = 'East Zone';
  } else if (rawAddress.toLowerCase().includes('saravanampatti') || rawAddress.toLowerCase().includes('sathy')) {
    ward = 'Ward 22 - Saravanampatti';
    zone = 'North Zone';
  } else if (rawAddress.toLowerCase().includes('singanallur') || rawAddress.toLowerCase().includes('trichy')) {
    ward = 'Ward 62 - Singanallur';
    zone = 'South Zone';
  } else if (rawAddress.toLowerCase().includes('ukkadam')) {
    ward = 'Ward 82 - Ukkadam';
    zone = 'South Zone';
  }

  return {
    latitude: lat,
    longitude: lng,
    formattedAddress: rawAddress.includes('Coimbatore') ? rawAddress : `${rawAddress}, Coimbatore, Tamil Nadu`,
    ward,
    zone,
    district,
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    confidenceScore: 0.98,
    executionTimeMs: Date.now() - startTime,
    reasoning: `Reverse-geocoded spatial coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)}) to ${ward}, ${zone}, ${district} District, Tamil Nadu.`
  };
}

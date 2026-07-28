export class LocationResultDTO {
  constructor({
    formattedAddress,
    ward,
    zone,
    municipality,
    district,
    state,
    postalCode,
    nearbyLandmark,
    administrativeRegion,
    confidenceScore = 0.98,
  }) {
    this.formattedAddress = formattedAddress || 'DB Road, RS Puram, Coimbatore, Tamil Nadu 641002';
    this.ward = ward || 'Ward 72 - RS Puram';
    this.zone = zone || 'Central Zone';
    this.municipality = municipality || 'Coimbatore Municipal Corporation';
    this.district = district || 'Coimbatore District';
    this.state = state || 'Tamil Nadu';
    this.postalCode = postalCode || '641002';
    this.nearbyLandmark = nearbyLandmark || 'Near Brookefields Mall';
    this.administrativeRegion = administrativeRegion || 'Urban West Zone 4';
    this.confidenceScore = Number(confidenceScore) || 0.98;
  }

  toJSON() {
    return {
      formattedAddress: this.formattedAddress,
      ward: this.ward,
      zone: this.zone,
      municipality: this.municipality,
      district: this.district,
      state: this.state,
      postalCode: this.postalCode,
      nearbyLandmark: this.nearbyLandmark,
      administrativeRegion: this.administrativeRegion,
      confidenceScore: this.confidenceScore,
    };
  }
}

export default LocationResultDTO;

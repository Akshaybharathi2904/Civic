export class LocationInputDTO {
  constructor({ complaintId, latitude, longitude, address = null }) {
    if (latitude === undefined || latitude === null || typeof Number(latitude) !== 'number' || isNaN(latitude)) {
      throw new Error('LocationInputDTO requires a valid numeric latitude.');
    }
    if (longitude === undefined || longitude === null || typeof Number(longitude) !== 'number' || isNaN(longitude)) {
      throw new Error('LocationInputDTO requires a valid numeric longitude.');
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (lat < -90 || lat > 90) {
      throw new Error(`Invalid latitude value ${lat}. Must be between -90 and +90.`);
    }
    if (lng < -180 || lng > 180) {
      throw new Error(`Invalid longitude value ${lng}. Must be between -180 and +180.`);
    }

    this.complaintId = complaintId || null;
    this.latitude = lat;
    this.longitude = lng;
    this.address = (address && typeof address === 'string') ? address.trim() : '';
  }
}

export default LocationInputDTO;

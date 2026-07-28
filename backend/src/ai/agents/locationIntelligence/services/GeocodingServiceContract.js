export class GeocodingServiceContract {
  /**
   * Abstract method: Perform reverse geocoding & administrative boundary lookup for coordinates
   */
  async reverseGeocode(latitude, longitude, rawAddress = null) {
    throw new Error('GeocodingServiceContract.reverseGeocode must be implemented by concrete geocoding services.');
  }
}

export default GeocodingServiceContract;

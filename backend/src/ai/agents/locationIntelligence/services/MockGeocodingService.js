import { GeocodingServiceContract } from './GeocodingServiceContract.js';
import { LocationConfig } from '../config/location.config.js';

export class MockGeocodingService extends GeocodingServiceContract {
  async reverseGeocode(latitude, longitude, rawAddress = '') {
    const text = (rawAddress || '').toLowerCase();

    let ward = LocationConfig.WARDS[0].name;
    let zone = LocationConfig.WARDS[0].zone;
    let nearbyLandmark = LocationConfig.WARDS[0].landmark;

    if (text.includes('gandhipuram') || text.includes('cross cut')) {
      ward = LocationConfig.WARDS[1].name;
      zone = LocationConfig.WARDS[1].zone;
      nearbyLandmark = LocationConfig.WARDS[1].landmark;
    } else if (text.includes('peelamedu') || text.includes('tidel')) {
      ward = LocationConfig.WARDS[2].name;
      zone = LocationConfig.WARDS[2].zone;
      nearbyLandmark = LocationConfig.WARDS[2].landmark;
    } else if (text.includes('singanallur') || text.includes('bus stand')) {
      ward = LocationConfig.WARDS[3].name;
      zone = LocationConfig.WARDS[3].zone;
      nearbyLandmark = LocationConfig.WARDS[3].landmark;
    }

    const formattedAddress = rawAddress && rawAddress.length > 5
      ? rawAddress
      : `Near ${nearbyLandmark}, ${ward.split(' - ')[1] || 'RS Puram'}, ${LocationConfig.DEFAULT_CITY}, ${LocationConfig.DEFAULT_STATE} ${LocationConfig.DEFAULT_POSTAL_CODE}`;

    return {
      formattedAddress,
      ward,
      zone,
      municipality: LocationConfig.DEFAULT_MUNICIPALITY,
      district: LocationConfig.DEFAULT_DISTRICT,
      state: LocationConfig.DEFAULT_STATE,
      postalCode: LocationConfig.DEFAULT_POSTAL_CODE,
      nearbyLandmark: `Near ${nearbyLandmark}`,
      administrativeRegion: LocationConfig.DEFAULT_ADMINISTRATIVE_REGION,
      confidenceScore: LocationConfig.DEFAULT_CONFIDENCE,
    };
  }
}

export default MockGeocodingService;

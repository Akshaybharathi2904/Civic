import { LocationResultDTO } from './LocationResultDTO.js';

export class LocationIntelligenceResult {
  constructor(data) {
    this.dto = new LocationResultDTO(data);
  }

  get formattedAddress() { return this.dto.formattedAddress; }
  get ward() { return this.dto.ward; }
  get zone() { return this.dto.zone; }
  get municipality() { return this.dto.municipality; }
  get district() { return this.dto.district; }
  get state() { return this.dto.state; }
  get postalCode() { return this.dto.postalCode; }
  get nearbyLandmark() { return this.dto.nearbyLandmark; }
  get administrativeRegion() { return this.dto.administrativeRegion; }
  get confidenceScore() { return this.dto.confidenceScore; }

  toDomainPayload() {
    return this.dto.toJSON();
  }
}

export default LocationIntelligenceResult;

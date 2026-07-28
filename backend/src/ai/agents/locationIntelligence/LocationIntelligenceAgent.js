import { BaseAgent } from '../BaseAgent.js';
import { LocationInputDTO } from './models/LocationInputDTO.js';
import { LocationIntelligenceResult } from './models/LocationIntelligenceResult.js';
import { MockGeocodingService } from './services/MockGeocodingService.js';
import { LocationIntelligenceError } from './errors/LocationIntelligenceError.js';

export class LocationIntelligenceAgent extends BaseAgent {
  constructor(geocodingService = new MockGeocodingService()) {
    super('Location Intelligence Agent', 3);
    this.geocodingService = geocodingService;
  }

  /**
   * Process raw location input into structured administrative location data
   */
  async processLocation(inputData) {
    try {
      const inputDTO = new LocationInputDTO(inputData);

      const rawResult = await this.geocodingService.reverseGeocode(
        inputDTO.latitude,
        inputDTO.longitude,
        inputDTO.address
      );

      const domainResult = new LocationIntelligenceResult(rawResult);
      return domainResult.toDomainPayload();
    } catch (err) {
      throw new LocationIntelligenceError(`Failed to process location intelligence: ${err.message}`, err, { inputData });
    }
  }

  async runInternal(context) {
    const inputData = {
      complaintId: context.complaintId || context.ticketId,
      latitude: context.coordinates ? context.coordinates[1] : 11.0084,
      longitude: context.coordinates ? context.coordinates[0] : 76.9508,
      address: context.address || '',
    };

    const structuredResult = await this.processLocation(inputData);

    return {
      status: 'success',
      confidence: structuredResult.confidenceScore,
      reasoning: `Geocoded coordinates [${inputData.latitude}, ${inputData.longitude}] to ${structuredResult.ward}, ${structuredResult.zone}.`,
      output: structuredResult,
      tokenUsage: { promptTokens: 90, completionTokens: 35, totalTokens: 125 },
    };
  }
}

export default LocationIntelligenceAgent;

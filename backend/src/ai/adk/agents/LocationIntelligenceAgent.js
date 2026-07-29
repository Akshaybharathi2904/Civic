import { ADKAgent } from '../core/ADKAgent.js';
import { LocationTool } from '../tools/LocationTool.js';

export class LocationIntelligenceAgent extends ADKAgent {
  constructor() {
    super('Location Intelligence Agent', 3, 'locationAnalysis');
  }

  async process(context) {
    const res = await LocationTool.execute({
      latitude: context.gpsLocation?.latitude,
      longitude: context.gpsLocation?.longitude,
      address: context.gpsLocation?.formattedAddress,
    });

    return {
      district: res.district,
      municipality: res.municipality,
      ward: res.ward,
      zone: res.zone,
      landmark: res.landmark,
      formattedAddress: res.formattedAddress,
      confidence: res.confidence,
    };
  }
}

export default LocationIntelligenceAgent;

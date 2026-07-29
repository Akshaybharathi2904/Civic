import BaseAgent from './BaseAgent.js';
import LocationIntelligenceService from '../services/LocationIntelligenceService.js';

export class LocationIntelligenceAgent extends BaseAgent {
  constructor() {
    super('Location Intelligence Agent', 3, 'location');
    this.service = new LocationIntelligenceService();
  }

  async runInternal(context) {
    return await this.service.process(context.gpsLocation);
  }
}

export default LocationIntelligenceAgent;

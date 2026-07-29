import BaseAgent from './BaseAgent.js';
import DuplicateDetectionService from '../services/DuplicateDetectionService.js';

export class DuplicateDetectionAgent extends BaseAgent {
  constructor() {
    super('Duplicate Detection Agent', 4, 'duplicate');
    this.service = new DuplicateDetectionService();
  }

  async runInternal(context) {
    return await this.service.process(context.gpsLocation, context.complaint);
  }
}

export default DuplicateDetectionAgent;

import BaseAgent from './BaseAgent.js';
import CommunityValidationService from '../services/CommunityValidationService.js';

export class CommunityValidationAgent extends BaseAgent {
  constructor() {
    super('Community Validation Agent', 5, 'community');
    this.service = new CommunityValidationService();
  }

  async runInternal(context) {
    return await this.service.process(context.complaint, context.aiResults.duplicate);
  }
}

export default CommunityValidationAgent;

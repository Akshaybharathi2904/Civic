import BaseAgent from './BaseAgent.js';
import ComplaintUnderstandingService from '../services/ComplaintUnderstandingService.js';

export class ComplaintUnderstandingAgent extends BaseAgent {
  constructor() {
    super('Complaint Understanding Agent', 1, 'understanding');
    this.service = new ComplaintUnderstandingService();
  }

  async runInternal(context) {
    return await this.service.process(context.complaint);
  }
}

export default ComplaintUnderstandingAgent;

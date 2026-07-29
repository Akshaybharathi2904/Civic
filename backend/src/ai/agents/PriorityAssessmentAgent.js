import BaseAgent from './BaseAgent.js';
import PriorityAssessmentService from '../services/PriorityAssessmentService.js';

export class PriorityAssessmentAgent extends BaseAgent {
  constructor() {
    super('Priority Assessment Agent', 6, 'priority');
    this.service = new PriorityAssessmentService();
  }

  async runInternal(context) {
    return await this.service.process(
      context.aiResults.understanding,
      context.aiResults.vision,
      context.aiResults.community
    );
  }
}

export default PriorityAssessmentAgent;

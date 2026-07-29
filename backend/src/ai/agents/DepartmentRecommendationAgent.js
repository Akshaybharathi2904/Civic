import BaseAgent from './BaseAgent.js';
import DepartmentRecommendationService from '../services/DepartmentRecommendationService.js';

export class DepartmentRecommendationAgent extends BaseAgent {
  constructor() {
    super('Department Recommendation Agent', 7, 'department');
    this.service = new DepartmentRecommendationService();
  }

  async runInternal(context) {
    return await this.service.process(
      context.aiResults.understanding,
      context.aiResults.location
    );
  }
}

export default DepartmentRecommendationAgent;

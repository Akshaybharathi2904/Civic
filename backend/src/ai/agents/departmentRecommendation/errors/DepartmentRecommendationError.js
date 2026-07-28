import { AgentExecutionError } from '../../../errors/AgentExecutionError.js';

export class DepartmentRecommendationError extends AgentExecutionError {
  constructor(message, originalError = null, contextData = {}) {
    super('Department Recommendation Agent', message, originalError, contextData);
    this.name = 'DepartmentRecommendationError';
  }
}

export default DepartmentRecommendationError;

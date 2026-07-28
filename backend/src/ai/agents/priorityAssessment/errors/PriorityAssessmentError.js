import { AgentExecutionError } from '../../../errors/AgentExecutionError.js';

export class PriorityAssessmentError extends AgentExecutionError {
  constructor(message, originalError = null, contextData = {}) {
    super('Priority Assessment Agent', message, originalError, contextData);
    this.name = 'PriorityAssessmentError';
  }
}

export default PriorityAssessmentError;

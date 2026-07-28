import { AgentExecutionError } from '../../../errors/AgentExecutionError.js';

export class CommunityValidationError extends AgentExecutionError {
  constructor(message, originalError = null, contextData = {}) {
    super('Community Validation Agent', message, originalError, contextData);
    this.name = 'CommunityValidationError';
  }
}

export default CommunityValidationError;

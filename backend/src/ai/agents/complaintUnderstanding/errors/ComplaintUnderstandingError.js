import { AgentExecutionError } from '../../../errors/AgentExecutionError.js';

export class ComplaintUnderstandingError extends AgentExecutionError {
  constructor(message, originalError = null, contextData = {}) {
    super('Complaint Understanding Agent', message, originalError, contextData);
    this.name = 'ComplaintUnderstandingError';
  }
}

export default ComplaintUnderstandingError;

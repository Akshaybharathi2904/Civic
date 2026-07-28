import { AgentExecutionError } from '../../../errors/AgentExecutionError.js';

export class DuplicateDetectionError extends AgentExecutionError {
  constructor(message, originalError = null, contextData = {}) {
    super('Duplicate Detection Agent', message, originalError, contextData);
    this.name = 'DuplicateDetectionError';
  }
}

export default DuplicateDetectionError;

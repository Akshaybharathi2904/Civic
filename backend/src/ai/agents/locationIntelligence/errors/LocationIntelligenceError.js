import { AgentExecutionError } from '../../../errors/AgentExecutionError.js';

export class LocationIntelligenceError extends AgentExecutionError {
  constructor(message, originalError = null, contextData = {}) {
    super('Location Intelligence Agent', message, originalError, contextData);
    this.name = 'LocationIntelligenceError';
  }
}

export default LocationIntelligenceError;

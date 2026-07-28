export class AgentExecutionError extends Error {
  constructor(agentName, message, originalError = null, contextData = {}) {
    super(`[${agentName}] ${message}`);
    this.name = 'AgentExecutionError';
    this.agentName = agentName;
    this.originalError = originalError;
    this.contextData = contextData;
    this.timestamp = new Date().toISOString();
  }
}

export default AgentExecutionError;

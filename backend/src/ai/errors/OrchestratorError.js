export class OrchestratorError extends Error {
  constructor(message, pipelineStep = null, failedAgent = null, originalError = null) {
    super(`[OrchestratorError] ${message}`);
    this.name = 'OrchestratorError';
    this.pipelineStep = pipelineStep;
    this.failedAgent = failedAgent;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

export default OrchestratorError;

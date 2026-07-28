export class WorkflowOrchestrationError extends Error {
  constructor(message, currentStep = null, failedAgent = null, originalError = null) {
    super(`[WorkflowOrchestrationError] ${message}`);
    this.name = 'WorkflowOrchestrationError';
    this.currentStep = currentStep;
    this.failedAgent = failedAgent;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

export default WorkflowOrchestrationError;

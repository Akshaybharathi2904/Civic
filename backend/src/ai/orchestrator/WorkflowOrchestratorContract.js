export class WorkflowOrchestratorContract {
  /**
   * Abstract method: Create new workflow instance for complaint
   */
  async createWorkflow(rawInput) {
    throw new Error('WorkflowOrchestratorContract.createWorkflow must be implemented.');
  }

  /**
   * Abstract method: Execute 10-step AI multi-agent workflow
   */
  async executeWorkflow(workflowIdOrDTO, onStepCallback = null) {
    throw new Error('WorkflowOrchestratorContract.executeWorkflow must be implemented.');
  }
}

export default WorkflowOrchestratorContract;

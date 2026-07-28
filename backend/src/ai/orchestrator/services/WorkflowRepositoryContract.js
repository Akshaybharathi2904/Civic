export class WorkflowRepositoryContract {
  /**
   * Abstract method: Save or update workflow instance
   */
  async saveWorkflow(workflowInstance) {
    throw new Error('WorkflowRepositoryContract.saveWorkflow must be implemented.');
  }

  /**
   * Abstract method: Retrieve workflow instance by ID
   */
  async getWorkflowById(workflowId) {
    throw new Error('WorkflowRepositoryContract.getWorkflowById must be implemented.');
  }
}

export default WorkflowRepositoryContract;

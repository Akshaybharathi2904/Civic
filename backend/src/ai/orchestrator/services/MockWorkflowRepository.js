import { WorkflowRepositoryContract } from './WorkflowRepositoryContract.js';

export class MockWorkflowRepository extends WorkflowRepositoryContract {
  constructor() {
    super();
    this.workflows = new Map();
  }

  async saveWorkflow(workflowInstance) {
    this.workflows.set(workflowInstance.id, workflowInstance);
    return workflowInstance;
  }

  async getWorkflowById(workflowId) {
    return this.workflows.get(workflowId) || null;
  }
}

export default MockWorkflowRepository;

import { WorkflowInstance } from '../models/WorkflowInstance.js';

export class WorkflowStateManager {
  constructor(repository) {
    this.repository = repository;
  }

  async createWorkflow(complaintId) {
    const workflowId = `wf_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const instance = new WorkflowInstance(workflowId, complaintId);
    await this.repository.saveWorkflow(instance);
    return instance;
  }

  async transitionState(workflowId, nextState, note = '') {
    const instance = await this.repository.getWorkflowById(workflowId);
    if (instance) {
      instance.transitionTo(nextState, note);
      await this.repository.saveWorkflow(instance);
    }
    return instance;
  }

  async getWorkflow(workflowId) {
    return await this.repository.getWorkflowById(workflowId);
  }
}

export default WorkflowStateManager;

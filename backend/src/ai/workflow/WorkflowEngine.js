import { WorkflowState, WorkflowStateEnum } from '../models/WorkflowState.js';

export class WorkflowEngine {
  constructor() {
    this.activeWorkflows = new Map();
  }

  /**
   * Create & register a new workflow instance
   */
  createWorkflow(complaintId = null) {
    const id = complaintId || `wf_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const workflow = new WorkflowState(id, WorkflowStateEnum.PENDING);
    this.activeWorkflows.set(id, workflow);
    return workflow;
  }

  /**
   * Get active workflow by ID
   */
  getWorkflow(workflowId) {
    return this.activeWorkflows.get(workflowId) || null;
  }

  /**
   * Transition workflow to next state with history logging
   */
  transitionState(workflowId, nextState, note = '') {
    const workflow = this.getWorkflow(workflowId);
    if (workflow) {
      workflow.transitionTo(nextState, note);
    }
    return workflow;
  }

  /**
   * Get complete state transition history
   */
  getHistory(workflowId) {
    const workflow = this.getWorkflow(workflowId);
    return workflow ? workflow.history : [];
  }

  /**
   * Remove workflow instance upon completion or failure
   */
  clearWorkflow(workflowId) {
    this.activeWorkflows.delete(workflowId);
  }
}

export default WorkflowEngine;

import { OrchestratorConfig } from '../config/orchestrator.config.js';

export class WorkflowInstance {
  constructor(workflowId, complaintId) {
    this.id = workflowId;
    this.complaintId = complaintId;
    this.currentState = OrchestratorConfig.WORKFLOW_STATUSES.CREATED;
    this.history = [
      {
        state: OrchestratorConfig.WORKFLOW_STATUSES.CREATED,
        note: 'Workflow initialized',
        timestamp: new Date().toISOString(),
      },
    ];
    this.context = null;
    this.handoverPayload = null;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  transitionTo(nextState, note = '') {
    this.currentState = nextState;
    this.updatedAt = new Date().toISOString();
    this.history.push({
      state: nextState,
      note,
      timestamp: this.updatedAt,
    });
  }
}

export default WorkflowInstance;

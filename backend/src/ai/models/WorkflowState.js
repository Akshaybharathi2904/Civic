export const WorkflowStateEnum = Object.freeze({
  PENDING: 'PENDING',
  UNDERSTANDING: 'UNDERSTANDING',
  VISION_ANALYSIS: 'VISION_ANALYSIS',
  LOCATION_INTELLIGENCE: 'LOCATION_INTELLIGENCE',
  DUPLICATE_DETECTION: 'DUPLICATE_DETECTION',
  DEPARTMENT_ROUTING: 'DEPARTMENT_ROUTING',
  PRIORITY_SCORING: 'PRIORITY_SCORING',
  ANALYTICS_COMPUTATION: 'ANALYTICS_COMPUTATION',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
});

export class WorkflowState {
  constructor(id, initialState = WorkflowStateEnum.PENDING) {
    this.id = id;
    this.complaintId = id;
    this.currentState = initialState;
    this.history = [{ state: initialState, note: 'Workflow initialized', timestamp: new Date().toISOString() }];
  }

  transitionTo(nextState, note = '') {
    this.currentState = nextState;
    this.history.push({
      state: nextState,
      note,
      timestamp: new Date().toISOString(),
    });
  }
}

export default WorkflowState;

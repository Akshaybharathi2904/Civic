import { Workflow } from '../../domain/entities/Workflow.js';

export class ResolutionWorkflowContract {
  async transitionState(complaintId, nextState) { throw new Error('ResolutionWorkflowContract.transitionState must be implemented.'); }
}

export class MockResolutionWorkflowService extends ResolutionWorkflowContract {
  async transitionState(complaintId, nextState) {
    return new Workflow({
      complaintId,
      currentState: nextState,
      transitions: [
        { from: 'RECEIVED', to: nextState, timestamp: new Date().toISOString() },
      ],
    });
  }
}

export default { ResolutionWorkflowContract, MockResolutionWorkflowService };

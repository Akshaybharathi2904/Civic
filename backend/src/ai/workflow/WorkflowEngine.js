import { WorkflowStateEnum } from '../models/WorkflowState.js';

export class WorkflowEngine {
  constructor() {
    this.registeredPipelines = new Map();
  }

  registerPipeline(pipelineName, agentList = []) {
    this.registeredPipelines.set(pipelineName, agentList);
  }

  getPipeline(pipelineName = 'default') {
    return this.registeredPipelines.get(pipelineName) || [];
  }

  getNextState(currentState) {
    const transitions = {
      [WorkflowStateEnum.PENDING]: WorkflowStateEnum.UNDERSTANDING,
      [WorkflowStateEnum.UNDERSTANDING]: WorkflowStateEnum.VISION_ANALYSIS,
      [WorkflowStateEnum.VISION_ANALYSIS]: WorkflowStateEnum.LOCATION_INTELLIGENCE,
      [WorkflowStateEnum.LOCATION_INTELLIGENCE]: WorkflowStateEnum.DUPLICATE_DETECTION,
      [WorkflowStateEnum.DUPLICATE_DETECTION]: WorkflowStateEnum.DEPARTMENT_ROUTING,
      [WorkflowStateEnum.DEPARTMENT_ROUTING]: WorkflowStateEnum.PRIORITY_SCORING,
      [WorkflowStateEnum.PRIORITY_SCORING]: WorkflowStateEnum.COMPLETED,
    };
    return transitions[currentState] || WorkflowStateEnum.COMPLETED;
  }
}

export default WorkflowEngine;

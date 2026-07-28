export class Workflow {
  constructor({
    id = `wf_gov_${Date.now()}`,
    complaintId,
    currentState = 'RECEIVED',
    transitions = [],
  }) {
    this.id = id;
    this.complaintId = complaintId;
    this.currentState = currentState;
    this.transitions = transitions;
  }
}

export default Workflow;

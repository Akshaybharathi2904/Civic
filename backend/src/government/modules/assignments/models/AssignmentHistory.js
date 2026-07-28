export class AssignmentHistory {
  constructor({
    id = `asgn_hist_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    assignmentId,
    complaintId,
    officerId,
    fromStatus,
    toStatus,
    performedBy = 'SYSTEM',
    notes = '',
    timestamp = new Date().toISOString(),
  }) {
    this.id = id;
    this.assignmentId = assignmentId;
    this.complaintId = complaintId;
    this.officerId = officerId;
    this.fromStatus = fromStatus;
    this.toStatus = toStatus;
    this.performedBy = performedBy;
    this.notes = notes;
    this.timestamp = timestamp;
  }
}

export default AssignmentHistory;

export class Assignment {
  constructor({
    id = `asgn_${Date.now()}`,
    complaintId,
    officerId,
    assignedBy = 'SYSTEM',
    status = 'PENDING_ACCEPTANCE',
  }) {
    this.id = id;
    this.complaintId = complaintId;
    this.officerId = officerId;
    this.assignedBy = assignedBy;
    this.status = status;
    this.assignedAt = new Date().toISOString();
  }
}

export default Assignment;

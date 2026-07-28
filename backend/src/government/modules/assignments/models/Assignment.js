import { AssignmentStatusEnum } from './AssignmentStatusEnum.js';

export class Assignment {
  constructor({
    id = `asgn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    complaintId,
    officerId,
    assignedBy = 'DISPATCHER',
    status = AssignmentStatusEnum.ASSIGNED,
    notes = '',
    assignedAt = new Date().toISOString(),
  }) {
    this.id = id;
    this.complaintId = complaintId;
    this.officerId = officerId;
    this.assignedBy = assignedBy;
    this.status = status;
    this.notes = notes;
    this.assignedAt = assignedAt;
    this.updatedAt = new Date().toISOString();
  }

  updateStatus(nextStatus, notes = '') {
    if (Object.values(AssignmentStatusEnum).includes(nextStatus)) {
      this.status = nextStatus;
      if (notes) this.notes = notes;
      this.updatedAt = new Date().toISOString();
    }
  }
}

export default Assignment;

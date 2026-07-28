export class StatusHistory {
  constructor({
    id = `hist_${Date.now()}`,
    complaintId,
    fromStatus,
    toStatus,
    updatedBy = 'SYSTEM',
    notes = '',
  }) {
    this.id = id;
    this.complaintId = complaintId;
    this.fromStatus = fromStatus;
    this.toStatus = toStatus;
    this.updatedBy = updatedBy;
    this.notes = notes;
    this.timestamp = new Date().toISOString();
  }
}

export default StatusHistory;

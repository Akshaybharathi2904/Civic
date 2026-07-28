export class ComplaintStatusHistory {
  constructor({
    id = `hist_life_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    complaintId,
    fromStatus,
    toStatus,
    updatedBy = 'SYSTEM',
    notes = '',
    timestamp = new Date().toISOString(),
    durationMs = 0,
  }) {
    this.id = id;
    this.complaintId = complaintId;
    this.fromStatus = fromStatus;
    this.toStatus = toStatus;
    this.updatedBy = updatedBy;
    this.notes = notes;
    this.timestamp = timestamp;
    this.durationMs = durationMs;
  }
}

export default ComplaintStatusHistory;

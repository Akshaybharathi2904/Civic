export class UpdateStatusDTO {
  constructor({ nextStatus, updatedBy = 'SYSTEM', notes = '' }) {
    if (!nextStatus) throw new Error('UpdateStatusDTO requires nextStatus.');
    this.nextStatus = nextStatus.toUpperCase();
    this.updatedBy = updatedBy;
    this.notes = notes;
  }
}

export class ReopenComplaintDTO {
  constructor({ reopenedBy = 'ADMIN', reason = '' }) {
    if (!reason) throw new Error('ReopenComplaintDTO requires a reason for reopening.');
    this.reopenedBy = reopenedBy;
    this.reason = reason;
  }
}

export class ProcessingMetricsDTO {
  constructor({ complaintId, totalLifecycleMs = 0, totalHours = 0, triageDurationHours = 0, workDurationHours = 0, statusTransitionCount = 0, slaCompliance = true }) {
    this.complaintId = complaintId;
    this.totalLifecycleMs = totalLifecycleMs;
    this.totalHours = Number(Number(totalHours).toFixed(2));
    this.triageDurationHours = Number(Number(triageDurationHours).toFixed(2));
    this.workDurationHours = Number(Number(workDurationHours).toFixed(2));
    this.statusTransitionCount = statusTransitionCount;
    this.slaCompliance = Boolean(slaCompliance);
    this.calculatedAt = new Date().toISOString();
  }
}

export default { UpdateStatusDTO, ReopenComplaintDTO, ProcessingMetricsDTO };

import { WorkProgressStateEnum } from './WorkProgressStateEnum.js';

export class WorkProgress {
  constructor({
    id = `prog_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    complaintId,
    officerId,
    progressState = WorkProgressStateEnum.NOT_STARTED,
    percentage = 0,
    remarks = '',
    paused = false,
    startedAt = null,
    completedAt = null,
  }) {
    this.id = id;
    this.complaintId = complaintId;
    this.officerId = officerId;
    this.progressState = progressState;
    this.percentage = Math.min(100, Math.max(0, percentage));
    this.remarks = remarks;
    this.paused = Boolean(paused);
    this.startedAt = startedAt;
    this.completedAt = completedAt;
    this.updatedAt = new Date().toISOString();
  }

  updateProgress(nextState, percentage, remarks = '') {
    if (Object.values(WorkProgressStateEnum).includes(nextState)) {
      this.progressState = nextState;
    }
    if (percentage !== undefined && percentage !== null) {
      this.percentage = Math.min(100, Math.max(0, percentage));
    }
    if (remarks) {
      this.remarks = remarks;
    }
    if (nextState === WorkProgressStateEnum.WORK_COMPLETED) {
      this.percentage = 100;
      this.completedAt = new Date().toISOString();
      this.paused = false;
    }
    this.updatedAt = new Date().toISOString();
  }
}

export default WorkProgress;

import { VerificationStatusEnum } from './VerificationStatusEnum.js';

export class Verification {
  constructor({
    id = `ver_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    complaintId,
    evidenceIds = [],
    supervisorId = null,
    status = VerificationStatusEnum.PENDING,
    reviewNotes = '',
    submittedAt = new Date().toISOString(),
    reviewedAt = null,
  }) {
    this.id = id;
    this.complaintId = complaintId;
    this.evidenceIds = evidenceIds;
    this.supervisorId = supervisorId;
    this.status = status;
    this.reviewNotes = reviewNotes;
    this.submittedAt = submittedAt;
    this.reviewedAt = reviewedAt;
  }

  review(status, supervisorId, reviewNotes = '') {
    if (Object.values(VerificationStatusEnum).includes(status)) {
      this.status = status;
      this.supervisorId = supervisorId;
      this.reviewNotes = reviewNotes;
      this.reviewedAt = new Date().toISOString();
    }
  }
}

export default Verification;

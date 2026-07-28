export class UploadEvidenceDTO {
  constructor({ complaintId, officerId, type, fileName, buffer, mimeType = 'image/jpeg', remarks = '' }) {
    if (!complaintId || !officerId || !type) {
      throw new Error('UploadEvidenceDTO requires complaintId, officerId, and type.');
    }
    this.complaintId = complaintId;
    this.officerId = officerId;
    this.type = type.toUpperCase();
    this.fileName = fileName || `evidence_${Date.now()}.jpg`;
    this.buffer = buffer;
    this.mimeType = mimeType;
    this.remarks = remarks;
  }
}

export class EvidenceSubmissionDTO {
  constructor({ complaintId, officerId, evidenceIds = [] }) {
    if (!complaintId || !officerId || evidenceIds.length === 0) {
      throw new Error('EvidenceSubmissionDTO requires complaintId, officerId, and non-empty evidenceIds array.');
    }
    this.complaintId = complaintId;
    this.officerId = officerId;
    this.evidenceIds = evidenceIds;
  }
}

export class ReviewVerificationDTO {
  constructor({ verificationId, supervisorId, status, reviewNotes = '' }) {
    if (!verificationId || !supervisorId || !status) {
      throw new Error('ReviewVerificationDTO requires verificationId, supervisorId, and status.');
    }
    this.verificationId = verificationId;
    this.supervisorId = supervisorId;
    this.status = status.toUpperCase(); // APPROVED, REJECTED, REWORK_REQUIRED
    this.reviewNotes = reviewNotes;
  }
}

export default { UploadEvidenceDTO, EvidenceSubmissionDTO, ReviewVerificationDTO };

import { Verification } from '../models/Verification.js';
import { VerificationStatusEnum } from '../models/VerificationStatusEnum.js';
import { EvidenceSubmissionDTO, ReviewVerificationDTO } from '../dtos/EvidenceDTOs.js';
import { MockVerificationRepository } from '../repositories/MockVerificationRepository.js';

export class VerificationServiceContract {
  async submitForVerification(complaintId, officerId, evidenceIds) { throw new Error('VerificationServiceContract.submitForVerification must be implemented.'); }
  async reviewEvidence(reviewDTO) { throw new Error('VerificationServiceContract.reviewEvidence must be implemented.'); }
  async approveEvidence(verificationId, supervisorId, reviewNotes) { throw new Error('VerificationServiceContract.approveEvidence must be implemented.'); }
  async rejectEvidence(verificationId, supervisorId, reviewNotes) { throw new Error('VerificationServiceContract.rejectEvidence must be implemented.'); }
  async requestRework(verificationId, supervisorId, reviewNotes) { throw new Error('VerificationServiceContract.requestRework must be implemented.'); }
  async getVerificationHistory(complaintId) { throw new Error('VerificationServiceContract.getVerificationHistory must be implemented.'); }
}

export class VerificationService extends VerificationServiceContract {
  constructor(repository = new MockVerificationRepository()) {
    super();
    this.repository = repository;
  }

  async submitForVerification(complaintId, officerIdOrInput, evidenceIds = []) {
    let dto;
    if (typeof complaintId === 'object') {
      dto = new EvidenceSubmissionDTO(complaintId);
    } else {
      dto = new EvidenceSubmissionDTO({ complaintId, officerId: officerIdOrInput, evidenceIds });
    }

    const verification = new Verification({
      complaintId: dto.complaintId,
      evidenceIds: dto.evidenceIds,
      status: VerificationStatusEnum.PENDING,
    });

    return await this.repository.save(verification);
  }

  async reviewEvidence(reviewInput) {
    const dto = new ReviewVerificationDTO(reviewInput);
    const verification = await this.repository.findById(dto.verificationId);
    if (!verification) throw new Error(`Verification request #${dto.verificationId} not found.`);

    verification.review(dto.status, dto.supervisorId, dto.reviewNotes);
    return await this.repository.save(verification);
  }

  async approveEvidence(verificationId, supervisorId, reviewNotes = 'Verified and approved.') {
    return await this.reviewEvidence({
      verificationId,
      supervisorId,
      status: VerificationStatusEnum.APPROVED,
      reviewNotes,
    });
  }

  async rejectEvidence(verificationId, supervisorId, reviewNotes = 'Submitted evidence rejected.') {
    return await this.reviewEvidence({
      verificationId,
      supervisorId,
      status: VerificationStatusEnum.REJECTED,
      reviewNotes,
    });
  }

  async requestRework(verificationId, supervisorId, reviewNotes = 'Rework required. Proof insufficient.') {
    return await this.reviewEvidence({
      verificationId,
      supervisorId,
      status: VerificationStatusEnum.REWORK_REQUIRED,
      reviewNotes,
    });
  }

  async getVerificationHistory(complaintId) {
    return await this.repository.findByComplaintId(complaintId);
  }
}

export default { VerificationServiceContract, VerificationService };

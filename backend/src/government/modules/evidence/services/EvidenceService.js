import { Evidence } from '../models/Evidence.js';
import { UploadEvidenceDTO } from '../dtos/EvidenceDTOs.js';
import { MockEvidenceRepository } from '../repositories/MockEvidenceRepository.js';
import { MockFileStorage } from '../storage/MockFileStorage.js';

export class EvidenceServiceContract {
  async uploadEvidence(uploadDTO) { throw new Error('EvidenceServiceContract.uploadEvidence must be implemented.'); }
  async deleteEvidence(id) { throw new Error('EvidenceServiceContract.deleteEvidence must be implemented.'); }
  async getEvidenceByComplaint(complaintId) { throw new Error('EvidenceServiceContract.getEvidenceByComplaint must be implemented.'); }
}

export class EvidenceService extends EvidenceServiceContract {
  constructor(
    repository = new MockEvidenceRepository(),
    fileStorage = new MockFileStorage()
  ) {
    super();
    this.repository = repository;
    this.fileStorage = fileStorage;
  }

  async uploadEvidence(uploadInput) {
    const dto = new UploadEvidenceDTO(uploadInput);

    // Upload to file storage
    const storageResult = await this.fileStorage.uploadFile(dto.fileName, dto.buffer, dto.mimeType);

    const evidence = new Evidence({
      complaintId: dto.complaintId,
      officerId: dto.officerId,
      type: dto.type,
      fileUrl: storageResult.fileUrl,
      fileSize: storageResult.fileSize,
      mimeType: storageResult.mimeType,
      remarks: dto.remarks,
    });

    return await this.repository.save(evidence);
  }

  async deleteEvidence(id) {
    const evidence = await this.repository.findById(id);
    if (!evidence) throw new Error(`Evidence with ID "${id}" not found.`);

    await this.fileStorage.deleteFile(evidence.fileUrl);
    return await this.repository.delete(id);
  }

  async getEvidenceById(id) {
    return await this.repository.findById(id);
  }

  async getEvidenceByComplaint(complaintId) {
    return await this.repository.findByComplaintId(complaintId);
  }
}

export default { EvidenceServiceContract, EvidenceService };

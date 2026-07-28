import { IngestQueueComplaintDTO } from '../dtos/IngestQueueComplaintDTO.js';
import { QueueFilterDTO } from '../dtos/QueueFilterDTO.js';
import { QueuedComplaint } from '../models/QueuedComplaint.js';
import { MockComplaintQueueRepository } from '../repositories/MockComplaintQueueRepository.js';

export class ComplaintQueueServiceContract {
  async ingestEnrichedComplaint(payload) { throw new Error('ComplaintQueueServiceContract.ingestEnrichedComplaint must be implemented.'); }
  async getPendingQueue(filterQuery) { throw new Error('ComplaintQueueServiceContract.getPendingQueue must be implemented.'); }
  async getComplaintDetails(complaintId) { throw new Error('ComplaintQueueServiceContract.getComplaintDetails must be implemented.'); }
  async updateQueueStatus(complaintId, nextStatus) { throw new Error('ComplaintQueueServiceContract.updateQueueStatus must be implemented.'); }
  async getQueueStatistics() { throw new Error('ComplaintQueueServiceContract.getQueueStatistics must be implemented.'); }
}

export class ComplaintQueueService extends ComplaintQueueServiceContract {
  constructor(repository = new MockComplaintQueueRepository()) {
    super();
    this.repository = repository;
  }

  async ingestEnrichedComplaint(payload) {
    const dto = new IngestQueueComplaintDTO(payload);
    const queuedComplaint = new QueuedComplaint({
      complaintId: dto.complaintId,
      ticketId: dto.ticketId,
      title: dto.title,
      aiSummary: dto.aiSummary,
      category: dto.category,
      issueType: dto.issueType,
      location: dto.location,
      priority: dto.priority,
      recommendedDepartment: dto.recommendedDepartment,
      communityConfidence: dto.communityConfidence,
      aiConfidence: dto.aiConfidence,
      submissionTimestamp: dto.submissionTimestamp,
    });

    return await this.repository.save(queuedComplaint);
  }

  async getPendingQueue(filterQuery = {}) {
    const filterDTO = new QueueFilterDTO(filterQuery);
    return await this.repository.queryQueue(filterDTO);
  }

  async getComplaintDetails(complaintId) {
    const complaint = await this.repository.findById(complaintId);
    if (!complaint) {
      throw new Error(`Queued complaint with ID "${complaintId}" not found.`);
    }
    return complaint;
  }

  async updateQueueStatus(complaintId, nextStatus) {
    const complaint = await this.getComplaintDetails(complaintId);
    complaint.updateStatus(nextStatus);
    return await this.repository.save(complaint);
  }

  async getQueueStatistics() {
    return await this.repository.getStatistics();
  }
}

export default { ComplaintQueueServiceContract, ComplaintQueueService };

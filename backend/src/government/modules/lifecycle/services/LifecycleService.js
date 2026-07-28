import { ComplaintStateEnum } from '../models/ComplaintStateEnum.js';
import { ComplaintStatusHistory } from '../models/ComplaintStatusHistory.js';
import { StateMachineValidator } from './StateMachineValidator.js';
import { UpdateStatusDTO, ReopenComplaintDTO, ProcessingMetricsDTO } from '../dtos/LifecycleDTOs.js';
import { MockStatusHistoryRepository } from '../repositories/MockStatusHistoryRepository.js';
import { MockLifecycleEventPublisher } from '../events/MockLifecycleEventPublisher.js';

export class LifecycleServiceContract {
  async updateStatus(complaintId, updateDTO) { throw new Error('LifecycleServiceContract.updateStatus must be implemented.'); }
  async reopenComplaint(complaintId, reopenDTO) { throw new Error('LifecycleServiceContract.reopenComplaint must be implemented.'); }
  async getComplaintTimeline(complaintId) { throw new Error('LifecycleServiceContract.getComplaintTimeline must be implemented.'); }
  async calculateProcessingMetrics(complaintId) { throw new Error('LifecycleServiceContract.calculateProcessingMetrics must be implemented.'); }
}

export class LifecycleService extends LifecycleServiceContract {
  constructor(
    repository = new MockStatusHistoryRepository(),
    eventPublisher = new MockLifecycleEventPublisher()
  ) {
    super();
    this.repository = repository;
    this.eventPublisher = eventPublisher;
    this.complaintCurrentStatus = new Map(); // complaintId -> currentStatus
  }

  async getCurrentStatus(complaintId) {
    return this.complaintCurrentStatus.get(complaintId) || ComplaintStateEnum.NEW;
  }

  async updateStatus(complaintId, nextStatusOrInput, updatedBy = 'SYSTEM', notes = '') {
    let dto;
    if (typeof nextStatusOrInput === 'object') {
      dto = new UpdateStatusDTO(nextStatusOrInput);
    } else {
      dto = new UpdateStatusDTO({ nextStatus: nextStatusOrInput, updatedBy, notes });
    }

    const currentStatus = await this.getCurrentStatus(complaintId);

    // 1. Validate State Transition
    StateMachineValidator.validateTransition(currentStatus, dto.nextStatus);

    // 2. Calculate duration in current state
    const historyList = await this.repository.getHistoryByComplaint(complaintId);
    const lastEntry = historyList[historyList.length - 1];
    const now = new Date();
    const durationMs = lastEntry ? (now.getTime() - new Date(lastEntry.timestamp).getTime()) : 0;

    // 3. Save History Record
    const historyRecord = new ComplaintStatusHistory({
      complaintId,
      fromStatus: currentStatus,
      toStatus: dto.nextStatus,
      updatedBy: dto.updatedBy,
      notes: dto.notes,
      timestamp: now.toISOString(),
      durationMs,
    });
    await this.repository.saveHistory(historyRecord);

    // 4. Update Current Status
    this.complaintCurrentStatus.set(complaintId, dto.nextStatus);

    // 5. Publish Lifecycle Event
    await this.eventPublisher.publishLifecycleEvent(
      complaintId,
      `STATUS_CHANGED_TO_${dto.nextStatus}`,
      currentStatus,
      dto.nextStatus,
      dto.updatedBy,
      { notes: dto.notes, durationMs }
    );

    return {
      complaintId,
      status: dto.nextStatus,
      updatedBy: dto.updatedBy,
      updatedAt: now.toISOString(),
    };
  }

  async reopenComplaint(complaintId, reopenedByOrInput = 'ADMIN', reason = '') {
    let dto;
    if (typeof reopenedByOrInput === 'object') {
      dto = new ReopenComplaintDTO(reopenedByOrInput);
    } else {
      dto = new ReopenComplaintDTO({ reopenedBy: reopenedByOrInput, reason });
    }

    const currentStatus = await this.getCurrentStatus(complaintId);
    if (currentStatus !== ComplaintStateEnum.CLOSED && currentStatus !== ComplaintStateEnum.REJECTED) {
      throw new Error(`Only CLOSED or REJECTED complaints can be reopened. Current status: "${currentStatus}".`);
    }

    return await this.updateStatus(complaintId, ComplaintStateEnum.UNDER_REVIEW, dto.reopenedBy, `Reopened: ${dto.reason}`);
  }

  async getComplaintTimeline(complaintId) {
    return await this.repository.getHistoryByComplaint(complaintId);
  }

  async calculateProcessingMetrics(complaintId) {
    const historyList = await this.repository.getHistoryByComplaint(complaintId);
    if (historyList.length === 0) {
      return new ProcessingMetricsDTO({ complaintId });
    }

    const firstTimestamp = new Date(historyList[0].timestamp).getTime();
    const lastTimestamp = new Date(historyList[historyList.length - 1].timestamp).getTime();
    const totalLifecycleMs = Math.max(0, lastTimestamp - firstTimestamp);
    const totalHours = totalLifecycleMs / (1000 * 3600);

    // Compute triage duration (NEW -> TRIAGED / UNDER_REVIEW -> READY_FOR_ASSIGNMENT)
    let triageMs = 0;
    let workMs = 0;

    historyList.forEach((entry) => {
      if (entry.fromStatus === ComplaintStateEnum.NEW || entry.fromStatus === ComplaintStateEnum.UNDER_REVIEW) {
        triageMs += entry.durationMs;
      }
      if (entry.fromStatus === ComplaintStateEnum.IN_PROGRESS || entry.fromStatus === ComplaintStateEnum.WORK_COMPLETED) {
        workMs += entry.durationMs;
      }
    });

    const triageDurationHours = triageMs / (1000 * 3600);
    const workDurationHours = workMs / (1000 * 3600);
    const slaCompliance = totalHours <= 48; // Standard 48h SLA target

    return new ProcessingMetricsDTO({
      complaintId,
      totalLifecycleMs,
      totalHours,
      triageDurationHours,
      workDurationHours,
      statusTransitionCount: historyList.length,
      slaCompliance,
    });
  }
}

export default { LifecycleServiceContract, LifecycleService };

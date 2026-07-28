import { WorkProgress } from '../models/WorkProgress.js';
import { WorkProgressStateEnum } from '../models/WorkProgressStateEnum.js';
import { MockWorkProgressRepository } from '../repositories/MockWorkProgressRepository.js';

export class WorkProgressServiceContract {
  async startWork(complaintId, officerId) { throw new Error('WorkProgressServiceContract.startWork must be implemented.'); }
  async pauseWork(complaintId, officerId, remarks) { throw new Error('WorkProgressServiceContract.pauseWork must be implemented.'); }
  async resumeWork(complaintId, officerId) { throw new Error('WorkProgressServiceContract.resumeWork must be implemented.'); }
  async updateProgress(complaintId, officerId, progressState, percentage, remarks) { throw new Error('WorkProgressServiceContract.updateProgress must be implemented.'); }
  async markCompleted(complaintId, officerId, remarks) { throw new Error('WorkProgressServiceContract.markCompleted must be implemented.'); }
}

export class WorkProgressService extends WorkProgressServiceContract {
  constructor(repository = new MockWorkProgressRepository()) {
    super();
    this.repository = repository;
  }

  async getProgress(complaintId) {
    return await this.repository.findByComplaintId(complaintId);
  }

  async startWork(complaintId, officerId) {
    let progress = await this.getProgress(complaintId);
    if (!progress) {
      progress = new WorkProgress({
        complaintId,
        officerId,
        progressState: WorkProgressStateEnum.ON_THE_WAY,
        percentage: 10,
        remarks: 'En route to complaint site.',
        startedAt: new Date().toISOString(),
      });
    } else {
      progress.updateProgress(WorkProgressStateEnum.ON_THE_WAY, 10, 'En route to complaint site.');
      progress.startedAt = new Date().toISOString();
    }
    return await this.repository.save(progress);
  }

  async pauseWork(complaintId, officerId, remarks = 'Work paused awaiting resources') {
    let progress = await this.getProgress(complaintId);
    if (!progress) throw new Error(`Work progress for complaint #${complaintId} not found.`);

    progress.paused = true;
    progress.updateProgress(WorkProgressStateEnum.WAITING_FOR_RESOURCES, progress.percentage, remarks);
    return await this.repository.save(progress);
  }

  async resumeWork(complaintId, officerId) {
    let progress = await this.getProgress(complaintId);
    if (!progress) throw new Error(`Work progress for complaint #${complaintId} not found.`);

    progress.paused = false;
    progress.updateProgress(WorkProgressStateEnum.REPAIR_IN_PROGRESS, Math.max(25, progress.percentage), 'Resumed work on site.');
    return await this.repository.save(progress);
  }

  async updateProgress(complaintId, officerId, progressState, percentage, remarks = '') {
    let progress = await this.getProgress(complaintId);
    if (!progress) {
      progress = new WorkProgress({ complaintId, officerId });
    }
    progress.updateProgress(progressState, percentage, remarks);
    return await this.repository.save(progress);
  }

  async markCompleted(complaintId, officerId, remarks = 'Field work completed.') {
    let progress = await this.getProgress(complaintId);
    if (!progress) {
      progress = new WorkProgress({ complaintId, officerId });
    }
    progress.updateProgress(WorkProgressStateEnum.WORK_COMPLETED, 100, remarks);
    return await this.repository.save(progress);
  }
}

export default { WorkProgressServiceContract, WorkProgressService };

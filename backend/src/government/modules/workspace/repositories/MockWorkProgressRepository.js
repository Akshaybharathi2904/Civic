export class WorkProgressRepositoryContract {
  async save(workProgress) { throw new Error('WorkProgressRepositoryContract.save must be implemented.'); }
  async findByComplaintId(complaintId) { throw new Error('WorkProgressRepositoryContract.findByComplaintId must be implemented.'); }
  async findByOfficerId(officerId) { throw new Error('WorkProgressRepositoryContract.findByOfficerId must be implemented.'); }
}

export class MockWorkProgressRepository extends WorkProgressRepositoryContract {
  constructor() {
    super();
    this.progressMap = new Map(); // complaintId -> WorkProgress
  }

  async save(workProgress) {
    this.progressMap.set(workProgress.complaintId, workProgress);
    return workProgress;
  }

  async findByComplaintId(complaintId) {
    return this.progressMap.get(complaintId) || null;
  }

  async findByOfficerId(officerId) {
    return Array.from(this.progressMap.values()).filter(p => p.officerId === officerId);
  }
}

export default { WorkProgressRepositoryContract, MockWorkProgressRepository };

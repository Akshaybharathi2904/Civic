export class EvidenceRepositoryContract {
  async save(evidence) { throw new Error('EvidenceRepositoryContract.save must be implemented.'); }
  async findById(id) { throw new Error('EvidenceRepositoryContract.findById must be implemented.'); }
  async findByComplaintId(complaintId) { throw new Error('EvidenceRepositoryContract.findByComplaintId must be implemented.'); }
  async delete(id) { throw new Error('EvidenceRepositoryContract.delete must be implemented.'); }
}

export class MockEvidenceRepository extends EvidenceRepositoryContract {
  constructor() {
    super();
    this.evidenceStore = new Map();
  }

  async save(evidence) {
    this.evidenceStore.set(evidence.id, evidence);
    return evidence;
  }

  async findById(id) {
    return this.evidenceStore.get(id) || null;
  }

  async findByComplaintId(complaintId) {
    return Array.from(this.evidenceStore.values()).filter(e => e.complaintId === complaintId);
  }

  async delete(id) {
    const existed = this.evidenceStore.has(id);
    this.evidenceStore.delete(id);
    return existed;
  }
}

export default { EvidenceRepositoryContract, MockEvidenceRepository };

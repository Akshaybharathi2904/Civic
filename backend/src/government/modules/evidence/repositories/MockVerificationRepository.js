export class VerificationRepositoryContract {
  async save(verification) { throw new Error('VerificationRepositoryContract.save must be implemented.'); }
  async findById(id) { throw new Error('VerificationRepositoryContract.findById must be implemented.'); }
  async findByComplaintId(complaintId) { throw new Error('VerificationRepositoryContract.findByComplaintId must be implemented.'); }
}

export class MockVerificationRepository extends VerificationRepositoryContract {
  constructor() {
    super();
    this.verifications = new Map();
    this.historyStore = new Map(); // complaintId -> Array<Verification>
  }

  async save(verification) {
    this.verifications.set(verification.id, verification);
    const list = this.historyStore.get(verification.complaintId) || [];
    list.push(verification);
    this.historyStore.set(verification.complaintId, list);
    return verification;
  }

  async findById(id) {
    return this.verifications.get(id) || null;
  }

  async findByComplaintId(complaintId) {
    return this.historyStore.get(complaintId) || [];
  }
}

export default { VerificationRepositoryContract, MockVerificationRepository };

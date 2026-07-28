export class EscalationRepositoryContract {
  async save(escalationRecord) { throw new Error('EscalationRepositoryContract.save must be implemented.'); }
  async findById(id) { throw new Error('EscalationRepositoryContract.findById must be implemented.'); }
  async findByComplaintId(complaintId) { throw new Error('EscalationRepositoryContract.findByComplaintId must be implemented.'); }
  async findAllActive() { throw new Error('EscalationRepositoryContract.findAllActive must be implemented.'); }
}

export class MockEscalationRepository extends EscalationRepositoryContract {
  constructor() {
    super();
    this.escalations = new Map();
    this.historyStore = new Map(); // complaintId -> Array<EscalationRecord>
  }

  async save(escalationRecord) {
    this.escalations.set(escalationRecord.id, escalationRecord);
    const list = this.historyStore.get(escalationRecord.complaintId) || [];
    list.push(escalationRecord);
    this.historyStore.set(escalationRecord.complaintId, list);
    return escalationRecord;
  }

  async findById(id) {
    return this.escalations.get(id) || null;
  }

  async findByComplaintId(complaintId) {
    return this.historyStore.get(complaintId) || [];
  }

  async findAllActive() {
    return Array.from(this.escalations.values()).filter(e => !e.resolved);
  }
}

export default { EscalationRepositoryContract, MockEscalationRepository };

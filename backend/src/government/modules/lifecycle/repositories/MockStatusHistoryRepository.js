import { StatusHistoryRepositoryContract } from './StatusHistoryRepositoryContract.js';

export class MockStatusHistoryRepository extends StatusHistoryRepositoryContract {
  constructor() {
    super();
    this.historyStore = new Map(); // complaintId -> Array<ComplaintStatusHistory>
  }

  async saveHistory(historyEntry) {
    const list = this.historyStore.get(historyEntry.complaintId) || [];
    list.push(historyEntry);
    this.historyStore.set(historyEntry.complaintId, list);
    return historyEntry;
  }

  async getHistoryByComplaint(complaintId) {
    return this.historyStore.get(complaintId) || [];
  }
}

export default MockStatusHistoryRepository;

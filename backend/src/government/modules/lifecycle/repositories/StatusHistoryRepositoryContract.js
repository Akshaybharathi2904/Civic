export class StatusHistoryRepositoryContract {
  async saveHistory(historyEntry) { throw new Error('StatusHistoryRepositoryContract.saveHistory must be implemented.'); }
  async getHistoryByComplaint(complaintId) { throw new Error('StatusHistoryRepositoryContract.getHistoryByComplaint must be implemented.'); }
}

export default StatusHistoryRepositoryContract;

export class ComplaintQueueRepositoryContract {
  async save(queuedComplaint) { throw new Error('ComplaintQueueRepositoryContract.save must be implemented.'); }
  async findById(complaintId) { throw new Error('ComplaintQueueRepositoryContract.findById must be implemented.'); }
  async queryQueue(filterDTO) { throw new Error('ComplaintQueueRepositoryContract.queryQueue must be implemented.'); }
  async getStatistics() { throw new Error('ComplaintQueueRepositoryContract.getStatistics must be implemented.'); }
}

export default ComplaintQueueRepositoryContract;

export class AssignmentRepositoryContract {
  async save(assignment) { throw new Error('AssignmentRepositoryContract.save must be implemented.'); }
  async findById(id) { throw new Error('AssignmentRepositoryContract.findById must be implemented.'); }
  async findByComplaintId(complaintId) { throw new Error('AssignmentRepositoryContract.findByComplaintId must be implemented.'); }
  async saveHistory(historyEntry) { throw new Error('AssignmentRepositoryContract.saveHistory must be implemented.'); }
  async getHistoryByAssignment(assignmentId) { throw new Error('AssignmentRepositoryContract.getHistoryByAssignment must be implemented.'); }
}

export default AssignmentRepositoryContract;

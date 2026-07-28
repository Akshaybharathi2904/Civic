export class AssignmentRepositoryContract {
  async findById(id) { throw new Error('AssignmentRepositoryContract.findById must be implemented.'); }
  async findByComplaint(complaintId) { throw new Error('AssignmentRepositoryContract.findByComplaint must be implemented.'); }
  async findByOfficer(officerId) { throw new Error('AssignmentRepositoryContract.findByOfficer must be implemented.'); }
  async save(assignment) { throw new Error('AssignmentRepositoryContract.save must be implemented.'); }
}

export default AssignmentRepositoryContract;

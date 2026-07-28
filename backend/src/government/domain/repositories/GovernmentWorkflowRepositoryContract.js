export class GovernmentWorkflowRepositoryContract {
  async findById(id) { throw new Error('GovernmentWorkflowRepositoryContract.findById must be implemented.'); }
  async findByComplaint(complaintId) { throw new Error('GovernmentWorkflowRepositoryContract.findByComplaint must be implemented.'); }
  async save(workflow) { throw new Error('GovernmentWorkflowRepositoryContract.save must be implemented.'); }
}

export default GovernmentWorkflowRepositoryContract;

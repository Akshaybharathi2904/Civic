export class GovernmentComplaintRepositoryContract {
  async findById(id) { throw new Error('GovernmentComplaintRepositoryContract.findById must be implemented.'); }
  async findByTicketId(ticketId) { throw new Error('GovernmentComplaintRepositoryContract.findByTicketId must be implemented.'); }
  async findByDepartment(departmentId) { throw new Error('GovernmentComplaintRepositoryContract.findByDepartment must be implemented.'); }
  async save(complaint) { throw new Error('GovernmentComplaintRepositoryContract.save must be implemented.'); }
  async findAll() { throw new Error('GovernmentComplaintRepositoryContract.findAll must be implemented.'); }
}

export default GovernmentComplaintRepositoryContract;

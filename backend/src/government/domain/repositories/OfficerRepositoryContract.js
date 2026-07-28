export class OfficerRepositoryContract {
  async findById(id) { throw new Error('OfficerRepositoryContract.findById must be implemented.'); }
  async findByDepartment(departmentId) { throw new Error('OfficerRepositoryContract.findByDepartment must be implemented.'); }
  async save(officer) { throw new Error('OfficerRepositoryContract.save must be implemented.'); }
  async findAll() { throw new Error('OfficerRepositoryContract.findAll must be implemented.'); }
}

export default OfficerRepositoryContract;

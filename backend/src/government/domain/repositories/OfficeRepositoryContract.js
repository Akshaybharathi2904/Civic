export class OfficeRepositoryContract {
  async findById(id) { throw new Error('OfficeRepositoryContract.findById must be implemented.'); }
  async findByDepartment(departmentId) { throw new Error('OfficeRepositoryContract.findByDepartment must be implemented.'); }
  async findByZone(zone) { throw new Error('OfficeRepositoryContract.findByZone must be implemented.'); }
  async save(office) { throw new Error('OfficeRepositoryContract.save must be implemented.'); }
  async findAll() { throw new Error('OfficeRepositoryContract.findAll must be implemented.'); }
}

export default OfficeRepositoryContract;

export class DepartmentRepositoryContract {
  async findById(id) { throw new Error('DepartmentRepositoryContract.findById must be implemented.'); }
  async findByCode(code) { throw new Error('DepartmentRepositoryContract.findByCode must be implemented.'); }
  async findAll() { throw new Error('DepartmentRepositoryContract.findAll must be implemented.'); }
  async save(department) { throw new Error('DepartmentRepositoryContract.save must be implemented.'); }
}

export default DepartmentRepositoryContract;

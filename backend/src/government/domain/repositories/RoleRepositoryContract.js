export class RoleRepositoryContract {
  async findById(id) { throw new Error('RoleRepositoryContract.findById must be implemented.'); }
  async findByName(name) { throw new Error('RoleRepositoryContract.findByName must be implemented.'); }
  async save(role) { throw new Error('RoleRepositoryContract.save must be implemented.'); }
}

export default RoleRepositoryContract;

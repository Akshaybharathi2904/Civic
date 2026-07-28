export class GovernmentUserRepositoryContract {
  async findById(id) { throw new Error('GovernmentUserRepositoryContract.findById must be implemented.'); }
  async findByEmail(email) { throw new Error('GovernmentUserRepositoryContract.findByEmail must be implemented.'); }
  async save(user) { throw new Error('GovernmentUserRepositoryContract.save must be implemented.'); }
  async findAll() { throw new Error('GovernmentUserRepositoryContract.findAll must be implemented.'); }
}

export default GovernmentUserRepositoryContract;

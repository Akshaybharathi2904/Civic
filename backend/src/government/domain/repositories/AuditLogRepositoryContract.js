export class AuditLogRepositoryContract {
  async findById(id) { throw new Error('AuditLogRepositoryContract.findById must be implemented.'); }
  async findByActor(actorId) { throw new Error('AuditLogRepositoryContract.findByActor must be implemented.'); }
  async save(auditLog) { throw new Error('AuditLogRepositoryContract.save must be implemented.'); }
  async findAll() { throw new Error('AuditLogRepositoryContract.findAll must be implemented.'); }
}

export default AuditLogRepositoryContract;

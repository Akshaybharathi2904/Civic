import { AuditLog } from '../../domain/entities/AuditLog.js';

export class AuditContract {
  async logAction(actorId, action, targetResource, payload) { throw new Error('AuditContract.logAction must be implemented.'); }
}

export class MockAuditService extends AuditContract {
  async logAction(actorId, action, targetResource, payload = {}) {
    return new AuditLog({ actorId, action, targetResource, payload });
  }
}

export default { AuditContract, MockAuditService };

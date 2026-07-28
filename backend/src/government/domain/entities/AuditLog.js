export class AuditLog {
  constructor({
    id = `audit_${Date.now()}`,
    actorId = 'SYSTEM',
    action,
    targetResource,
    payload = {},
  }) {
    this.id = id;
    this.actorId = actorId;
    this.action = action;
    this.targetResource = targetResource;
    this.payload = payload;
    this.timestamp = new Date().toISOString();
  }
}

export default AuditLog;

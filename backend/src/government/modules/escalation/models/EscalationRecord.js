import { EscalationLevelEnum } from './EscalationLevelEnum.js';

export class EscalationRecord {
  constructor({
    id = `esc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    complaintId,
    level = EscalationLevelEnum.LEVEL_1,
    targetRole = 'DEPARTMENT_SUPERVISOR',
    escalatedAt = new Date().toISOString(),
    reason = 'SLA Breach Exceeded',
    resolved = false,
    resolvedAt = null,
    resolvedBy = null,
    resolutionNotes = '',
  }) {
    this.id = id;
    this.complaintId = complaintId;
    this.level = level;
    this.targetRole = targetRole;
    this.escalatedAt = escalatedAt;
    this.reason = reason;
    this.resolved = Boolean(resolved);
    this.resolvedAt = resolvedAt;
    this.resolvedBy = resolvedBy;
    this.resolutionNotes = resolutionNotes;
  }

  resolve(resolvedBy, resolutionNotes = '') {
    this.resolved = true;
    this.resolvedBy = resolvedBy;
    this.resolutionNotes = resolutionNotes;
    this.resolvedAt = new Date().toISOString();
  }
}

export default EscalationRecord;

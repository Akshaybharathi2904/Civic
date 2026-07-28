export class ConfigureSlaDTO {
  constructor({ category, priority, targetHours, warningHours }) {
    if (!category || !priority || !targetHours) {
      throw new Error('ConfigureSlaDTO requires category, priority, and targetHours.');
    }
    this.category = category;
    this.priority = priority;
    this.targetHours = Number(targetHours);
    this.warningHours = warningHours ? Number(warningHours) : Math.round(targetHours * 0.75);
  }
}

export class EscalateComplaintDTO {
  constructor({ complaintId, level = 'LEVEL_1', reason = 'SLA Breach' }) {
    if (!complaintId) throw new Error('EscalateComplaintDTO requires complaintId.');
    this.complaintId = complaintId;
    this.level = level.toUpperCase();
    this.reason = reason;
  }
}

export class ResolveEscalationDTO {
  constructor({ escalationId, resolvedBy, resolutionNotes = '' }) {
    if (!escalationId || !resolvedBy) {
      throw new Error('ResolveEscalationDTO requires escalationId and resolvedBy.');
    }
    this.escalationId = escalationId;
    this.resolvedBy = resolvedBy;
    this.resolutionNotes = resolutionNotes;
  }
}

export class SlaMetricsDTO {
  constructor({ totalMonitored = 0, withinSla = 0, warningState = 0, breachedSla = 0, activeEscalations = 0, complianceRate = 100 }) {
    this.totalMonitored = totalMonitored;
    this.withinSla = withinSla;
    this.warningState = warningState;
    this.breachedSla = breachedSla;
    this.activeEscalations = activeEscalations;
    this.complianceRate = Number(Number(complianceRate).toFixed(2));
    this.calculatedAt = new Date().toISOString();
  }
}

export default { ConfigureSlaDTO, EscalateComplaintDTO, ResolveEscalationDTO, SlaMetricsDTO };

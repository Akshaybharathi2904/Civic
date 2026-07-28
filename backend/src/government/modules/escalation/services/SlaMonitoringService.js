import { EscalationLevelEnum } from '../models/EscalationLevelEnum.js';
import { SlaService } from './SlaService.js';
import { EscalationService } from './EscalationService.js';

export class SlaMonitoringService {
  constructor(
    slaService = new SlaService(),
    escalationService = new EscalationService()
  ) {
    this.slaService = slaService;
    this.escalationService = escalationService;
  }

  async monitorActiveComplaints(activeComplaints = []) {
    const results = [];

    for (const complaint of activeComplaints) {
      const config = await this.slaService.getSlaConfig(
        complaint.category || 'Road Infrastructure',
        complaint.priority || 'Medium'
      );

      const createdTime = new Date(complaint.createdAt || Date.now() - 30 * 3600 * 1000).getTime();
      const targetMs = config.targetHours * 3600 * 1000;
      const deadline = new Date(createdTime + targetMs);
      const now = new Date();

      if (now > deadline) {
        // Breached SLA - Determine appropriate Escalation Level based on breach duration
        const breachDurationHours = (now.getTime() - deadline.getTime()) / (1000 * 3600);
        let level = EscalationLevelEnum.LEVEL_1;

        if (breachDurationHours >= 48) {
          level = EscalationLevelEnum.LEVEL_4; // State Admin
        } else if (breachDurationHours >= 24) {
          level = EscalationLevelEnum.LEVEL_3; // District Admin
        } else if (breachDurationHours >= 12) {
          level = EscalationLevelEnum.LEVEL_2; // Municipal Commissioner
        }

        const escalation = await this.escalationService.triggerEscalation({
          complaintId: complaint.complaintId || complaint.id,
          level,
          reason: `Automatic SLA Violation: Overdue by ${breachDurationHours.toFixed(1)} hours.`,
        });

        results.push({ complaintId: complaint.complaintId || complaint.id, breached: true, escalation });
      } else {
        results.push({ complaintId: complaint.complaintId || complaint.id, breached: false });
      }
    }

    return results;
  }
}

export default SlaMonitoringService;

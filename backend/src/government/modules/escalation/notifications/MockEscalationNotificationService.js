export class EscalationNotificationContract {
  async sendEscalationAlert(targetRole, complaintId, level, message) { throw new Error('EscalationNotificationContract.sendEscalationAlert must be implemented.'); }
}

export class MockEscalationNotificationService extends EscalationNotificationContract {
  constructor() {
    super();
    this.sentAlerts = [];
  }

  async sendEscalationAlert(targetRole, complaintId, level, message) {
    const alert = {
      alertId: `esc_alrt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      targetRole,
      complaintId,
      level,
      message,
      timestamp: new Date().toISOString(),
    };
    this.sentAlerts.push(alert);
    return alert;
  }
}

export default { EscalationNotificationContract, MockEscalationNotificationService };

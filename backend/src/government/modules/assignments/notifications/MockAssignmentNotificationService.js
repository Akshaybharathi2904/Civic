export class NotificationContract {
  async sendAssignmentAlert(officerId, complaintId, message) { throw new Error('NotificationContract.sendAssignmentAlert must be implemented.'); }
}

export class MockAssignmentNotificationService extends NotificationContract {
  constructor() {
    super();
    this.sentAlerts = [];
  }

  async sendAssignmentAlert(officerId, complaintId, message) {
    const alert = {
      alertId: `alert_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      officerId,
      complaintId,
      message,
      timestamp: new Date().toISOString(),
    };
    this.sentAlerts.push(alert);
    return alert;
  }
}

export default { NotificationContract, MockAssignmentNotificationService };

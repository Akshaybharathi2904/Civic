import { Notification } from '../../domain/entities/Notification.js';

export class GovernmentNotificationContract {
  async sendNotification(recipientId, title, message) { throw new Error('GovernmentNotificationContract.sendNotification must be implemented.'); }
}

export class MockGovernmentNotificationService extends GovernmentNotificationContract {
  async sendNotification(recipientId, title, message) {
    return new Notification({ recipientId, title, message });
  }
}

export default { GovernmentNotificationContract, MockGovernmentNotificationService };

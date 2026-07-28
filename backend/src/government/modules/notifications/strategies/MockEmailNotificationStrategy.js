import { NotificationChannelStrategyContract } from './NotificationChannelStrategyContract.js';

export class MockEmailNotificationStrategy extends NotificationChannelStrategyContract {
  getChannelName() { return 'EMAIL'; }
  async dispatch(notification) {
    notification.status = 'DELIVERED';
    return {
      channel: 'EMAIL',
      recipientEmail: `citizen_${notification.recipientId}@civic.gov.in`,
      subject: notification.title,
      body: notification.message,
      delivered: true,
      timestamp: new Date().toISOString(),
    };
  }
}

export default MockEmailNotificationStrategy;

import { NotificationChannelStrategyContract } from './NotificationChannelStrategyContract.js';

export class MockSmsNotificationStrategy extends NotificationChannelStrategyContract {
  getChannelName() { return 'SMS'; }
  async dispatch(notification) {
    notification.status = 'DELIVERED';
    return {
      channel: 'SMS',
      recipientPhone: '+919876543210',
      smsText: `CIVIC ALERT: ${notification.title} - ${notification.message}`,
      delivered: true,
      timestamp: new Date().toISOString(),
    };
  }
}

export default MockSmsNotificationStrategy;

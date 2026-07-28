import { NotificationChannelStrategyContract } from './NotificationChannelStrategyContract.js';

export class InAppNotificationStrategy extends NotificationChannelStrategyContract {
  getChannelName() { return 'IN_APP'; }
  async dispatch(notification) {
    notification.status = 'DELIVERED';
    return { channel: 'IN_APP', delivered: true, timestamp: new Date().toISOString() };
  }
}

export default InAppNotificationStrategy;

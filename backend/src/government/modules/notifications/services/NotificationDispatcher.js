import { InAppNotificationStrategy } from '../strategies/InAppNotificationStrategy.js';
import { MockEmailNotificationStrategy } from '../strategies/MockEmailNotificationStrategy.js';
import { MockSmsNotificationStrategy } from '../strategies/MockSmsNotificationStrategy.js';

export class NotificationDispatcher {
  constructor() {
    this.strategies = new Map();
    this.registerDefaultStrategies();
  }

  registerDefaultStrategies() {
    this.registerStrategy(new InAppNotificationStrategy());
    this.registerStrategy(new MockEmailNotificationStrategy());
    this.registerStrategy(new MockSmsNotificationStrategy());
  }

  registerStrategy(strategy) {
    this.strategies.set(strategy.getChannelName().toUpperCase(), strategy);
  }

  async dispatch(notification) {
    const channelName = (notification.channel || 'IN_APP').toUpperCase();
    const strategy = this.strategies.get(channelName);

    if (!strategy) {
      notification.status = 'FAILED';
      throw new Error(`No notification strategy registered for channel "${channelName}".`);
    }

    return await strategy.dispatch(notification);
  }
}

export default NotificationDispatcher;

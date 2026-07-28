export class NotificationChannelStrategyContract {
  getChannelName() { throw new Error('Strategy.getChannelName must be implemented.'); }
  async dispatch(notification) { throw new Error('Strategy.dispatch must be implemented.'); }
}

export default NotificationChannelStrategyContract;

export class EventPublisherContract {
  /**
   * Abstract method: Publish workflow lifecycle event
   */
  async publishEvent(eventType, payload) {
    throw new Error('EventPublisherContract.publishEvent must be implemented by concrete event publisher.');
  }
}

export default EventPublisherContract;

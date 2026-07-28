import { EventPublisherContract } from './EventPublisherContract.js';

export class MockEventPublisher extends EventPublisherContract {
  constructor() {
    super();
    this.publishedEvents = [];
  }

  async publishEvent(eventType, payload) {
    const eventRecord = {
      eventId: `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      eventType,
      payload,
      timestamp: new Date().toISOString(),
    };

    this.publishedEvents.push(eventRecord);
    return eventRecord;
  }
}

export default MockEventPublisher;

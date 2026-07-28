import { LifecycleEvent } from '../models/LifecycleEvent.js';

export class LifecycleEventPublisherContract {
  async publishLifecycleEvent(event) { throw new Error('LifecycleEventPublisherContract.publishLifecycleEvent must be implemented.'); }
}

export class MockLifecycleEventPublisher extends LifecycleEventPublisherContract {
  constructor() {
    super();
    this.publishedEvents = [];
  }

  async publishLifecycleEvent(complaintId, eventType, fromStatus, toStatus, actor, metadata = {}) {
    const event = new LifecycleEvent({
      complaintId,
      eventType,
      fromStatus,
      toStatus,
      actor,
      metadata,
    });
    this.publishedEvents.push(event);
    return event;
  }
}

export default { LifecycleEventPublisherContract, MockLifecycleEventPublisher };

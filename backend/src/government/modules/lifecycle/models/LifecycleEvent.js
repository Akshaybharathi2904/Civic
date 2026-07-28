export class LifecycleEvent {
  constructor({
    eventId = `evt_life_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    complaintId,
    eventType,
    fromStatus,
    toStatus,
    actor = 'SYSTEM',
    metadata = {},
    timestamp = new Date().toISOString(),
  }) {
    this.eventId = eventId;
    this.complaintId = complaintId;
    this.eventType = eventType;
    this.fromStatus = fromStatus;
    this.toStatus = toStatus;
    this.actor = actor;
    this.metadata = metadata;
    this.timestamp = timestamp;
  }
}

export default LifecycleEvent;

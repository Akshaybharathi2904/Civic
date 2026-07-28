export const assertPayloadStructure = (payload) => {
  const requiredKeys = ['complaintId', 'title', 'category', 'location', 'duplicate', 'community', 'priority', 'department', 'handoverStatus', 'workflowHistory'];
  requiredKeys.forEach((key) => {
    if (payload[key] === undefined) {
      throw new Error(`Payload assertion failed: Missing required property "${key}".`);
    }
  });
  return true;
};

export const assertHistorySequence = (history = [], expectedStates = []) => {
  const actualStates = history.map((h) => h.state);
  expectedStates.forEach((expectedState) => {
    if (!actualStates.includes(expectedState)) {
      throw new Error(`History assertion failed: Expected state "${expectedState}" not found in history: ${actualStates.join(' -> ')}`);
    }
  });
  return true;
};

export const assertEventEmitted = (publishedEvents = [], expectedEventType) => {
  const found = publishedEvents.some((evt) => evt.eventType === expectedEventType);
  if (!found) {
    throw new Error(`Event assertion failed: Event type "${expectedEventType}" was not published.`);
  }
  return true;
};

export default {
  assertPayloadStructure,
  assertHistorySequence,
  assertEventEmitted,
};

export class AgentContext {
  constructor(initialData = {}) {
    this.complaintId = initialData.complaintId || null;
    this.ticketId = initialData.ticketId || null;
    this.rawInput = initialData.rawInput || {};
    this.title = initialData.title || '';
    this.description = initialData.description || '';
    this.category = initialData.category || null;
    this.address = initialData.address || '';
    this.coordinates = initialData.coordinates || null; // [lng, lat]
    this.mediaFiles = initialData.mediaFiles || [];
    this.anonymous = initialData.anonymous || false;
    this.citizenId = initialData.citizenId || null;

    // Pipeline Step Results
    this.understanding = initialData.understanding || null;
    this.vision = initialData.vision || null;
    this.location = initialData.location || null;
    this.duplicate = initialData.duplicate || null;
    this.routing = initialData.routing || null;
    this.priority = initialData.priority || null;
    this.analytics = initialData.analytics || null;
    this.escalation = initialData.escalation || null;

    // Audit logs & Token usage
    this.executionLogs = initialData.executionLogs || [];
    this.totalTokenUsage = initialData.totalTokenUsage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    this.startTime = initialData.startTime || Date.now();
  }

  updateStepResult(stepName, result) {
    this[stepName] = result;
    if (result) {
      this.executionLogs.push(result);
    }
    if (result && result.tokenUsage) {
      this.totalTokenUsage.promptTokens += result.tokenUsage.promptTokens || 0;
      this.totalTokenUsage.completionTokens += result.tokenUsage.completionTokens || 0;
      this.totalTokenUsage.totalTokens += result.tokenUsage.totalTokens || 0;
    }
  }

  toJSON() {
    return {
      complaintId: this.complaintId,
      ticketId: this.ticketId,
      title: this.title,
      category: this.category,
      understanding: this.understanding,
      vision: this.vision,
      location: this.location,
      duplicate: this.duplicate,
      routing: this.routing,
      priority: this.priority,
      executionLogsCount: this.executionLogs.length,
      totalTokenUsage: this.totalTokenUsage,
    };
  }
}

export default AgentContext;

export class WorkflowContext {
  constructor(initialData = {}) {
    const rawComplaint = initialData.complaint || initialData;

    this.complaintId = rawComplaint.id || rawComplaint._id || rawComplaint.complaintId || `c_${Date.now()}`;
    this.ticketId = rawComplaint.ticketId || `CIV-${Math.floor(100000 + Math.random() * 900000)}`;

    this.complaint = {
      id: this.complaintId,
      ticketId: this.ticketId,
      title: rawComplaint.title || 'Untitled Complaint',
      description: rawComplaint.description || '',
      category: rawComplaint.category || 'General Civic Issue',
      severity: rawComplaint.severity || 'Medium',
      citizenId: rawComplaint.citizenId || rawComplaint.citizen || 'citizen_anonymous',
      createdAt: rawComplaint.createdAt || new Date().toISOString(),
    };

    // Images attached to complaint
    this.uploadedImages = rawComplaint.mediaFiles || rawComplaint.uploadedImages || rawComplaint.images || [];

    // GPS location details
    const coords = rawComplaint.location?.coordinates || [rawComplaint.longitude || 76.9558, rawComplaint.latitude || 11.0168];
    this.gpsLocation = {
      latitude: Number(rawComplaint.latitude ?? coords[1]),
      longitude: Number(rawComplaint.longitude ?? coords[0]),
      formattedAddress: rawComplaint.address || rawComplaint.formattedAddress || 'Coimbatore, Tamil Nadu',
    };

    // Map accumulating output per agent
    this.aiResults = {
      understanding: null,
      vision: null,
      location: null,
      duplicate: null,
      community: null,
      priority: null,
      department: null,
      workflow: null,
      escalation: null,
      notification: null,
      analytics: null,
      ...initialData.aiResults,
    };

    // Execution history, logs, metadata
    this.metadata = {
      startTime: Date.now(),
      endTime: null,
      totalExecutionTimeMs: 0,
      history: [],
      retryCountMap: {},
      errors: [],
      ...initialData.metadata,
    };

    this.workflowStatus = initialData.workflowStatus || 'WAITING';
  }

  /**
   * Update agent result and record step history cleanly
   */
  setAgentResult(agentKey, agentOutput) {
    this.aiResults[agentKey] = agentOutput;
  }

  /**
   * Log an execution event into context history
   */
  logStep(agentName, status, durationMs, details = {}) {
    const entry = {
      agentName,
      status, // 'RUNNING' | 'COMPLETED' | 'FAILED'
      durationMs,
      timestamp: new Date().toISOString(),
      details,
    };
    this.metadata.history.push(entry);
    return entry;
  }

  /**
   * Complete workflow execution
   */
  markCompleted() {
    this.workflowStatus = 'COMPLETED';
    this.metadata.endTime = Date.now();
    this.metadata.totalExecutionTimeMs = this.metadata.endTime - this.metadata.startTime;
  }

  /**
   * Mark workflow failed
   */
  markFailed(error) {
    this.workflowStatus = 'FAILED';
    this.metadata.endTime = Date.now();
    this.metadata.totalExecutionTimeMs = this.metadata.endTime - this.metadata.startTime;
    this.metadata.errors.push({
      message: error?.message || String(error),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Generate final aggregated AI Report
   */
  toFinalAIReport() {
    return {
      complaintId: this.complaintId,
      ticketId: this.ticketId,
      workflowStatus: this.workflowStatus,
      totalExecutionTimeMs: this.metadata.totalExecutionTimeMs,
      understanding: this.aiResults.understanding,
      vision: this.aiResults.vision,
      location: this.aiResults.location,
      duplicate: this.aiResults.duplicate,
      community: this.aiResults.community,
      priority: this.aiResults.priority,
      department: this.aiResults.department,
      summary: {
        issueType: this.aiResults.understanding?.issueType || this.complaint.category,
        severity: this.aiResults.priority?.priorityLevel || this.aiResults.understanding?.severity || 'Medium',
        priorityScore: this.aiResults.priority?.priorityScore || 50,
        recommendedDepartment: this.aiResults.department?.department || 'PWD',
        isDuplicate: this.aiResults.duplicate?.duplicates?.length > 0 || false,
        ward: this.aiResults.location?.ward || 'Ward 72 - RS Puram',
      },
      history: this.metadata.history,
    };
  }
}

export default WorkflowContext;

export class WorkflowContext {
  constructor(initialData = {}) {
    const rawComplaint = initialData.complaint || initialData;

    this.complaintId = rawComplaint.id || rawComplaint._id || rawComplaint.complaintId || `c_${Date.now()}`;
    this.ticketId = rawComplaint.ticketId || `CIV-${Math.floor(100000 + Math.random() * 900000)}`;

    this.complaint = {
      id: this.complaintId,
      ticketId: this.ticketId,
      title: rawComplaint.title || 'Untitled Civic Complaint',
      description: rawComplaint.description || '',
      category: rawComplaint.category || 'General Civic Hazard',
      severity: rawComplaint.severity || 'Medium',
      citizenId: rawComplaint.citizenId || rawComplaint.citizen || 'cit_101',
      createdAt: rawComplaint.createdAt || new Date().toISOString(),
    };

    this.uploadedImages = rawComplaint.mediaFiles || rawComplaint.uploadedImages || rawComplaint.images || [];

    const coords = rawComplaint.location?.coordinates || [rawComplaint.longitude || 76.9558, rawComplaint.latitude || 11.0168];
    this.gpsLocation = {
      latitude: Number(rawComplaint.latitude ?? coords[1]),
      longitude: Number(rawComplaint.longitude ?? coords[0]),
      formattedAddress: rawComplaint.address || rawComplaint.formattedAddress || 'Coimbatore, Tamil Nadu',
    };

    // ADK Agent Analysis Sections - Every agent updates ONLY its designated key
    this.complaintAnalysis = initialData.complaintAnalysis || null;
    this.visionAnalysis = initialData.visionAnalysis || null;
    this.locationAnalysis = initialData.locationAnalysis || null;
    this.duplicateAnalysis = initialData.duplicateAnalysis || null;
    this.communityValidation = initialData.communityValidation || null;
    this.priorityAssessment = initialData.priorityAssessment || null;
    this.departmentRecommendation = initialData.departmentRecommendation || null;

    this.workflowStatus = initialData.workflowStatus || 'WAITING'; // WAITING | RUNNING | COMPLETED | FAILED
    this.failedStage = initialData.failedStage || null;

    this.executionHistory = initialData.executionHistory || [];
    this.timestamps = {
      startedAt: initialData.timestamps?.startedAt || null,
      completedAt: initialData.timestamps?.completedAt || null,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Log an execution event into history
   */
  logExecutionEvent(agentName, status, durationMs, details = {}) {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const logItem = {
      timestamp,
      agentName,
      status, // 'STARTED' | 'COMPLETED' | 'FAILED' | 'RETRYING'
      durationMs,
      confidence: details.confidence || 0.95,
      reasoning: details.reasoning || details.summary || `${agentName} processed successfully`,
      details,
    };
    this.executionHistory.push(logItem);
    this.timestamps.updatedAt = new Date().toISOString();
    return logItem;
  }

  markStarted() {
    this.workflowStatus = 'RUNNING';
    this.timestamps.startedAt = new Date().toISOString();
  }

  markCompleted() {
    this.workflowStatus = 'COMPLETED';
    this.failedStage = null;
    this.timestamps.completedAt = new Date().toISOString();
  }

  markFailed(agentName, error) {
    this.workflowStatus = 'FAILED';
    this.failedStage = agentName;
    this.timestamps.updatedAt = new Date().toISOString();
  }
}

export default WorkflowContext;

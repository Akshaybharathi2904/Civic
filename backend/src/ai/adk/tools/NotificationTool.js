let socketIoService = null;
try {
  socketIoService = await import('../../../services/socket.service.js');
} catch (e) {
  // Optional Socket.io import
}

export class NotificationTool {
  static async publishWorkflowEvent(eventName, payload) {
    try {
      if (socketIoService && socketIoService.emitAgentProgress) {
        socketIoService.emitAgentProgress(payload.complaintId, {
          eventName,
          agentName: payload.agentName,
          stepNumber: payload.stepNumber,
          status: payload.status,
          agentOutput: payload.output || payload,
          confidence: payload.confidence || 0.95,
          executionTimeMs: payload.durationMs || 300,
          ticketId: payload.ticketId,
          timestamp: payload.timestamp || new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('[NotificationTool Socket Warning]:', err.message);
    }
  }
}

export default NotificationTool;

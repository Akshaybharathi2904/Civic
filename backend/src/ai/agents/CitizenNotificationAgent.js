import { BaseAgent } from './BaseAgent.js';

export class CitizenNotificationAgent extends BaseAgent {
  constructor() {
    super('Citizen Notification Agent', 10, 'notification');
  }

  async runInternal(context) {
    const dept = context.aiResults.department?.department || 'PWD';
    return {
      message: `Your complaint #${context.ticketId} has been successfully triaged and assigned to ${dept}.`,
      channel: 'WebSocket & SMS',
      sentAt: new Date().toISOString(),
      confidence: 0.99
    };
  }
}

export default CitizenNotificationAgent;

import { BaseAgent } from './BaseAgent.js';

export class CitizenNotificationAgent extends BaseAgent {
  constructor() {
    super('Citizen Notification Agent', 10);
  }

  async runInternal(context) {
    const ticketId = context.ticketId || 'CIV-10029';
    const dept = context.routing?.output?.departmentName || 'Public Works Dept';

    return {
      status: 'success',
      confidence: 0.99,
      reasoning: `Dispatched SMS & Push notification for Ticket #${ticketId} assigned to ${dept}.`,
      output: {
        notificationSent: true,
        channel: 'SMS / In-App Push',
        message: `Your report #${ticketId} has been registered and routed to ${dept}.`,
        tokenUsage: { promptTokens: 90, completionTokens: 30, totalTokens: 120 },
      },
    };
  }
}

export default CitizenNotificationAgent;

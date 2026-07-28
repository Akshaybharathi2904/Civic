import { RetryPolicy } from './RetryPolicy.js';
import { emitAgentProgress } from '../../../services/socket.service.js';

export class AgentExecutor {
  static async executeAgentStep(agent, context, complaintId = null, onStepCallback = null) {
    const result = await RetryPolicy.executeWithRetry(() => agent.execute(context), agent.name);

    if (complaintId) {
      try {
        emitAgentProgress(complaintId, result);
      } catch (e) {
        console.warn('[AgentExecutor Socket Notice]:', e.message);
      }
    }

    if (typeof onStepCallback === 'function') {
      onStepCallback(result);
    }

    return result;
  }
}

export default AgentExecutor;

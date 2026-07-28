import { OrchestratorConfig } from '../config/orchestrator.config.js';

export class RetryPolicy {
  static async executeWithRetry(actionFn, agentName = 'Agent', maxRetries = OrchestratorConfig.MAX_RETRIES) {
    let attempts = 0;
    while (attempts <= maxRetries) {
      try {
        return await actionFn();
      } catch (err) {
        attempts++;
        if (attempts > maxRetries) {
          throw err;
        }
        const backoffMs = OrchestratorConfig.BACKOFF_BASE_MS * Math.pow(2, attempts - 1);
        console.warn(`[RetryPolicy] Retry attempt ${attempts}/${maxRetries} for ${agentName} (waiting ${backoffMs}ms):`, err.message);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }
}

export default RetryPolicy;

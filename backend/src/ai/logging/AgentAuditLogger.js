import { prisma } from '../../config/prisma.js';

export class AgentAuditLogger {
  static async logAgentStep(payload) {
    const { complaintId, stepNumber, agentName, confidence, reasoning, status, executionTime, input, output, error } = payload;

    try {
      if (prisma && complaintId) {
        // Enriched output containing reasoning
        let finalOutput = output;
        if (reasoning) {
          const parsed = typeof output === 'object' ? output : (JSON.parse(output || '{}'));
          finalOutput = JSON.stringify({ ...parsed, reasoning });
        }

        await prisma.agentLog.create({
          data: {
            complaintId,
            stepNumber: Number(stepNumber) || 1,
            agentName,
            confidence: Number(confidence) || 0.95,
            status: status || 'success',
            executionTime: Number(executionTime) || 0,
            input: typeof input === 'object' ? JSON.stringify(input) : input || null,
            output: typeof finalOutput === 'object' ? JSON.stringify(finalOutput) : finalOutput || null,
            errorMessage: error ? (error.message || String(error)) : null,
          },
        }).catch(() => {
          // Ignore FK constraints during mock integration testing
        });
      }
    } catch (err) {
      // Gracefully catch logging exceptions
    }

    return {
      complaintId,
      stepNumber,
      agentName,
      confidence,
      reasoning,
      status,
      executionTime,
      output,
    };
  }
}

export default AgentAuditLogger;

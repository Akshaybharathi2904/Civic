import { prisma } from '../../config/prisma.js';

export class AgentAuditLogger {
  static async logAgentStep(payload) {
    const { complaintId, stepNumber, agentName, confidence, reasoning, status, executionTime, input, output, error } = payload;

    try {
      if (prisma && complaintId) {
        await prisma.agentLog.create({
          data: {
            complaintId,
            stepNumber: Number(stepNumber) || 1,
            agentName,
            confidence: Number(confidence) || 0.95,
            reasoning: reasoning || '',
            status: status || 'success',
            executionTime: Number(executionTime) || 0,
            input: typeof input === 'object' ? JSON.stringify(input) : input || null,
            output: typeof output === 'object' ? JSON.stringify(output) : output || null,
            error: error || null,
          },
        });
      }
    } catch (err) {
      console.warn(`[AgentAuditLogger] Database logging notice for ${agentName}:`, err.message);
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

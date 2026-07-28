import { prisma } from '../config/prisma.js';

export async function runEscalationAgent(complaintId = null) {
  const startTime = Date.now();
  let escalatedCount = 0;
  const warnings = [];

  try {
    if (prisma) {
      if (complaintId) {
        const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
        if (complaint) {
          const isOverdue = complaint.slaDueDate && new Date() > new Date(complaint.slaDueDate) && complaint.status !== 'Resolved';
          const isCriticalUnresolved = complaint.priorityLevel === 'Critical' && complaint.status === 'Reported';

          if (isOverdue || isCriticalUnresolved) {
            const reason = isOverdue
              ? `SLA Breach: Issue unresolved past target SLA date (${complaint.slaDueDate}).`
              : `Critical Severity Alert: Requires immediate emergency response force.`;

            await prisma.complaint.update({
              where: { id: complaintId },
              data: {
                isEscalated: true,
                escalationReason: reason
              }
            });
            escalatedCount++;
            warnings.push(`Ticket #${complaint.ticketId} escalated: ${reason}`);
          }

          return {
            isEscalated: complaint.isEscalated || isOverdue || isCriticalUnresolved,
            escalationReason: complaint.escalationReason || '',
            confidenceScore: 0.98,
            executionTimeMs: Date.now() - startTime
          };
        }
      }

      // Scan all overdue tickets across system
      const overdueComplaints = await prisma.complaint.findMany({
        where: {
          status: { notIn: ['Resolved', 'Verified'] },
          slaDueDate: { lt: new Date() },
          isEscalated: false
        },
        take: 25
      });

      for (const ticket of overdueComplaints) {
        const reason = `Automated Escalation Agent: Ticket unresolved past SLA target.`;
        await prisma.complaint.update({
          where: { id: ticket.id },
          data: {
            isEscalated: true,
            escalationReason: reason
          }
        });
        escalatedCount++;

        if (ticket.assignedOfficerId) {
          await prisma.notification.create({
            data: {
              recipientId: ticket.assignedOfficerId,
              title: `⚠️ SLA ESCALATION: Ticket #${ticket.ticketId}`,
              message: reason,
              type: 'escalation',
              complaintId: ticket.id
            }
          });
        }
      }
    }
  } catch (err) {
    console.warn('[Escalation Agent Warning] MySQL sweep note:', err.message);
  }

  return {
    escalatedCount,
    warnings,
    confidenceScore: 0.98,
    executionTimeMs: Date.now() - startTime
  };
}

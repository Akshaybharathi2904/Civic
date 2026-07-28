import { prisma } from '../config/prisma.js';
import { runEscalationAgent } from '../agents/escalation.agent.js';
import { MOCK_USERS } from '../utils/seedData.js';

export const getUsers = async (req, res) => {
  try {
    if (prisma) {
      const users = await prisma.user.findMany({
        include: { department: true },
        orderBy: { createdAt: 'desc' }
      });
      if (users.length > 0) {
        return res.json(users.map((u) => ({ ...u, _id: u.id })));
      }
    }
  } catch (error) {
    console.warn('[Get Users Prisma Note]:', error.message);
  }

  res.json(MOCK_USERS);
};

export const updateUserRole = async (req, res) => {
  try {
    const { role, departmentId } = req.body;
    let user = null;

    if (prisma) {
      user = await prisma.user.update({
        where: { id: req.params.id },
        data: {
          role: role || undefined,
          departmentId: departmentId || undefined
        }
      });
    }

    if (!user) {
      user = { id: req.params.id, role };
    }

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const triggerEscalationSweep = async (req, res) => {
  try {
    const result = await runEscalationAgent();
    res.json({ message: 'Automated Escalation Sweep executed', result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAgentLogs = async (req, res) => {
  try {
    const { complaintId } = req.query;

    if (prisma) {
      const where = complaintId ? { complaintId } : {};
      const logs = await prisma.agentLog.findMany({
        where,
        include: { complaint: { select: { ticketId: true, title: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100
      });
      return res.json(logs.map((l) => ({ ...l, _id: l.id })));
    }
  } catch (error) {
    console.warn('[Get Agent Logs Prisma Note]:', error.message);
  }

  res.json([]);
};

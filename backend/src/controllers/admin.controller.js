import { prisma } from '../config/prisma.js';
import { runEscalationAgent } from '../agents/escalation.agent.js';

export const getUsers = async (req, res) => {
  try {
    if (!prisma) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const users = await prisma.user.findMany({
      include: { department: true },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(users.map((u) => ({ ...u, _id: u.id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    if (!prisma) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const { role, departmentId } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        role: role || undefined,
        departmentId: departmentId || undefined
      }
    });

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
    if (!prisma) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const { complaintId } = req.query;
    const where = complaintId ? { complaintId } : {};

    const logs = await prisma.agentLog.findMany({
      where,
      include: { complaint: { select: { ticketId: true, title: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return res.json(logs.map((l) => ({ ...l, _id: l.id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

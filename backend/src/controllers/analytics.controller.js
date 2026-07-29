import { prisma } from '../config/prisma.js';
import { runGovernmentAnalyticsAgent } from '../agents/governmentAnalytics.agent.js';

export const getSystemAnalytics = async (req, res) => {
  try {
    const analytics = await runGovernmentAnalyticsAgent();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHeatmapData = async (req, res) => {
  try {
    if (!prisma) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const { status, category, department, ward, priority, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (department) where.assignedDepartmentId = department;
    if (ward) where.ward = ward;
    if (priority) where.priorityLevel = priority;

    if (search) {
      where.OR = [
        { ticketId: { contains: search } },
        { title: { contains: search } },
        { description: { contains: search } },
        { address: { contains: search } }
      ];
    }

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        assignedDepartment: true,
        citizen: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const points = complaints.map((c) => ({
      id: c.id,
      _id: c.id,
      ticketId: c.ticketId,
      lat: c.latitude,
      lng: c.longitude,
      weight: (c.priorityScore || 0) / 100,
      priorityScore: c.priorityScore,
      priorityLevel: c.priorityLevel,
      title: c.title,
      category: c.category,
      status: c.status,
      ward: c.ward,
      zone: c.zone,
      address: c.address,
      assignedDepartment: c.assignedDepartment,
      citizen: c.citizen,
      isDuplicate: c.isDuplicate,
      affectedCount: c.affectedCount,
      createdAt: c.createdAt
    }));

    res.json(points);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

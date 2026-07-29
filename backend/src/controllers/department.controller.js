import { prisma } from '../config/prisma.js';

export const getDepartments = async (req, res) => {
  try {
    if (!prisma) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const departments = await prisma.department.findMany({
      orderBy: { code: 'asc' }
    });

    return res.json(departments.map((d) => ({ ...d, _id: d.id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    if (!prisma) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const department = await prisma.department.findUnique({ where: { id: req.params.id } });

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const total = await prisma.complaint.count({ where: { assignedDepartmentId: department.id } });
    const resolved = await prisma.complaint.count({
      where: { assignedDepartmentId: department.id, status: 'Resolved' }
    });

    res.json({ department: { ...department, _id: department.id }, stats: { total, resolved } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    if (!prisma) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const { name, code, description, categories, contactEmail, contactPhone, SLAHours, icon } = req.body;

    const dept = await prisma.department.create({
      data: {
        name,
        code,
        description,
        categories: JSON.stringify(categories || []),
        contactEmail,
        contactPhone,
        SLAHours: SLAHours ? parseInt(SLAHours) : 48,
        icon: icon || 'Building2'
      }
    });

    res.status(201).json(dept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

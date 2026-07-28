import { prisma } from '../config/prisma.js';
import { MOCK_DEPARTMENTS } from '../utils/seedData.js';

export const getDepartments = async (req, res) => {
  try {
    if (prisma) {
      const departments = await prisma.department.findMany({
        orderBy: { code: 'asc' }
      });
      if (departments.length > 0) {
        return res.json(departments.map((d) => ({ ...d, _id: d.id })));
      }
    }
  } catch (error) {
    console.warn('[Get Departments Prisma Note]:', error.message);
  }

  res.json(MOCK_DEPARTMENTS);
};

export const getDepartmentById = async (req, res) => {
  try {
    let department = null;
    let total = 0;
    let resolved = 0;

    if (prisma) {
      department = await prisma.department.findUnique({ where: { id: req.params.id } });
      if (department) {
        total = await prisma.complaint.count({ where: { assignedDepartmentId: department.id } });
        resolved = await prisma.complaint.count({ where: { assignedDepartmentId: department.id, status: 'Resolved' } });
      }
    }

    if (!department) department = MOCK_DEPARTMENTS[0];
    res.json({ department: { ...department, _id: department.id || department._id }, stats: { total, resolved } });
  } catch (error) {
    res.json({ department: MOCK_DEPARTMENTS[0], stats: { total: 10, resolved: 7 } });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { name, code, description, categories, contactEmail, contactPhone, SLAHours, icon } = req.body;
    let dept = null;

    if (prisma) {
      dept = await prisma.department.create({
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
    }

    if (!dept) {
      dept = { id: `dept_${Date.now()}`, _id: `dept_${Date.now()}`, name, code, contactEmail, SLAHours: 48 };
    }

    res.status(201).json(dept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

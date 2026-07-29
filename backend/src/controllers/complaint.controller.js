import { prisma } from '../config/prisma.js';
import { executeMultiAgentPipeline } from '../agents/agentRunner.js';
import { emitComplaintStatusUpdate, emitComplaintCreated } from '../services/socket.service.js';

// --- Helpers ---

const formatComplaint = (c) => ({
  ...c,
  _id: c.id,
  location: { type: 'Point', coordinates: [c.longitude, c.latitude] },
  mediaFiles: c.media || [],
  agentResults: c.agentResults ? JSON.parse(c.agentResults) : null,
  ratings: c.ratings ? JSON.parse(c.ratings) : null
});

const requireDB = (res) => {
  if (!prisma) {
    res.status(503).json({ message: 'Database not available. Please check your connection.' });
    return false;
  }
  return true;
};

// --- Controllers ---

export const createComplaint = async (req, res) => {
  try {
    if (!requireDB(res)) return;

    const { title, description, category, longitude, latitude, address, ward, zone } = req.body;

    const mediaFiles = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        let type = 'image';
        if (file.mimetype.startsWith('audio/')) type = 'voice';
        else if (file.mimetype.startsWith('video/')) type = 'video';
        mediaFiles.push({ url: `/uploads/${file.filename}`, name: file.originalname, type });
      });
    }

    const ticketNumber = Math.floor(100000 + Math.random() * 900000);
    const ticketId = `CIV-${ticketNumber}`;
    const latVal = latitude ? parseFloat(latitude) : 0;
    const lngVal = longitude ? parseFloat(longitude) : 0;
    const citizenId = req.user.id;

    const dbComplaint = await prisma.complaint.create({
      data: {
        ticketId,
        title,
        description,
        category: category || 'General Civic Issue',
        issueType: category || 'General Civic Issue',
        latitude: latVal,
        longitude: lngVal,
        address: address || '',
        ward: ward || '',
        zone: zone || '',
        district: '',
        city: '',
        state: '',
        citizenId,
        status: 'Reported',
        media: {
          create: mediaFiles.map((m) => ({ url: m.url, name: m.name, type: m.type }))
        }
      },
      include: {
        citizen: true,
        assignedDepartment: true,
        media: true
      }
    });

    const complaint = formatComplaint(dbComplaint);

    emitComplaintCreated(complaint);

    // Trigger AI Multi-Agent Pipeline in background
    setTimeout(async () => {
      try {
        await executeMultiAgentPipeline(complaint);
      } catch (err) {
        console.error('[Pipeline Execution Error]', err);
      }
    }, 100);

    res.status(201).json({
      message: 'Complaint submitted successfully! AI Agents initiating processing...',
      complaint
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getComplaints = async (req, res) => {
  try {
    if (!requireDB(res)) return;

    const {
      status,
      category,
      department,
      officer,
      ward,
      priority,
      search,
      startDate,
      endDate,
      page,
      limit
    } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const userId = req.user?.id;
    const isCitizen = req.user?.role === 'citizen';

    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (department) where.assignedDepartmentId = department;
    if (officer) where.assignedOfficerId = officer;
    if (ward) where.ward = ward;
    if (priority) where.priorityLevel = priority;

    if (isCitizen) {
      where.citizenId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (search) {
      const q = search.trim();
      where.OR = [
        { ticketId: { contains: q } },
        { title: { contains: q } },
        { description: { contains: q } },
        { address: { contains: q } },
        { ward: { contains: q } },
        { category: { contains: q } },
        { citizen: { name: { contains: q } } }
      ];
    }

    const total = await prisma.complaint.count({ where });

    const dbComplaints = await prisma.complaint.findMany({
      where,
      include: {
        citizen: { select: { id: true, name: true, email: true, avatar: true, phone: true } },
        assignedDepartment: true,
        assignedOfficer: { select: { id: true, name: true, email: true, phone: true } },
        media: true
      },
      orderBy: [{ priorityScore: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limitNum
    });

    const complaints = dbComplaints.map(formatComplaint);
    const totalPages = Math.ceil(total / limitNum) || 1;

    if (page) {
      return res.json({
        complaints,
        pagination: { total, page: pageNum, limit: limitNum, totalPages }
      });
    }

    return res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getComplaintById = async (req, res) => {
  try {
    if (!requireDB(res)) return;

    const dbComplaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
      include: {
        citizen: true,
        assignedDepartment: true,
        assignedOfficer: true,
        duplicateOf: true,
        media: true
      }
    });

    if (!dbComplaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const complaint = formatComplaint(dbComplaint);

    const dbComments = await prisma.comment.findMany({
      where: { complaintId: dbComplaint.id },
      include: { author: true },
      orderBy: { createdAt: 'asc' }
    });
    const comments = dbComments.map((c) => ({ ...c, _id: c.id }));

    const dbHistory = await prisma.statusHistory.findMany({
      where: { complaintId: dbComplaint.id },
      include: { updatedBy: true },
      orderBy: { createdAt: 'asc' }
    });
    const statusHistory = dbHistory.map((s) => ({ ...s, _id: s.id }));

    res.json({ complaint, comments, statusHistory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    if (!requireDB(res)) return;

    const { status, note } = req.body;

    const dbComplaint = await prisma.complaint.findUnique({ where: { id: req.params.id } });
    if (!dbComplaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const prev = dbComplaint.status;
    const updated = await prisma.complaint.update({
      where: { id: req.params.id },
      data: { status }
    });

    await prisma.statusHistory.create({
      data: {
        complaintId: req.params.id,
        previousStatus: prev,
        status,
        note: note || `Status changed from ${prev} to ${status}`,
        updatedById: req.user.id
      }
    });

    const complaint = {
      ...updated,
      _id: updated.id,
      location: { type: 'Point', coordinates: [updated.longitude, updated.latitude] }
    };

    emitComplaintStatusUpdate(complaint);
    res.json({ message: `Status updated to ${status}`, complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const overridePriority = async (req, res) => {
  try {
    if (!requireDB(res)) return;

    const { priorityScore, priorityLevel } = req.body;

    const updated = await prisma.complaint.update({
      where: { id: req.params.id },
      data: { priorityScore: parseInt(priorityScore), priorityLevel }
    });

    const complaint = {
      ...updated,
      _id: updated.id,
      location: { type: 'Point', coordinates: [updated.longitude, updated.latitude] }
    };

    emitComplaintStatusUpdate(complaint);
    res.json({ message: 'Priority score overridden successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reassignDepartment = async (req, res) => {
  try {
    if (!requireDB(res)) return;

    const { departmentId } = req.body;

    const updated = await prisma.complaint.update({
      where: { id: req.params.id },
      data: { assignedDepartmentId: departmentId }
    });

    const complaint = {
      ...updated,
      _id: updated.id,
      location: { type: 'Point', coordinates: [updated.longitude, updated.latitude] }
    };

    emitComplaintStatusUpdate(complaint);
    res.json({ message: 'Department reassigned successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    if (!requireDB(res)) return;

    const { text, isOfficialNote } = req.body;

    const created = await prisma.comment.create({
      data: {
        complaintId: req.params.id,
        authorId: req.user.id,
        text,
        isOfficialNote: isOfficialNote || false
      },
      include: { author: true }
    });

    res.status(201).json({ ...created, _id: created.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rateComplaint = async (req, res) => {
  try {
    if (!requireDB(res)) return;

    const { rating, feedback } = req.body;
    const ratingObj = { rating: parseInt(rating), feedback: feedback || '', createdAt: new Date() };

    await prisma.complaint.update({
      where: { id: req.params.id },
      data: { ratings: JSON.stringify(ratingObj) }
    });

    res.json({ message: 'Rating saved', ratings: ratingObj });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

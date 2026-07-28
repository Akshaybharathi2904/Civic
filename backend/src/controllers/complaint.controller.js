import { prisma } from '../config/prisma.js';
import { executeMultiAgentPipeline } from '../agents/agentRunner.js';
import { emitComplaintStatusUpdate, emitComplaintCreated } from '../services/socket.service.js';
import { MOCK_COMPLAINTS, MOCK_DEPARTMENTS, MOCK_USERS } from '../utils/seedData.js';

let localComplaints = [...MOCK_COMPLAINTS];

export const createComplaint = async (req, res) => {
  try {
    const { title, description, category, longitude, latitude, address, ward, zone } = req.body;

    const mediaFiles = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        let type = 'image';
        if (file.mimetype.startsWith('audio/')) type = 'voice';
        else if (file.mimetype.startsWith('video/')) type = 'video';

        mediaFiles.push({
          url: `/uploads/${file.filename}`,
          name: file.originalname,
          type
        });
      });
    }

    const ticketNumber = Math.floor(100000 + Math.random() * 900000);
    const ticketId = `CIV-${ticketNumber}`;

    const latVal = latitude ? parseFloat(latitude) : 11.0168;
    const lngVal = longitude ? parseFloat(longitude) : 76.9558;
    const citizenId = req.user.id || req.user._id || MOCK_USERS[2]._id;

    let complaint;
    try {
      if (prisma) {
        complaint = await prisma.complaint.create({
          data: {
            ticketId,
            title,
            description,
            category: category || 'General Civic Issue',
            issueType: category || 'General Civic Issue',
            latitude: latVal,
            longitude: lngVal,
            address: address || 'DB Road, RS Puram, Coimbatore, Tamil Nadu',
            ward: ward || 'Ward 72 - RS Puram',
            zone: zone || 'Central Zone',
            district: 'Coimbatore',
            city: 'Coimbatore',
            state: 'Tamil Nadu',
            citizenId: citizenId,
            status: 'Reported',
            media: {
              create: mediaFiles.map((m) => ({
                url: m.url,
                name: m.name,
                type: m.type
              }))
            }
          },
          include: {
            citizen: true,
            assignedDepartment: true,
            media: true
          }
        });

        complaint = {
          ...complaint,
          _id: complaint.id,
          location: { type: 'Point', coordinates: [complaint.longitude, complaint.latitude] },
          mediaFiles: complaint.media || []
        };
      }
    } catch (err) {
      console.warn('[Create Complaint MySQL Notice]:', err.message);
    }

    if (!complaint) {
      complaint = {
        id: `comp_${ticketNumber}`,
        _id: `comp_${ticketNumber}`,
        ticketId,
        title,
        description,
        category: category || 'General Civic Issue',
        issueType: category || 'General Civic Issue',
        latitude: latVal,
        longitude: lngVal,
        location: { type: 'Point', coordinates: [lngVal, latVal] },
        address: address || 'DB Road, RS Puram, Coimbatore, Tamil Nadu',
        ward: ward || 'Ward 72 - RS Puram',
        zone: zone || 'Central Zone',
        district: 'Coimbatore',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        mediaFiles,
        citizen: req.user,
        citizenId,
        status: 'Reported',
        severity: 'Medium',
        priorityScore: 65,
        priorityLevel: 'High',
        affectedCount: 1,
        isDuplicate: false,
        isEscalated: false,
        createdAt: new Date().toISOString()
      };
      localComplaints.unshift(complaint);
    }

    // Broadcast Socket.io event for real-time My Tickets updates
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

    const userId = req.user?.id || req.user?._id;
    const isCitizen = req.user?.role === 'citizen';

    try {
      if (prisma) {
        const where = {};
        if (status) where.status = status;
        if (category) where.category = category;
        if (department) where.assignedDepartmentId = department;
        if (officer) where.assignedOfficerId = officer;
        if (ward) where.ward = ward;
        if (priority) where.priorityLevel = priority;
        
        // Scope strictly to authenticated citizen
        if (isCitizen) {
          where.citizenId = userId;
        }

        // Date Range Filter
        if (startDate || endDate) {
          where.createdAt = {};
          if (startDate) where.createdAt.gte = new Date(startDate);
          if (endDate) where.createdAt.lte = new Date(endDate);
        }

        // Multi-field search (Ticket ID, Citizen Name, Location, Category, Title)
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

        // Total count matching filters
        const total = await prisma.complaint.count({ where });

        // Sorting: PriorityScore descending (Critical -> High -> Medium -> Low), then createdAt descending (Newest first)
        const dbComplaints = await prisma.complaint.findMany({
          where,
          include: {
            citizen: { select: { id: true, name: true, email: true, avatar: true, phone: true } },
            assignedDepartment: true,
            assignedOfficer: { select: { id: true, name: true, email: true, phone: true } },
            media: true
          },
          orderBy: [
            { priorityScore: 'desc' },
            { createdAt: 'desc' }
          ],
          skip,
          take: limitNum
        });

        const complaints = dbComplaints.map((c) => ({
          ...c,
          _id: c.id,
          location: { type: 'Point', coordinates: [c.longitude, c.latitude] },
          mediaFiles: c.media || [],
          agentResults: c.agentResults ? JSON.parse(c.agentResults) : null
        }));

        const totalPages = Math.ceil(total / limitNum) || 1;

        if (page) {
          return res.json({
            complaints,
            pagination: {
              total,
              page: pageNum,
              limit: limitNum,
              totalPages
            }
          });
        }

        return res.json(complaints);
      }
    } catch (err) {
      console.warn('[Get Complaints Prisma Note]:', err.message);
    }

    // Fallback scoping to authenticated citizen if DB offline
    let filteredLocal = [...localComplaints];
    if (isCitizen) {
      filteredLocal = filteredLocal.filter((c) => {
        const cUserId = c.citizenId || c.citizen?.id || c.citizen?._id;
        return cUserId === userId;
      });
    }

    if (status) filteredLocal = filteredLocal.filter((c) => c.status === status);
    if (category) filteredLocal = filteredLocal.filter((c) => c.category === category);
    if (priority) filteredLocal = filteredLocal.filter((c) => c.priorityLevel === priority);
    if (department) filteredLocal = filteredLocal.filter((c) => c.assignedDepartmentId === department || c.assignedDepartment?._id === department || c.assignedDepartment?.id === department);
    if (officer) filteredLocal = filteredLocal.filter((c) => c.assignedOfficerId === officer || c.assignedOfficer?._id === officer || c.assignedOfficer?.id === officer);
    if (ward) filteredLocal = filteredLocal.filter((c) => c.ward === ward);

    if (search) {
      const q = search.toLowerCase();
      filteredLocal = filteredLocal.filter(
        (c) =>
          c.ticketId.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          (c.citizen?.name && c.citizen.name.toLowerCase().includes(q))
      );
    }

    // Sort priorityScore desc, then createdAt desc
    filteredLocal.sort((a, b) => {
      const prioDiff = (b.priorityScore || 50) - (a.priorityScore || 50);
      if (prioDiff !== 0) return prioDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = filteredLocal.length;
    const paginatedLocal = filteredLocal.slice(skip, skip + limitNum);
    const totalPages = Math.ceil(total / limitNum) || 1;

    if (page) {
      return res.json({
        complaints: paginatedLocal,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages
        }
      });
    }

    res.json(paginatedLocal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getComplaintById = async (req, res) => {
  try {
    let complaint = null;
    let comments = [];
    let statusHistory = [];

    try {
      if (prisma) {
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

        if (dbComplaint) {
          complaint = {
            ...dbComplaint,
            _id: dbComplaint.id,
            location: { type: 'Point', coordinates: [dbComplaint.longitude, dbComplaint.latitude] },
            mediaFiles: dbComplaint.media || [],
            agentResults: dbComplaint.agentResults ? JSON.parse(dbComplaint.agentResults) : null,
            ratings: dbComplaint.ratings ? JSON.parse(dbComplaint.ratings) : null
          };

          const dbComments = await prisma.comment.findMany({
            where: { complaintId: dbComplaint.id },
            include: { author: true },
            orderBy: { createdAt: 'asc' }
          });
          comments = dbComments.map((c) => ({ ...c, _id: c.id }));

          const dbHistory = await prisma.statusHistory.findMany({
            where: { complaintId: dbComplaint.id },
            include: { updatedBy: true },
            orderBy: { createdAt: 'asc' }
          });
          statusHistory = dbHistory.map((s) => ({ ...s, _id: s.id }));
        }
      }
    } catch (err) {
      console.warn('[Get Complaint By ID Prisma Note]:', err.message);
    }

    if (!complaint) {
      complaint = localComplaints.find((c) => c._id === req.params.id || c.id === req.params.id) || localComplaints[0];
    }

    res.json({
      complaint,
      comments,
      statusHistory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    let complaint = null;

    try {
      if (prisma) {
        const dbComplaint = await prisma.complaint.findUnique({ where: { id: req.params.id } });
        if (dbComplaint) {
          const prev = dbComplaint.status;
          const updated = await prisma.complaint.update({
            where: { id: req.params.id },
            data: { status }
          });

          await prisma.statusHistory.create({
            data: {
              complaintId: req.params.id,
              previousStatus: prev,
              status: status,
              note: note || `Status changed from ${prev} to ${status}`,
              updatedById: req.user.id || req.user._id || MOCK_USERS[0]._id
            }
          });

          complaint = {
            ...updated,
            _id: updated.id,
            location: { type: 'Point', coordinates: [updated.longitude, updated.latitude] }
          };
        }
      }
    } catch (err) {
      console.warn('[Update Complaint Status Prisma Note]:', err.message);
    }

    if (!complaint) {
      complaint = localComplaints.find((c) => c._id === req.params.id || c.id === req.params.id);
      if (complaint) complaint.status = status;
    }

    if (complaint) emitComplaintStatusUpdate(complaint);
    res.json({ message: `Status updated to ${status}`, complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const overridePriority = async (req, res) => {
  try {
    const { priorityScore, priorityLevel } = req.body;
    let complaint = null;

    try {
      if (prisma) {
        const updated = await prisma.complaint.update({
          where: { id: req.params.id },
          data: {
            priorityScore: parseInt(priorityScore),
            priorityLevel
          }
        });
        complaint = {
          ...updated,
          _id: updated.id,
          location: { type: 'Point', coordinates: [updated.longitude, updated.latitude] }
        };
      }
    } catch (err) {
      console.warn('[Override Priority Prisma Note]:', err.message);
    }

    if (!complaint) {
      complaint = localComplaints.find((c) => c._id === req.params.id || c.id === req.params.id);
      if (complaint) {
        complaint.priorityScore = parseInt(priorityScore);
        complaint.priorityLevel = priorityLevel;
      }
    }

    if (complaint) emitComplaintStatusUpdate(complaint);
    res.json({ message: 'Priority score overridden successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reassignDepartment = async (req, res) => {
  try {
    const { departmentId } = req.body;
    let complaint = null;

    try {
      if (prisma) {
        const updated = await prisma.complaint.update({
          where: { id: req.params.id },
          data: { assignedDepartmentId: departmentId }
        });
        complaint = {
          ...updated,
          _id: updated.id,
          location: { type: 'Point', coordinates: [updated.longitude, updated.latitude] }
        };
      }
    } catch (err) {
      console.warn('[Reassign Department Prisma Note]:', err.message);
    }

    if (!complaint) {
      complaint = localComplaints.find((c) => c._id === req.params.id || c.id === req.params.id);
      if (complaint) complaint.assignedDepartment = MOCK_DEPARTMENTS[0];
    }

    if (complaint) emitComplaintStatusUpdate(complaint);
    res.json({ message: 'Department reassigned successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { text, isOfficialNote } = req.body;
    let comment = null;

    try {
      if (prisma) {
        const created = await prisma.comment.create({
          data: {
            complaintId: req.params.id,
            authorId: req.user.id || req.user._id,
            text,
            isOfficialNote: isOfficialNote || false
          },
          include: { author: true }
        });
        comment = { ...created, _id: created.id };
      }
    } catch (err) {
      console.warn('[Add Comment Prisma Note]:', err.message);
    }

    if (!comment) {
      comment = {
        _id: `comment_${Date.now()}`,
        id: `comment_${Date.now()}`,
        complaintId: req.params.id,
        author: req.user || MOCK_USERS[0],
        text,
        isOfficialNote: isOfficialNote || false,
        createdAt: new Date().toISOString()
      };
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rateComplaint = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const ratingObj = { rating: parseInt(rating), feedback: feedback || '', createdAt: new Date() };

    try {
      if (prisma) {
        await prisma.complaint.update({
          where: { id: req.params.id },
          data: { ratings: JSON.stringify(ratingObj) }
        });
      }
    } catch (err) {
      // Ignored if offline
    }

    res.json({ message: 'Rating saved', ratings: ratingObj });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 10 TAMIL NADU MUNICIPAL DEPARTMENTS
const DEPARTMENTS = [
  { name: 'Highways & Public Works Department (PWD)', code: 'PWD', icon: 'Construction', SLAHours: 24, categories: ['Pothole', 'Road Damage', 'Damaged Footpath', 'Bridge Repairs'] },
  { name: 'Greater Coimbatore Municipal Corporation (GCCMC)', code: 'GCCMC', icon: 'Trash2', SLAHours: 36, categories: ['Garbage Overflow', 'Illegal Dumping', 'Unswept Streets', 'Debris'] },
  { name: 'Tamil Nadu Water Supply & Drainage Board (TWAD)', code: 'TWAD', icon: 'Droplets', SLAHours: 12, categories: ['Water Leakage', 'No Water Supply', 'Pipe Burst'] },
  { name: 'Tamil Nadu Electricity Board (TANGEDCO)', code: 'TANGEDCO', icon: 'Zap', SLAHours: 12, categories: ['Broken Streetlight', 'Exposed Wires', 'Transformer Hazard', 'Power Line Down'] },
  { name: 'Tamil Nadu Traffic Police', code: 'TRAFFIC_POLICE', icon: 'ShieldAlert', SLAHours: 6, categories: ['Traffic Signal Failure', 'Illegal Parking', 'Road Barrier Damage'] },
  { name: 'Parks & Urban Forestry Department', code: 'FOREST', icon: 'Trees', SLAHours: 48, categories: ['Fallen Tree', 'Overgrown Branches', 'Park Maintenance'] },
  { name: 'Storm Water Drainage Board', code: 'DRAINAGE', icon: 'Waves', SLAHours: 18, categories: ['Sewage Overflow', 'Flooding', 'Open Manhole', 'Drainage Blockage'] },
  { name: 'Tamil Nadu Pollution Control Board (TNPCB)', code: 'TNPCB', icon: 'Wind', SLAHours: 48, categories: ['Industrial Emission', 'Noise Pollution', 'Chemical Spill'] },
  { name: 'Animal Control & Public Health', code: 'ANIMAL_CONTROL', icon: 'Dog', SLAHours: 24, categories: ['Stray Dog Menace', 'Dead Animal Removal', 'Mosquito Breeding'] },
  { name: 'Fire & Rescue & Disaster Management Authority', code: 'DISASTER_MGMT', icon: 'Flame', SLAHours: 4, categories: ['Building Rupture', 'Severe Storm Hazard', 'Monsoon Flooding'] }
];

// COIMBATORE LOCATIONS & WARDS
const COIMBATORE_LOCATIONS = [
  { ward: 'Ward 72 - RS Puram', zone: 'Central Zone', lat: 11.0084, lng: 76.9508, address: 'DB Road, RS Puram, Coimbatore, Tamil Nadu 641002' },
  { ward: 'Ward 54 - Gandhipuram', zone: 'Central Zone', lat: 11.0168, lng: 76.9658, address: 'Cross Cut Road, Gandhipuram, Coimbatore, Tamil Nadu 641012' },
  { ward: 'Ward 38 - Peelamedu', zone: 'East Zone', lat: 11.0284, lng: 77.0035, address: 'Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu 641004' },
  { ward: 'Ward 22 - Saravanampatti', zone: 'North Zone', lat: 11.0802, lng: 76.9942, address: 'Sathy Road, IT Park, Saravanampatti, Coimbatore, Tamil Nadu 641035' },
  { ward: 'Ward 62 - Singanallur', zone: 'South Zone', lat: 11.0002, lng: 77.0264, address: 'Trichy Road, Singanallur, Coimbatore, Tamil Nadu 641005' },
  { ward: 'Ward 82 - Ukkadam', zone: 'South Zone', lat: 10.9912, lng: 76.9614, address: 'Bypass Road, Ukkadam, Coimbatore, Tamil Nadu 641001' },
  { ward: 'Ward 44 - Saibaba Colony', zone: 'West Zone', lat: 11.0275, lng: 76.9421, address: 'NSR Road, Saibaba Colony, Coimbatore, Tamil Nadu 641011' },
  { ward: 'Ward 70 - Race Course', zone: 'Central Zone', lat: 11.0048, lng: 76.9745, address: 'Race Course Road, Coimbatore, Tamil Nadu 641018' },
  { ward: 'Ward 88 - Kuniyamuthur', zone: 'South Zone', lat: 10.9635, lng: 76.9382, address: 'Palakkad Road, Kuniyamuthur, Coimbatore, Tamil Nadu 641008' },
  { ward: 'Ward 48 - Vadavalli', zone: 'West Zone', lat: 11.0185, lng: 76.9025, address: 'Marudamalai Road, Vadavalli, Coimbatore, Tamil Nadu 641041' },
  { ward: 'Ward 12 - Kalapatti', zone: 'North Zone', lat: 11.0725, lng: 77.0312, address: 'Kalapatti Main Road, Coimbatore, Tamil Nadu 641048' },
  { ward: 'Ward 30 - Ganapathy', zone: 'North Zone', lat: 11.0398, lng: 76.9754, address: 'Sathy Road, Ganapathy, Coimbatore, Tamil Nadu 641006' }
];

// COMPLAINT SPECIFICATIONS FOR TAMIL NADU
const COMPLAINT_TEMPLATES = [
  { category: 'Pothole', title: 'Deep Pothole on Avinashi Road near Hope College', deptCode: 'PWD' },
  { category: 'Road Damage', title: 'Damaged Asphalt Road Surface on Mettupalayam Road', deptCode: 'PWD' },
  { category: 'Garbage Overflow', title: 'Overflowing Garbage Bin near Gandhipuram Bus Stand', deptCode: 'GCCMC' },
  { category: 'Broken Streetlight', title: 'Broken Streetlight Corridor at RS Puram DB Road', deptCode: 'TANGEDCO' },
  { category: 'Water Leakage', title: 'TWAD Main Pipeline Leakage near Peelamedu Junction', deptCode: 'TWAD' },
  { category: 'Sewage Overflow', title: 'Sewage Overflow at Ukkadam Bus Terminal Area', deptCode: 'DRAINAGE' },
  { category: 'Illegal Dumping', title: 'Illegal Waste Dumping near Singanallur Lake Bank', deptCode: 'GCCMC' },
  { category: 'Flooding', title: 'Monsoon Waterlogging on Sathy Road near Saravanampatti', deptCode: 'DRAINAGE' },
  { category: 'Fallen Tree', title: 'Fallen Neem Tree Obstructing Lane after Heavy Rain', deptCode: 'FOREST' },
  { category: 'Damaged Footpath', title: 'Broken Paver Tiles on Race Course Pedestrian Walkway', deptCode: 'PWD' },
  { category: 'Traffic Signal Failure', title: 'Traffic Signal Malfunction at Lakshmi Mills Junction', deptCode: 'TRAFFIC_POLICE' },
  { category: 'Open Manhole', title: 'Hazardous Open Storm Manhole near Town Hall Market', deptCode: 'DRAINAGE' }
];

// REALISTIC TAMIL NAMES
const CITIZEN_NAMES = [
  'Arun Kumar', 'Karthikeyan', 'Vignesh', 'Suresh Kumar', 'Senthil',
  'Saravanan', 'Prakash', 'Dinesh', 'Lakshmi', 'Priya',
  'Revathi', 'Nandhini', 'Murugan', 'Vijay', 'Jayanthi',
  'Anbarasan', 'Elango', 'Deepa', 'Kausalya', 'Divya'
];

const OFFICER_NAMES = [
  'Inspector Senthil Nathan', 'Officer Vigneshwaran', 'Engineer Lakshmi Narayanan', 'Inspector Karthik Raja', 'Officer Saravanan Perumal',
  'Engineer Revathi Subramanian', 'Inspector Muruganandam', 'Officer Dinesh Kumar', 'Engineer Anbarasan', 'Inspector Prakash Swaminathan'
];

// AI AGENT NAMES FOR LOGGING
const AGENT_NAMES = [
  'Complaint Understanding Agent',
  'Vision Analysis Agent',
  'Location Intelligence Agent',
  'Duplicate Detection Agent',
  'Department Routing Agent',
  'Priority Scoring Agent',
  'Workflow Tracking Agent',
  'Escalation Agent',
  'Citizen Notification Agent',
  'Government Analytics Agent'
];

// PHOTO EVIDENCE URLS
const PHOTO_URLS = [
  'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1617886322168-72b886573c35?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800'
];

export async function seedMySQLDatabase() {
  try {
    console.log(`\n======================================================`);
    console.log(`🐝 [CivicSwarm Seeder] Initiating Streamlined MySQL Database Seeding (Coimbatore, Tamil Nadu)`);
    console.log(`======================================================\n`);

    // Disable foreign key checks for clean table wipe
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

    await prisma.agentLog.deleteMany({});
    await prisma.statusHistory.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.complaintMedia.deleteMany({});
    await prisma.complaintDuplicate.deleteMany({});
    await prisma.complaintSupporter.deleteMany({});
    await prisma.complaint.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.department.deleteMany({});

    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. SEED 10 DEPARTMENTS
    const createdDepts = [];
    for (const d of DEPARTMENTS) {
      const dept = await prisma.department.create({
        data: {
          name: d.name,
          code: d.code,
          description: `Official municipal authority for ${d.name} in Coimbatore, Tamil Nadu.`,
          categories: JSON.stringify(d.categories),
          contactEmail: `contact@${d.code.toLowerCase()}.tn.gov.in`,
          contactPhone: '+91-422-CIVIC-001',
          SLAHours: d.SLAHours,
          icon: d.icon
        }
      });
      createdDepts.push(dept);
    }
    console.log(`✅ [1/9] Created 10 Tamil Nadu Municipal Departments.`);

    // 2. SEED 2 ADMINISTRATORS
    const adminUser = await prisma.user.create({
      data: {
        name: 'Coimbatore District Collector & Admin',
        email: 'admin@civicswarm.gov.in',
        password: hashedPassword,
        role: 'admin',
        phone: '+91-9876543210',
        ward: 'District Collectorate',
        city: 'Coimbatore'
      }
    });

    const superAdminUser = await prisma.user.create({
      data: {
        name: 'Tamil Nadu GovTech Super Admin',
        email: 'superadmin@civicswarm.gov.in',
        password: hashedPassword,
        role: 'admin',
        phone: '+91-9876543211',
        ward: 'State Command Center',
        city: 'Coimbatore'
      }
    });
    console.log(`✅ [2/9] Created 2 Tamil Nadu System Administrators.`);

    // 3. SEED 10 OFFICERS
    const createdOfficers = [];
    for (let i = 0; i < 10; i++) {
      const dept = createdDepts[i % createdDepts.length];
      const isHead = i < createdDepts.length;
      const officer = await prisma.user.create({
        data: {
          name: OFFICER_NAMES[i],
          email: `officer${i + 1}@${dept.code.toLowerCase()}.tn.gov.in`,
          password: hashedPassword,
          role: isHead ? 'department_head' : 'officer',
          departmentId: dept.id,
          phone: `+91-987000${1000 + i + 1}`,
          ward: 'Coimbatore Command Center',
          city: 'Coimbatore'
        }
      });
      createdOfficers.push(officer);
    }
    console.log(`✅ [3/9] Created 10 Government Officers.`);

    // 4. SEED 20 CITIZENS
    const createdCitizens = [];
    for (let i = 0; i < 20; i++) {
      const loc = COIMBATORE_LOCATIONS[i % COIMBATORE_LOCATIONS.length];
      const citizen = await prisma.user.create({
        data: {
          name: CITIZEN_NAMES[i],
          email: `citizen${i + 1}@example.com`,
          password: hashedPassword,
          role: 'citizen',
          phone: `+91-998877${1000 + i + 1}`,
          ward: loc.ward,
          city: 'Coimbatore'
        }
      });
      createdCitizens.push(citizen);
    }
    console.log(`✅ [4/9] Created 20 Tamil Nadu Citizens.`);

    // 5. SEED 30 COMPLAINTS & TIMELINES
    const createdComplaints = [];
    const statuses = ['Reported', 'Acknowledged', 'Department Assigned', 'Officer Assigned', 'Inspection', 'Work Started', 'Resolved', 'Citizen Verified'];
    const now = Date.now();
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;

    for (let i = 1; i <= 30; i++) {
      const template = COMPLAINT_TEMPLATES[i % COMPLAINT_TEMPLATES.length];
      const loc = COIMBATORE_LOCATIONS[i % COIMBATORE_LOCATIONS.length];
      const citizen = createdCitizens[i % createdCitizens.length];
      const dept = createdDepts.find((d) => d.code === template.deptCode) || createdDepts[0];
      const officer = createdOfficers.find((o) => o.departmentId === dept.id) || createdOfficers[0];

      // Priority Distribution: Critical (4), High (8 font), Medium (12), Low (6)
      let priorityLevel = 'Medium';
      let priorityScore = 55;
      if (i <= 4) { priorityLevel = 'Critical'; priorityScore = 92; }
      else if (i <= 12) { priorityLevel = 'High'; priorityScore = 76; }
      else if (i <= 24) { priorityLevel = 'Medium'; priorityScore = 55; }
      else { priorityLevel = 'Low'; priorityScore = 32; }

      const status = statuses[i % statuses.length];
      const ticketId = `CIV-${100000 + i}`;
      const randomOffset = Math.floor(Math.random() * ninetyDaysMs);
      const createdAt = new Date(now - randomOffset);

      const latJitter = (Math.random() - 0.5) * 0.004;
      const lngJitter = (Math.random() - 0.5) * 0.004;

      const complaint = await prisma.complaint.create({
        data: {
          ticketId,
          title: template.title,
          description: `Citizen notice regarding ${template.category.toLowerCase()} hazard observed at ${loc.address}. Urgent municipal action requested.`,
          category: template.category,
          issueType: template.category,
          severity: priorityLevel,
          priorityScore,
          priorityLevel,
          status,
          latitude: loc.lat + latJitter,
          longitude: loc.lng + lngJitter,
          address: loc.address,
          ward: loc.ward,
          zone: loc.zone,
          district: 'Coimbatore',
          city: 'Coimbatore',
          state: 'Tamil Nadu',
          citizenId: citizen.id,
          assignedDepartmentId: dept.id,
          assignedOfficerId: officer.id,
          affectedCount: Math.floor(Math.random() * 4) + 1,
          isDuplicate: false,
          slaDueDate: new Date(createdAt.getTime() + 86400000 * 2),
          isEscalated: priorityLevel === 'Critical' && status !== 'Resolved',
          escalationReason: priorityLevel === 'Critical' && status !== 'Resolved' ? 'Critical SLA warning threshold exceeded.' : '',
          tags: JSON.stringify([template.category, loc.ward.split('-')[1]?.trim() || 'Coimbatore']),
          agentResults: JSON.stringify({
            understanding: { issueType: template.category, confidenceScore: 0.96 },
            imageAnalysis: { detectedIssue: template.title, confidenceScore: 0.94, severity: priorityLevel },
            routing: { assignedDeptCode: dept.code, routingReason: `Auto-routed to ${dept.name}.` }
          }),
          createdAt
        }
      });
      createdComplaints.push(complaint);

      // Attach photo evidence to 15 complaints
      if (i <= 15) {
        await prisma.complaintMedia.create({
          data: {
            complaintId: complaint.id,
            url: PHOTO_URLS[i % PHOTO_URLS.length],
            name: `coimbatore_evidence_${i}.jpg`,
            type: 'image'
          }
        });
      }

      // Create Status History Timeline
      await prisma.statusHistory.create({
        data: {
          complaintId: complaint.id,
          previousStatus: 'Reported',
          status,
          updatedById: officer.id,
          note: `Complaint status updated to ${status} by ${officer.name}`,
          createdAt: new Date(createdAt.getTime() + 1800000)
        }
      });
    }
    console.log(`✅ [5/9] Created 30 Complaints across Coimbatore with Photo Evidence.`);

    // 6. SEED 5 DUPLICATE CLUSTERS (5 Linked Pairs)
    let duplicateLinksCount = 0;
    for (let c = 0; c < 5; c++) {
      const primary = createdComplaints[c * 2];
      const duplicateTarget = createdComplaints[c * 2 + 1];

      if (primary && duplicateTarget) {
        await prisma.complaint.update({
          where: { id: duplicateTarget.id },
          data: {
            isDuplicate: true,
            duplicateOfComplaintId: primary.id,
            duplicateDistanceMeters: 120,
            title: `[RE: ${primary.ticketId}] ${duplicateTarget.title}`
          }
        });

        await prisma.complaintDuplicate.create({
          data: {
            primaryComplaintId: primary.id,
            duplicateComplaintId: duplicateTarget.id,
            distanceMeters: 120
          }
        });
        duplicateLinksCount++;
      }
    }
    console.log(`✅ [6/9] Created 5 Duplicate Complaint Spatial Clusters.`);

    // 7. SEED 300 AI AGENT LOGS (10 per complaint)
    let agentLogsCount = 0;
    for (const complaint of createdComplaints) {
      for (let step = 1; step <= 10; step++) {
        const agentName = AGENT_NAMES[step - 1];
        await prisma.agentLog.create({
          data: {
            complaintId: complaint.id,
            agentName,
            stepNumber: step,
            input: JSON.stringify({ ticketId: complaint.ticketId, title: complaint.title, category: complaint.category }),
            output: JSON.stringify({
              agentName,
              status: 'success',
              confidenceScore: 0.96,
              tokenUsage: { promptTokens: 120 + step * 5, completionTokens: 40 + step * 3, totalTokens: 160 + step * 8 },
              reasoning: `Step ${step} executed autonomously for ${complaint.ticketId} with high confidence.`
            }),
            confidence: 0.96,
            executionTime: 90 + step * 8,
            status: 'success',
            errorMessage: `Step ${step} completed successfully.`,
            createdAt: new Date(complaint.createdAt.getTime() + step * 300000)
          }
        });
        agentLogsCount++;
      }
    }
    console.log(`✅ [7/9] Created ${agentLogsCount} AI Agent Execution Logs.`);

    // 8. SEED 80 COMMENTS
    let commentCount = 0;
    const commentTemplates = [
      'Highways work order generated for field maintenance crew.',
      'Field inspection scheduled with GCCMC site supervisor.',
      'TWAD repair crew dispatched to location with replacement pipe.',
      'Citizen confirmed resolution with 5-star rating.',
      'Initial triage verified by AI Swarm Mesh.'
    ];

    for (let i = 1; i <= 80; i++) {
      const complaint = createdComplaints[i % createdComplaints.length];
      const author = i % 2 === 0 ? createdOfficers[i % createdOfficers.length] : createdCitizens[i % createdCitizens.length];

      await prisma.comment.create({
        data: {
          complaintId: complaint.id,
          authorId: author.id,
          text: commentTemplates[i % commentTemplates.length],
          isOfficialNote: author.role !== 'citizen',
          createdAt: new Date(complaint.createdAt.getTime() + i * 3600000)
        }
      });
      commentCount++;
    }
    console.log(`✅ [8/9] Created ${commentCount} Comments.`);

    // 9. SEED 100 NOTIFICATIONS
    let notifCount = 0;
    const notificationTypes = ['info', 'success', 'warning', 'escalation', 'status_change'];
    for (let i = 1; i <= 100; i++) {
      const citizen = createdCitizens[i % createdCitizens.length];
      const complaint = createdComplaints[i % createdComplaints.length];
      const type = notificationTypes[i % notificationTypes.length];

      await prisma.notification.create({
        data: {
          recipientId: citizen.id,
          complaintId: complaint.id,
          title: `Update on Ticket #${complaint.ticketId}`,
          message: `Ticket #${complaint.ticketId} status updated to ${complaint.status}.`,
          type,
          isRead: i % 3 === 0,
          createdAt: new Date(complaint.createdAt.getTime() + i * 1800000)
        }
      });
      notifCount++;
    }
    console.log(`✅ [9/9] Created ${notifCount} Notifications.`);

    console.log(`\n======================================================`);
    console.log(`🎉 MYSQL PRISMA SEEDING COMPLETED (STREAMLINED TARGETS)!`);
    console.log(`Summary:`);
    console.log(`- 10 Tamil Nadu Departments (GCCMC, TWAD, TANGEDCO, PWD, TNPCB...)`);
    console.log(`- 2 Admins, 10 Officers, 20 Citizens`);
    console.log(`- 30 Complaints across 12 Categories & 12 Coimbatore Wards`);
    console.log(`- 5 Duplicate Clusters (5 Linked Pairs)`);
    console.log(`- 300 AI Agent Logs`);
    console.log(`- 80 Comments & 100 Notifications`);
    console.log(`======================================================\n`);

    await prisma.$disconnect();
  } catch (err) {
    console.error('❌ [MySQL Seeder Error]:', err.message);
    await prisma.$disconnect();
  }
}

if (process.argv[1].endsWith('seed.js')) {
  seedMySQLDatabase();
}

export const MOCK_DEPARTMENTS = [
  {
    _id: 'dept_pwd',
    name: 'Highways & Public Works Department (PWD)',
    code: 'PWD',
    description: 'Road infrastructure, pothole repairs, bridges & footpaths in Coimbatore.',
    categories: ['Potholes', 'Road Damage', 'Damaged Footpath', 'Bridge Repairs'],
    contactEmail: 'contact@pwd.tn.gov.in',
    contactPhone: '+91-422-CIVIC-001',
    SLAHours: 24,
    activeTicketCount: 14,
    icon: 'Construction'
  },
  {
    _id: 'dept_gccmc',
    name: 'Greater Coimbatore Municipal Corporation (GCCMC)',
    code: 'GCCMC',
    description: 'Solid waste management, garbage clearance, and urban sanitation.',
    categories: ['Garbage Overflow', 'Illegal Dumping', 'Unswept Streets', 'Debris'],
    contactEmail: 'contact@gccmc.tn.gov.in',
    contactPhone: '+91-422-CIVIC-002',
    SLAHours: 36,
    activeTicketCount: 22,
    icon: 'Trash2'
  },
  {
    _id: 'dept_twad',
    name: 'Tamil Nadu Water Supply & Drainage Board (TWAD)',
    code: 'TWAD',
    description: 'Water pipeline maintenance, drinking water supply, and drainage.',
    categories: ['Water Leakage', 'No Water Supply', 'Pipe Burst'],
    contactEmail: 'contact@twad.tn.gov.in',
    contactPhone: '+91-422-CIVIC-003',
    SLAHours: 12,
    activeTicketCount: 9,
    icon: 'Droplets'
  },
  {
    _id: 'dept_tangedco',
    name: 'Tamil Nadu Electricity Board (TANGEDCO)',
    code: 'TANGEDCO',
    description: 'Power supply, streetlights, overhead lines & transformer safety.',
    categories: ['Broken Streetlight', 'Exposed Wires', 'Transformer Hazard', 'Power Line Down'],
    contactEmail: 'contact@tangedco.tn.gov.in',
    contactPhone: '+91-422-CIVIC-004',
    SLAHours: 12,
    activeTicketCount: 11,
    icon: 'Zap'
  },
  {
    _id: 'dept_traffic',
    name: 'Tamil Nadu Traffic Police',
    code: 'TRAFFIC_POLICE',
    description: 'Traffic signals, parking management & road hazard clearing.',
    categories: ['Traffic Signal Failure', 'Illegal Parking', 'Road Barrier Damage'],
    contactEmail: 'contact@traffic.tn.gov.in',
    contactPhone: '+91-422-CIVIC-005',
    SLAHours: 6,
    activeTicketCount: 5,
    icon: 'ShieldAlert'
  }
];

export const MOCK_USERS = [
  {
    _id: 'user_admin',
    name: 'Coimbatore District Collector & Admin',
    email: 'admin@civicswarm.gov.in',
    role: 'admin',
    ward: 'District Collectorate',
    city: 'Coimbatore'
  },
  {
    _id: 'user_officer_pwd',
    name: 'Inspector Senthil Nathan',
    email: 'officer1@pwd.tn.gov.in',
    role: 'officer',
    department: MOCK_DEPARTMENTS[0],
    ward: 'Coimbatore Central',
    city: 'Coimbatore'
  },
  {
    _id: 'user_citizen_1',
    name: 'Arun Kumar',
    email: 'citizen1@example.com',
    role: 'citizen',
    ward: 'Ward 72 - RS Puram',
    city: 'Coimbatore'
  }
];

export const MOCK_COMPLAINTS = [
  {
    _id: 'comp_1001',
    ticketId: 'CIV-100101',
    title: 'Deep Pothole on Avinashi Road near Hope College',
    description: 'Hazardous deep pothole creating severe traffic congestion on Avinashi Road. Urgent repair requested.',
    category: 'Potholes & Damaged Road',
    severity: 'High',
    priorityScore: 84,
    priorityLevel: 'High',
    status: 'Assigned',
    location: { type: 'Point', coordinates: [77.0035, 11.0284] },
    latitude: 11.0284,
    longitude: 77.0035,
    address: 'Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu 641004',
    ward: 'Ward 38 - Peelamedu',
    zone: 'East Zone',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    citizen: MOCK_USERS[2],
    assignedDepartment: MOCK_DEPARTMENTS[0],
    assignedOfficer: MOCK_USERS[1],
    mediaFiles: [
      {
        url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800',
        name: 'pothole_avinashi.jpg',
        type: 'image'
      }
    ],
    affectedCount: 3,
    isDuplicate: false,
    slaDueDate: new Date(Date.now() + 86400000).toISOString(),
    isEscalated: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    _id: 'comp_1002',
    ticketId: 'CIV-100102',
    title: 'Overflowing Garbage Bin near Gandhipuram Bus Stand',
    description: 'Municipal garbage dump bin overflowing onto pedestrian path on Cross Cut Road.',
    category: 'Garbage Accumulation & Waste',
    severity: 'Medium',
    priorityScore: 62,
    priorityLevel: 'Medium',
    status: 'Reported',
    location: { type: 'Point', coordinates: [76.9658, 11.0168] },
    latitude: 11.0168,
    longitude: 76.9658,
    address: 'Cross Cut Road, Gandhipuram, Coimbatore, Tamil Nadu 641012',
    ward: 'Ward 54 - Gandhipuram',
    zone: 'Central Zone',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    citizen: MOCK_USERS[2],
    assignedDepartment: MOCK_DEPARTMENTS[1],
    mediaFiles: [
      {
        url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&q=80&w=800',
        name: 'garbage_gandhipuram.jpg',
        type: 'image'
      }
    ],
    affectedCount: 1,
    isDuplicate: false,
    slaDueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    isEscalated: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

export const DepartmentConfig = Object.freeze({
  DEFAULT_CONFIDENCE: 0.96,
  DEPARTMENTS: {
    PWD: {
      name: 'Public Works Department (PWD)',
      code: 'PWD',
      categories: ['Road Infrastructure', 'Pothole / Road Damage', 'Bridges & Culverts', 'Sidewalks'],
      keywords: ['pothole', 'road', 'asphalt', 'tar', 'bridge', 'pavement', 'crack', 'collapse'],
      defaultOffice: 'Central PWD Operations Office',
      emergencyQueue: 'Emergency Road Repairs Queue',
      standardQueue: 'Standard Road Maintenance Queue',
    },
    WSSB: {
      name: 'Water Supply & Sewerage Board (WSSB)',
      code: 'WSSB',
      categories: ['Water & Sanitation', 'Water Leakage / Drainage Block', 'Sewage Overflow'],
      keywords: ['water', 'leak', 'pipe', 'burst', 'sewage', 'drain', 'contamination', 'drinking water'],
      defaultOffice: 'Division 4 Water & Sewerage Office',
      emergencyQueue: 'Urgent Water Leakage Queue',
      standardQueue: 'Standard Water Supply Queue',
    },
    ESLD: {
      name: 'Electricity & Street Lighting Dept (ESLD)',
      code: 'ESLD',
      categories: ['Public Lighting', 'Streetlight Outage', 'Electrical Danger'],
      keywords: ['light', 'lamp', 'dark', 'electric', 'power', 'spark', 'transformer', 'wire', 'cable'],
      defaultOffice: 'Municipal Electrical Power Grid Division',
      emergencyQueue: 'Hazardous Electrical Repairs Queue',
      standardQueue: 'Streetlight Replacement Queue',
    },
    SWMD: {
      name: 'Solid Waste Management Dept (SWMD)',
      code: 'SWMD',
      categories: ['Solid Waste Management', 'Garbage Overflow / Waste', 'Illegal Dumping'],
      keywords: ['garbage', 'dump', 'trash', 'waste', 'smell', 'debris', 'bin', 'litter', 'cleanliness'],
      defaultOffice: 'Sanitation & Solid Waste Control Center',
      emergencyQueue: 'Hazardous Waste Clearance Queue',
      standardQueue: 'Routine Sanitation Dispatch Queue',
    },
    TPSB: {
      name: 'Traffic & Public Safety Board',
      code: 'TPSB',
      categories: ['Traffic & Public Safety', 'Traffic Signals', 'Encroachment'],
      keywords: ['traffic', 'signal', 'barrier', 'encroachment', 'hazard', 'safety', 'signboard'],
      defaultOffice: 'Traffic Management Control Room',
      emergencyQueue: 'Emergency Traffic Hazard Queue',
      standardQueue: 'Public Safety Inspection Queue',
    },
  },
});

export default DepartmentConfig;

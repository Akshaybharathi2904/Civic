import { ComplaintRepositoryContract } from './ComplaintRepositoryContract.js';
import { calculateDistanceMeters } from '../../../utils/aiUtils.js';

export class MockComplaintRepository extends ComplaintRepositoryContract {
  constructor() {
    super();
    this.mockDatabase = [
      {
        id: 'CIV-9901',
        ticketId: 'CIV-9901',
        title: 'Deep Hazardous Pothole on DB Road',
        category: 'Road Infrastructure',
        issueType: 'Pothole / Road Damage',
        aiSummary: 'Deep pothole causing vehicle damage near junction',
        keywords: ['pothole', 'db road', 'hazard', 'road'],
        latitude: 11.0086,
        longitude: 76.9510,
        createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(), // 4 hours ago
        status: 'Reported',
      },
      {
        id: 'CIV-8842',
        ticketId: 'CIV-8842',
        title: 'Water Main Burst near Cross Cut Road',
        category: 'Water & Sanitation',
        issueType: 'Water Leakage / Drainage Block',
        aiSummary: 'Clean drinking water leaking heavily on street',
        keywords: ['water', 'leak', 'pipe', 'cross cut'],
        latitude: 11.0180,
        longitude: 76.9610,
        createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(), // 12 hours ago
        status: 'In Progress',
      },
    ];
  }

  async findNearbyActiveComplaints(latitude, longitude, radiusMeters = 500) {
    return this.mockDatabase.filter((item) => {
      const dist = calculateDistanceMeters(latitude, longitude, item.latitude, item.longitude);
      return dist <= radiusMeters;
    });
  }
}

export default MockComplaintRepository;

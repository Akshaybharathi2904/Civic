import { ComplaintQueueRepositoryContract } from './ComplaintQueueRepositoryContract.js';
import { QueuedComplaint } from '../models/QueuedComplaint.js';
import { QueueStatsDTO } from '../dtos/QueueStatsDTO.js';
import { QueueStatusEnum } from '../models/QueueStatusEnum.js';

export class MockComplaintQueueRepository extends ComplaintQueueRepositoryContract {
  constructor() {
    super();
    this.queue = new Map();
    this.seedMockQueue();
  }

  seedMockQueue() {
    const defaultItems = [
      new QueuedComplaint({
        complaintId: 'comp_seed_01',
        ticketId: 'CIV-1001',
        title: 'Deep Hazardous Pothole on DB Road',
        category: 'Road Infrastructure',
        issueType: 'Pothole / Surface Damage',
        priority: { level: 'Critical', score: 92, recommendedSLA: 6, escalationFlag: true, reason: 'High traffic risk' },
        recommendedDepartment: { departmentName: 'Public Works Department (PWD)', officeName: 'Central PWD Office', queueName: 'Emergency Repairs' },
        location: { ward: 'Ward 72 - RS Puram', zone: 'Central Zone' },
        queueStatus: QueueStatusEnum.NEW,
      }),
      new QueuedComplaint({
        complaintId: 'comp_seed_02',
        ticketId: 'CIV-1002',
        title: 'Water Main Pipe Leak near Junction',
        category: 'Water & Sanitation',
        issueType: 'Water Leakage',
        priority: { level: 'High', score: 78, recommendedSLA: 24, escalationFlag: false },
        recommendedDepartment: { departmentName: 'Water Supply & Sewerage Board (WSSB)', officeName: 'Division 4 Water Office', queueName: 'Urgent Water Queue' },
        location: { ward: 'Ward 45 - Gandhipuram', zone: 'North Zone' },
        queueStatus: QueueStatusEnum.UNDER_REVIEW,
      }),
      new QueuedComplaint({
        complaintId: 'comp_seed_03',
        ticketId: 'CIV-1003',
        title: 'Streetlight Outage on Cross Cut Road',
        category: 'Public Lighting',
        issueType: 'Streetlight Outage',
        priority: { level: 'Medium', score: 55, recommendedSLA: 48, escalationFlag: false },
        recommendedDepartment: { departmentName: 'Electricity & Street Lighting Dept (ESLD)', officeName: 'Power Grid Office', queueName: 'Standard Repairs' },
        location: { ward: 'Ward 72 - RS Puram', zone: 'Central Zone' },
        queueStatus: QueueStatusEnum.READY_FOR_ASSIGNMENT,
      }),
    ];

    defaultItems.forEach(item => this.queue.set(item.complaintId, item));
  }

  async save(queuedComplaint) {
    this.queue.set(queuedComplaint.complaintId, queuedComplaint);
    return queuedComplaint;
  }

  async findById(complaintId) {
    return this.queue.get(complaintId) || null;
  }

  async queryQueue(filterDTO) {
    let items = Array.from(this.queue.values());

    // 1. Department Filter
    if (filterDTO.department) {
      items = items.filter(i =>
        i.recommendedDepartment.departmentName.toLowerCase().includes(filterDTO.department.toLowerCase()) ||
        i.category.toLowerCase().includes(filterDTO.department.toLowerCase())
      );
    }

    // 2. Priority Filter
    if (filterDTO.priority) {
      items = items.filter(i => i.priority.level.toLowerCase() === filterDTO.priority.toLowerCase());
    }

    // 3. Zone & Ward Filter
    if (filterDTO.zone) {
      items = items.filter(i => i.location.zone.toLowerCase().includes(filterDTO.zone.toLowerCase()));
    }
    if (filterDTO.ward) {
      items = items.filter(i => i.location.ward.toLowerCase().includes(filterDTO.ward.toLowerCase()));
    }

    // 4. Queue Status Filter
    if (filterDTO.queueStatus) {
      items = items.filter(i => i.queueStatus.toLowerCase() === filterDTO.queueStatus.toLowerCase());
    }

    // 5. Keyword Search
    if (filterDTO.search) {
      const q = filterDTO.search;
      items = items.filter(i =>
        i.complaintId.toLowerCase().includes(q) ||
        i.ticketId.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q) ||
        i.aiSummary.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      );
    }

    // 6. Sorting
    items.sort((a, b) => {
      let valA, valB;
      if (filterDTO.sortBy === 'submissionTimestamp') {
        valA = new Date(a.submissionTimestamp).getTime();
        valB = new Date(b.submissionTimestamp).getTime();
      } else if (filterDTO.sortBy === 'aiConfidence') {
        valA = a.aiConfidence;
        valB = b.aiConfidence;
      } else if (filterDTO.sortBy === 'departmentName') {
        valA = a.recommendedDepartment.departmentName;
        valB = b.recommendedDepartment.departmentName;
      } else {
        // Default: priorityScore
        valA = a.priority.score;
        valB = b.priority.score;
      }

      if (valA < valB) return filterDTO.sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return filterDTO.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // 7. Pagination
    const total = items.length;
    const startIndex = (filterDTO.page - 1) * filterDTO.limit;
    const paginatedItems = items.slice(startIndex, startIndex + filterDTO.limit);

    return {
      items: paginatedItems,
      total,
      page: filterDTO.page,
      limit: filterDTO.limit,
      totalPages: Math.ceil(total / filterDTO.limit),
    };
  }

  async getStatistics() {
    const items = Array.from(this.queue.values());
    const totalCount = items.length;
    const byPriority = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    const byStatus = { NEW: 0, UNDER_REVIEW: 0, READY_FOR_ASSIGNMENT: 0, ASSIGNED: 0, REJECTED: 0, CLOSED: 0 };
    const byDepartment = {};
    let escalationCount = 0;

    items.forEach(item => {
      const p = item.priority.level || 'Medium';
      byPriority[p] = (byPriority[p] || 0) + 1;

      const s = item.queueStatus || 'NEW';
      byStatus[s] = (byStatus[s] || 0) + 1;

      const d = item.recommendedDepartment.departmentName || 'General';
      byDepartment[d] = (byDepartment[d] || 0) + 1;

      if (item.priority.escalationFlag) {
        escalationCount++;
      }
    });

    return new QueueStatsDTO({ totalCount, byPriority, byStatus, byDepartment, escalationCount });
  }
}

export default MockComplaintQueueRepository;

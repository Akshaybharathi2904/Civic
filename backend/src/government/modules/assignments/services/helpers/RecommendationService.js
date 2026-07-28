import { WorkloadCalculator } from './WorkloadCalculator.js';
import { OfficerRecommendationDTO } from '../../dtos/AssignmentDTOs.js';

export class RecommendationService {
  static rankOfficers(officers = [], targetDepartment = 'PWD', ward = '', zone = '') {
    const recommendations = officers.map((officer) => {
      const deptScore = (officer.departmentId === targetDepartment) ? 1.0 : 0.5;
      const regionScore = (ward && officer.officeId && officer.officeId.includes('central')) ? 0.95 : 0.70;
      const workloadScore = WorkloadCalculator.calculateWorkloadScore(officer.activeCases || 0);

      const compositeScore = (deptScore * 0.50) + (regionScore * 0.30) + (workloadScore * 0.20);
      const capacityRatio = WorkloadCalculator.calculateCapacityRatio(officer.activeCases || 0);

      const matchReason = `Matched ${officer.departmentId} department (${(deptScore * 100).toFixed(0)}%), region proximity (${(regionScore * 100).toFixed(0)}%), and workload capacity (${(workloadScore * 100).toFixed(0)}%).`;

      return new OfficerRecommendationDTO({
        officerId: officer.id,
        officerName: officer.name,
        badgeNumber: officer.badgeNumber,
        departmentId: officer.departmentId,
        matchScore: compositeScore,
        activeCases: officer.activeCases || 0,
        capacityRatio,
        matchReason,
      });
    });

    recommendations.sort((a, b) => b.matchScore - a.matchScore);
    return recommendations;
  }
}

export default RecommendationService;

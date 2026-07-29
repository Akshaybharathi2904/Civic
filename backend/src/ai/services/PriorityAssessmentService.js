export class PriorityAssessmentService {
  async process(understandingData, visionData, communityData) {
    let score = 50;

    const severity = understandingData?.severity || 'Medium';
    if (severity === 'Critical') score += 35;
    else if (severity === 'High') score += 25;
    else if (severity === 'Medium') score += 10;

    if (visionData?.detectedObjects?.some(obj => obj.toLowerCase().includes('hazard') || obj.toLowerCase().includes('pothole'))) {
      score += 15;
    }

    if ((communityData?.positiveVotes || 0) > 3) {
      score += 10;
    }

    const priorityScore = Math.min(100, Math.max(10, score));

    let priorityLevel = 'Low';
    if (priorityScore >= 80) priorityLevel = 'Critical';
    else if (priorityScore >= 65) priorityLevel = 'High';
    else if (priorityScore >= 40) priorityLevel = 'Medium';

    return {
      priorityScore,
      priorityLevel
    };
  }
}

export default PriorityAssessmentService;

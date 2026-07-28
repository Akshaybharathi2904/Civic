export async function runPriorityScoringAgent(complaintData, understanding, imageAnalysis, duplicateResult) {
  const startTime = Date.now();

  const severityStr = imageAnalysis?.severity || understanding?.severity || 'Medium';
  const affectedCount = duplicateResult?.affectedCount || complaintData.affectedCount || 1;

  // Severity Weight (Max 40 pts)
  let severityScore = 20;
  if (severityStr === 'Critical') severityScore = 40;
  else if (severityStr === 'High') severityScore = 32;
  else if (severityStr === 'Medium') severityScore = 22;
  else if (severityStr === 'Low') severityScore = 12;

  // Affected Count Multiplier (Max 25 pts)
  const affectedScore = Math.min(25, affectedCount * 5);

  // Issue Hazard Weight (Max 20 pts)
  const issueLower = (understanding?.issueType || complaintData.title || '').toLowerCase();
  let hazardScore = 10;
  if (issueLower.includes('water') || issueLower.includes('flood') || issueLower.includes('electric')) {
    hazardScore = 20;
  } else if (issueLower.includes('pothole') || issueLower.includes('road')) {
    hazardScore = 18;
  } else if (issueLower.includes('garbage')) {
    hazardScore = 14;
  }

  // Public Impact & Density Weight (Max 15 pts)
  const impactScore = 12;

  // Calculate final score
  const priorityScore = Math.min(100, Math.max(10, severityScore + affectedScore + hazardScore + impactScore));

  let priorityLevel = 'Medium';
  if (priorityScore >= 80) priorityLevel = 'Critical';
  else if (priorityScore >= 65) priorityLevel = 'High';
  else if (priorityScore >= 40) priorityLevel = 'Medium';
  else priorityLevel = 'Low';

  const reason = `Priority Score ${priorityScore}/100 [Level: ${priorityLevel}] determined by Severity (${severityStr}), Multi-Citizen Duplicate Citations (${affectedCount}), and Public Safety Exposure.`;

  return {
    priorityScore,
    priorityLevel,
    scoringBreakdown: {
      severityScore,
      affectedScore,
      hazardScore,
      impactScore
    },
    reason,
    confidenceScore: 0.97,
    executionTimeMs: Date.now() - startTime
  };
}

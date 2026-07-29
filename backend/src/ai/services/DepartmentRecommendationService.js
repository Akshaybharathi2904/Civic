export class DepartmentRecommendationService {
  async process(understandingData, locationData) {
    const text = `${understandingData?.issueType} ${understandingData?.summary} ${understandingData?.category}`.toLowerCase();

    let department = 'PWD (Public Works Department)';
    let reasoning = 'Road hazards, potholes, and infrastructure maintenance fall under PWD jurisdiction.';
    let confidence = 0.94;

    if (text.includes('water') || text.includes('drain') || text.includes('sewage') || text.includes('pipe')) {
      department = 'BWSSB / Water Supply Board';
      reasoning = 'Water leakage, pipeline bursts, and drainage clogging belong to Water Supply Board.';
      confidence = 0.96;
    } else if (text.includes('garbage') || text.includes('trash') || text.includes('sanitation') || text.includes('dump')) {
      department = 'Public Health & Sanitation Department';
      reasoning = 'Solid waste management and illegal dumping clearance fall under Sanitation.';
      confidence = 0.95;
    } else if (text.includes('light') || text.includes('electric') || text.includes('transformer') || text.includes('wire')) {
      department = 'BESCOM / Electricity Board';
      reasoning = 'Electrical grid maintenance and streetlighting belong to Electricity Board.';
      confidence = 0.97;
    }

    return {
      department,
      confidence,
      reasoning: `${reasoning} Assigned to jurisdiction ${locationData?.ward || 'Ward 72'}.`
    };
  }
}

export default DepartmentRecommendationService;

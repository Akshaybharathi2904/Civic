export class DepartmentTool {
  static async execute({ category, issueType, ward }) {
    const text = `${category} ${issueType}`.toLowerCase();

    let department = 'PWD (Public Works Department)';
    let office = 'District Infrastructure Office - West Wing';
    let reasoning = 'Road damage, asphalt hazards, and civil structural issues fall under PWD jurisdiction.';

    if (text.includes('water') || text.includes('drain') || text.includes('pipe') || text.includes('sewage')) {
      department = 'BWSSB / Water Supply Board';
      office = 'Water Maintenance & Drainage Division';
      reasoning = 'Water leakage, pipeline bursts, and drainage clogging fall under Water Supply Board.';
    } else if (text.includes('garbage') || text.includes('sanitation') || text.includes('waste') || text.includes('dump')) {
      department = 'Public Health & Sanitation Department';
      office = 'Municipal Solid Waste Management Hub';
      reasoning = 'Solid waste management and illegal dumping clearance fall under Sanitation.';
    } else if (text.includes('light') || text.includes('electric') || text.includes('power') || text.includes('wire')) {
      department = 'BESCOM / Electricity Board';
      office = 'Electrical Operations & Grid Safety Division';
      reasoning = 'Streetlighting, transformer faults, and power grid hazards fall under Electricity Board.';
    }

    return {
      department,
      office,
      reasoning: `${reasoning} Assigned to jurisdiction ${ward || 'Ward 72'}.`,
      confidence: 0.95,
    };
  }
}

export default DepartmentTool;

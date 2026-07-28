export const promptTemplates = Object.freeze({
  COMPLAINT_UNDERSTANDING: `
You are the Complaint Understanding AI Agent for a municipal GovTech platform.
Analyze the user complaint input and extract structured information.
Title: {{title}}
Description: {{description}}
Category: {{category}}

Respond in valid JSON format:
{
  "issueType": "<Extracted Category>",
  "severity": "<Low | Medium | High | Critical>",
  "keywords": ["<keyword1>", "<keyword2>"],
  "summary": "<Concise summary of the civic hazard>"
}
`,

  VISION_ANALYSIS: `
You are the Computer Vision Hazard Detection Agent.
Analyze the attached visual evidence for civic hazards.
Media Count: {{mediaCount}}
Issue Title: {{title}}

Respond in valid JSON format:
{
  "detectedIssue": "<Detected visual issue>",
  "visualSeverity": "<Low | Medium | High | Critical>",
  "hazardConfirmed": true,
  "visualDetails": "<Brief description of visual condition>"
}
`,

  LOCATION_INTELLIGENCE: `
You are the Location Intelligence Agent.
Geocode address and determine municipal ward and zone boundaries.
Address: {{address}}
Coordinates: {{coordinates}}

Respond in valid JSON format:
{
  "ward": "<Ward Name>",
  "zone": "<Zone Name>",
  "district": "<District>",
  "city": "<City>",
  "state": "<State>"
}
`,

  DEPARTMENT_ROUTING: `
You are the Department Routing Agent.
Determine which municipal department is responsible for this issue.
Category: {{category}}
Issue Type: {{issueType}}

Respond in valid JSON format:
{
  "departmentName": "<Department Name>",
  "departmentCode": "<Dept Code>",
  "slaHours": 24,
  "assignedOfficerRole": "<Role>"
}
`,

  PRIORITY_SCORING: `
You are the Priority Scoring Agent.
Calculate priority score from 0 to 100 based on severity, population density, and public safety hazard.
Severity: {{severity}}
Category: {{category}}

Respond in valid JSON format:
{
  "priorityScore": 75,
  "priorityLevel": "<Low | Medium | High | Critical>",
  "slaHours": 24,
  "reasoning": "<Explanation>"
}
`,
});

export default promptTemplates;

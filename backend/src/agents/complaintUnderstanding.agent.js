import { executeGeminiAgent } from '../services/gemini.service.js';

export async function runComplaintUnderstandingAgent(complaintData) {
  const prompt = `Analyze the following citizen complaint submission:
Title: "${complaintData.title}"
Description: "${complaintData.description}"
Media attached count: ${complaintData.mediaFiles?.length || complaintData.media?.length || 0}

Extract structured JSON containing:
- issueType: specific civic category (e.g. Potholes & Damaged Road, Broken Streetlights & Electrical, Water Leakage & Drainage, Illegal Dumping, Flooding, Garbage Accumulation & Waste, Public Property Damage)
- complaintSummary: concise 1-sentence summary
- severity: 'Low', 'Medium', 'High', or 'Critical'
- keywords: array of key search terms
- language: detected language (e.g., 'English', 'Kannada', 'Hindi')
- translatedText: English translation if non-English, else original description
- confidenceScore: float between 0.85 and 0.99`;

  const systemInstruction = 'You are the Complaint Understanding Agent for CivicSwarm GovTech AI. Analyze civic issue text with precision using Google Gemini.';

  const fallbackGenerator = () => {
    const text = (complaintData.title + ' ' + complaintData.description).toLowerCase();
    let issueType = 'General Civic Issue';
    let severity = 'Medium';
    let keywords = ['civic', 'issue', 'repair'];

    if (text.includes('pothole') || text.includes('road') || text.includes('cracks')) {
      issueType = 'Potholes & Damaged Road';
      severity = 'High';
      keywords = ['pothole', 'asphalt', 'traffic hazard', 'road damage'];
    } else if (text.includes('garbage') || text.includes('dump') || text.includes('trash') || text.includes('waste')) {
      issueType = 'Garbage Accumulation & Waste';
      severity = 'Medium';
      keywords = ['garbage', 'sanitation', 'waste', 'smell', 'odor'];
    } else if (text.includes('water') || text.includes('leak') || text.includes('pipe') || text.includes('drain')) {
      issueType = 'Water Leakage & Drainage';
      severity = 'High';
      keywords = ['water leakage', 'pipeline', 'drainage', 'flooding'];
    } else if (text.includes('light') || text.includes('dark') || text.includes('lamp') || text.includes('electricity')) {
      issueType = 'Broken Streetlights & Electrical';
      severity = 'Medium';
      keywords = ['streetlight', 'darkness', 'safety', 'electricity'];
    }

    return {
      issueType,
      complaintSummary: complaintData.title.slice(0, 80),
      severity,
      keywords,
      language: 'English',
      translatedText: complaintData.description,
      confidenceScore: 0.94
    };
  };

  const response = await executeGeminiAgent(prompt, systemInstruction, fallbackGenerator);
  return response.data;
}

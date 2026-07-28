export class UnderstandingPromptBuilder {
  static buildPrompt({ title, description, category, images = [] }) {
    return {
      system: `You are the Complaint Understanding AI Agent for a municipal GovTech platform.
Extract structured civic complaint information from user submission. Respond strictly in valid JSON format.`,
      user: `Title: ${title}
Description: ${description || 'N/A'}
User Category: ${category || 'Unspecified'}
Attached Media Count: ${images.length}`,
    };
  }
}

export default UnderstandingPromptBuilder;

import { promptTemplates } from './promptTemplates.js';

export class PromptBuilder {
  static buildPrompt(templateKey, variables = {}) {
    const template = promptTemplates[templateKey] || '';
    let compiled = template;

    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      const val = variables[key] !== undefined && variables[key] !== null ? String(variables[key]) : '';
      compiled = compiled.replace(regex, val);
    });

    return compiled.trim();
  }
}

export default PromptBuilder;

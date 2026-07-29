import { executeGeminiAgent } from '../../../services/gemini.service.js';

export class ADKAgent {
  constructor(name, stepNumber, contextKey) {
    if (new.target === ADKAgent) {
      throw new TypeError('Cannot instantiate abstract ADKAgent class directly.');
    }
    this.name = name;
    this.stepNumber = stepNumber;
    this.contextKey = contextKey; // Key in WorkflowContext e.g. 'complaintAnalysis'
  }

  async delay(ms = 350) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Run agent logic - implemented by concrete ADK Agent subclass
   */
  async process(context) {
    throw new Error(`Subclass ${this.constructor.name} must implement process(context)`);
  }

  /**
   * Execute Google ADK Agent:
   * 1. Updates WorkflowContext status
   * 2. Runs process(context) with Gemini 2.5 Flash / Tools
   * 3. Mutates only context[this.contextKey]
   * 4. Logs execution history entry with timestamp
   * 5. Returns updated WorkflowContext
   */
  async execute(context) {
    const startTime = Date.now();

    try {
      await this.delay(200 + Math.floor(Math.random() * 300));

      const structuredOutput = await this.process(context);
      const durationMs = Date.now() - startTime;

      // Update ONLY designated context section
      if (this.contextKey) {
        context[this.contextKey] = structuredOutput;
      }

      // Log execution timestamp history
      context.logExecutionEvent(this.name, 'COMPLETED', durationMs, structuredOutput);

      return context;
    } catch (err) {
      const durationMs = Date.now() - startTime;
      context.logExecutionEvent(this.name, 'FAILED', durationMs, { error: err.message });
      throw err;
    }
  }

  /**
   * Helper to call Gemini 2.5 Flash via @google/genai SDK
   */
  async callGemini(prompt, systemInstruction, fallbackFn) {
    const response = await executeGeminiAgent(prompt, systemInstruction, fallbackFn);
    return response.data;
  }
}

export default ADKAgent;

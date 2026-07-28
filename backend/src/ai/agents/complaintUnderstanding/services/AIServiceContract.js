export class AIServiceContract {
  /**
   * Abstract method: Process complaint text and images to generate structured LLM JSON output
   */
  async processComplaintAnalysis(prompt, options = {}) {
    throw new Error('AIServiceContract.processComplaintAnalysis must be implemented by concrete AI services.');
  }
}

export default AIServiceContract;

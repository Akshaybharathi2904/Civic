export class LLMProviderContract {
  async generateCompletion(prompt, options = {}) {
    throw new Error('LLMProviderContract.generateCompletion must be implemented by concrete providers.');
  }

  async generateStructuredOutput(prompt, schema, options = {}) {
    throw new Error('LLMProviderContract.generateStructuredOutput must be implemented by concrete providers.');
  }
}

export default LLMProviderContract;

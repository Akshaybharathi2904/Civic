import { BaseAgent } from '../BaseAgent.js';
import { ComplaintUnderstandingInputDTO } from './models/ComplaintUnderstandingInputDTO.js';
import { ComplaintUnderstandingResult } from './models/ComplaintUnderstandingResult.js';
import { MockAIService } from './services/MockAIService.js';
import { UnderstandingPromptBuilder } from './utils/UnderstandingPromptBuilder.js';
import { UnderstandingResponseParser } from './utils/UnderstandingResponseParser.js';
import { ComplaintUnderstandingError } from './errors/ComplaintUnderstandingError.js';

export class ComplaintUnderstandingAgent extends BaseAgent {
  constructor(aiService = new MockAIService()) {
    super('Complaint Understanding Agent', 1);
    this.aiService = aiService;
  }

  /**
   * Process unstructured complaint input into structured result
   */
  async processComplaint(inputData) {
    try {
      const inputDTO = new ComplaintUnderstandingInputDTO(inputData);
      const prompt = UnderstandingPromptBuilder.buildPrompt(inputDTO);

      const rawResult = await this.aiService.processComplaintAnalysis({
        title: inputDTO.title,
        description: inputDTO.description,
        category: inputDTO.category,
        images: inputDTO.images,
        prompt,
      });

      const parsedDTO = UnderstandingResponseParser.parseResponse(rawResult);
      const domainResult = new ComplaintUnderstandingResult(parsedDTO);

      return domainResult.toDomainPayload();
    } catch (err) {
      throw new ComplaintUnderstandingError(`Failed to process complaint understanding: ${err.message}`, err, { inputData });
    }
  }

  async runInternal(context) {
    const inputData = {
      title: context.title || 'Civic Hazard',
      description: context.description || '',
      category: context.category || null,
      images: context.mediaFiles || [],
    };

    const structuredResult = await this.processComplaint(inputData);

    return {
      status: 'success',
      confidence: structuredResult.confidenceScore,
      reasoning: `Extracted Category "${structuredResult.issueCategory}", Issue Type "${structuredResult.issueType}", Severity "${structuredResult.severity}".`,
      output: structuredResult,
      tokenUsage: { promptTokens: 120, completionTokens: 45, totalTokens: 165 },
    };
  }
}

export default ComplaintUnderstandingAgent;

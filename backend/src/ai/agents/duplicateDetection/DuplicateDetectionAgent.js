import { BaseAgent } from '../BaseAgent.js';
import { DuplicateDetectionInputDTO } from './models/DuplicateDetectionInputDTO.js';
import { DuplicateDetectionResult } from './models/DuplicateDetectionResult.js';
import { MockComplaintRepository } from './services/MockComplaintRepository.js';
import { MockSimilarityEngine } from './services/MockSimilarityEngine.js';
import { DuplicateConfig } from './config/duplicate.config.js';
import { DuplicateDetectionError } from './errors/DuplicateDetectionError.js';

export class DuplicateDetectionAgent extends BaseAgent {
  constructor(
    repository = new MockComplaintRepository(),
    similarityEngine = new MockSimilarityEngine()
  ) {
    super('Duplicate Detection Agent', 4);
    this.repository = repository;
    this.similarityEngine = similarityEngine;
  }

  /**
   * Detect duplicate complaint using weighted multi-factor similarity matrix
   */
  async detectDuplicate(inputData) {
    try {
      const inputDTO = new DuplicateDetectionInputDTO(inputData);

      // Search spatial candidates
      const candidates = await this.repository.findNearbyActiveComplaints(
        inputDTO.latitude,
        inputDTO.longitude,
        DuplicateConfig.MAX_SPATIAL_RADIUS_METERS
      );

      let bestMatch = null;
      let highestScore = 0.0;

      for (const candidate of candidates) {
        // Skip comparing against self if complaintId is present
        if (inputDTO.complaintId && candidate.id === inputDTO.complaintId) {
          continue;
        }

        const simResult = await this.similarityEngine.calculateSimilarity(inputDTO, candidate);
        if (simResult.totalScore > highestScore) {
          highestScore = simResult.totalScore;
          bestMatch = {
            candidateId: candidate.id || candidate.ticketId,
            similarityScore: simResult.totalScore,
            matchingFactors: simResult.factors,
            distMeters: simResult.distMeters,
          };
        }
      }

      const duplicateFound = Boolean(bestMatch && highestScore >= DuplicateConfig.SIMILARITY_THRESHOLD);

      const domainResult = new DuplicateDetectionResult({
        duplicateFound,
        existingComplaintId: duplicateFound ? bestMatch.candidateId : null,
        similarityScore: duplicateFound ? highestScore : (bestMatch ? highestScore : 0.0),
        matchingFactors: bestMatch ? bestMatch.matchingFactors : {
          geoProximity: 0,
          summarySimilarity: 0,
          categoryMatch: 0,
          keywordOverlap: 0,
          timeProximity: 0,
        },
        recommendation: duplicateFound
          ? `MERGE_DUPLICATE: Candidate complaint #${bestMatch.candidateId} matches (${Math.round(highestScore * 100)}% similarity, ${bestMatch.distMeters}m away). Support existing complaint without creating a new ticket.`
          : 'CREATE_NEW_ISSUE: No duplicate complaint detected within spatial and similarity threshold.',
      });

      return domainResult.toDomainPayload();
    } catch (err) {
      throw new DuplicateDetectionError(`Failed to process duplicate detection: ${err.message}`, err, { inputData });
    }
  }

  async runInternal(context) {
    const inputData = {
      complaintId: context.complaintId || context.ticketId,
      category: context.category || context.understanding?.output?.issueType || 'General Civic Issue',
      issueType: context.understanding?.output?.issueType || 'General Civic Issue',
      aiSummary: context.understanding?.output?.aiSummary || context.title || '',
      keywords: context.understanding?.output?.keywords || [],
      latitude: context.coordinates ? context.coordinates[1] : 11.0084,
      longitude: context.coordinates ? context.coordinates[0] : 76.9508,
      timestamp: new Date().toISOString(),
    };

    const structuredResult = await this.detectDuplicate(inputData);

    return {
      status: 'success',
      confidence: 0.94,
      reasoning: structuredResult.duplicateFound
        ? `Duplicate complaint detected (${Math.round(structuredResult.similarityScore * 100)}% match). Target Ticket: #${structuredResult.existingComplaintId}.`
        : 'No spatial/textual duplicate complaint detected. Safe to register as new ticket.',
      output: structuredResult,
      tokenUsage: { promptTokens: 110, completionTokens: 40, totalTokens: 150 },
    };
  }
}

export default DuplicateDetectionAgent;

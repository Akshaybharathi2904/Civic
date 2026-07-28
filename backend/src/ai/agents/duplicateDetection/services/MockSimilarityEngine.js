import { SimilarityEngineContract } from './SimilarityEngineContract.js';
import { DuplicateConfig } from '../config/duplicate.config.js';
import { calculateDistanceMeters } from '../../../utils/aiUtils.js';

export class MockSimilarityEngine extends SimilarityEngineContract {
  async calculateSimilarity(inputDTO, candidate) {
    const weights = DuplicateConfig.WEIGHTS;

    // 1. Geographic Proximity Score (0 to 1)
    const distMeters = calculateDistanceMeters(inputDTO.latitude, inputDTO.longitude, candidate.latitude, candidate.longitude);
    const geoScore = Math.max(0, 1 - (distMeters / DuplicateConfig.MAX_SPATIAL_RADIUS_METERS));

    // 2. Summary Text Similarity (Normalized word stems)
    const tokenize = (text = '') =>
      text.toLowerCase()
        .replace(/ai analysis identified|issue classified under|severity level/g, '')
        .split(/[\s,\.\-]+/)
        .map(w => w.replace(/[^a-z0-9]/gi, '').trim())
        .filter(w => w.length > 2);

    const inputTokens = new Set(tokenize(inputDTO.aiSummary || inputDTO.title || ''));
    const candTokens = new Set(tokenize(candidate.aiSummary || candidate.title || ''));

    const intersection = new Set([...inputTokens].filter(x => candTokens.has(x)));
    const union = new Set([...inputTokens, ...candTokens]);
    const summaryScore = union.size > 0 ? Math.max(0.65, (intersection.size / union.size)) : 0.75;

    // 3. Category & Issue Type Match
    const categoryScore = (
      (inputDTO.category && candidate.category && inputDTO.category.toLowerCase() === candidate.category.toLowerCase()) ||
      (inputDTO.issueType && candidate.issueType && inputDTO.issueType.toLowerCase().includes(candidate.issueType.toLowerCase()))
    ) ? 1.0 : 0.4;

    // 4. Keyword Overlap
    const normalizeKw = (list = []) =>
      list.flatMap(k => tokenize(k));

    const inputKw = new Set(normalizeKw(inputDTO.keywords));
    const candKw = new Set(normalizeKw(candidate.keywords));
    const kwIntersect = new Set([...inputKw].filter(x => candKw.has(x)));
    const kwUnion = new Set([...inputKw, ...candKw]);
    const keywordScore = kwUnion.size > 0 ? Math.max(0.60, (kwIntersect.size / kwUnion.size)) : 0.70;

    // 5. Time Proximity Score (Decay over 72h)
    const timeDeltaMs = Math.abs(new Date(inputDTO.timestamp).getTime() - new Date(candidate.createdAt).getTime());
    const hoursDelta = timeDeltaMs / (1000 * 3600);
    const timeScore = Math.max(0, 1 - (hoursDelta / DuplicateConfig.TIME_WINDOW_HOURS));

    // Calculate Total Weighted Similarity Score
    const totalScore = (
      geoScore * weights.geoProximity +
      summaryScore * weights.summarySimilarity +
      categoryScore * weights.categoryMatch +
      keywordScore * weights.keywordOverlap +
      timeScore * weights.timeProximity
    );

    const roundedScore = Number(totalScore.toFixed(2));

    return {
      candidateId: candidate.id || candidate.ticketId,
      distMeters,
      totalScore: roundedScore,
      factors: {
        geoProximity: Number(geoScore.toFixed(2)),
        summarySimilarity: Number(summaryScore.toFixed(2)),
        categoryMatch: Number(categoryScore.toFixed(2)),
        keywordOverlap: Number(keywordScore.toFixed(2)),
        timeProximity: Number(timeScore.toFixed(2)),
      },
    };
  }
}

export default MockSimilarityEngine;

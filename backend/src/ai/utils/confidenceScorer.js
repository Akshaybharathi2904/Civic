export const confidenceScorer = {
  normalizeConfidence(rawScore) {
    if (typeof rawScore !== 'number' || isNaN(rawScore)) return 0.90;
    if (rawScore > 1) rawScore = rawScore / 100;
    return Math.max(0.10, Math.min(0.99, Number(rawScore.toFixed(2))));
  },

  calculateAggregateConfidence(stepConfidences = []) {
    if (!stepConfidences.length) return 0.90;
    const sum = stepConfidences.reduce((acc, val) => acc + this.normalizeConfidence(val), 0);
    return Number((sum / stepConfidences.length).toFixed(2));
  },
};

export default confidenceScorer;

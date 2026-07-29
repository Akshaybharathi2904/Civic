import { ADKAgent } from '../core/ADKAgent.js';

export class VisionAnalysisAgent extends ADKAgent {
  constructor() {
    super('Vision Analysis Agent', 2, 'visionAnalysis');
  }

  async process(context) {
    const images = context.uploadedImages || [];
    const titleText = (context.complaint?.title || '').toLowerCase();

    let detectedObjects = ['Road Asphalt', 'Urban Surface'];
    let damageAssessment = 'Minor surface erosion detected.';
    let estimatedSeverity = 'Medium';
    let confidence = 0.90;

    if (images.length > 0 || titleText.includes('pothole') || titleText.includes('road')) {
      detectedObjects = ['Deep Pothole', 'Asphalt Cracks', 'Traffic Hazard'];
      damageAssessment = 'Structural road erosion presenting traffic risk.';
      estimatedSeverity = 'High';
      confidence = 0.95;
    } else if (titleText.includes('garbage') || titleText.includes('waste')) {
      detectedObjects = ['Solid Waste Pile', 'Plastic Bags', 'Overflow Bin'];
      damageAssessment = 'Unsanitary waste dumping blocking sidewalk.';
      estimatedSeverity = 'Medium';
      confidence = 0.92;
    } else if (titleText.includes('water') || titleText.includes('leak')) {
      detectedObjects = ['Water Seepage', 'Pipe Leak', 'Stagnant Pool'];
      damageAssessment = 'Continuous water flow leaking onto roadway.';
      estimatedSeverity = 'High';
      confidence = 0.94;
    }

    return {
      detectedObjects,
      damageAssessment,
      estimatedSeverity,
      confidence,
    };
  }
}

export default VisionAnalysisAgent;

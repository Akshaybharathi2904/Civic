import BaseAgent from './BaseAgent.js';
import VisionAnalysisService from '../services/VisionAnalysisService.js';

export class VisionAnalysisAgent extends BaseAgent {
  constructor() {
    super('Computer Vision Agent', 2, 'vision');
    this.service = new VisionAnalysisService();
  }

  async runInternal(context) {
    return await this.service.process(context.uploadedImages, context.complaint);
  }
}

export default VisionAnalysisAgent;

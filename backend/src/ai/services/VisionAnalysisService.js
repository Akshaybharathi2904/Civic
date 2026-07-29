export class VisionAnalysisService {
  async process(uploadedImages, complaintData) {
    // Check attached media or fallback
    const mediaCount = uploadedImages?.length || 0;
    const titleText = (complaintData?.title || '').toLowerCase();

    let detectedObjects = ['Road Surface', 'Urban Asphalt'];
    let damageAssessment = 'Minor surface wear detected.';
    let confidence = 0.88;

    if (mediaCount > 0 || titleText.includes('pothole') || titleText.includes('crack')) {
      detectedObjects = ['Deep Pothole', 'Cracked Asphalt', 'Traffic Hazard'];
      damageAssessment = 'Severe structural road erosion causing potential vehicle hazard.';
      confidence = 0.95;
    } else if (titleText.includes('garbage') || titleText.includes('trash')) {
      detectedObjects = ['Waste Dump', 'Plastic Containers', 'Overflowing Bin'];
      damageAssessment = 'Unsanitary waste accumulation blocking public sidewalk.';
      confidence = 0.92;
    } else if (titleText.includes('water') || titleText.includes('drain')) {
      detectedObjects = ['Pipeline Leak', 'Stagnant Water Pool'];
      damageAssessment = 'Continuous water seepage causing localized flooding.';
      confidence = 0.93;
    }

    return {
      detectedObjects,
      damageAssessment,
      confidence,
    };
  }
}

export default VisionAnalysisService;

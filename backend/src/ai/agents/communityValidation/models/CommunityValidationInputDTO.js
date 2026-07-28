export class CommunityValidationInputDTO {
  constructor({
    complaintId,
    complaintLocation,
    duplicateDetectionResult = null,
    existingComplaintId = null,
  }) {
    if (!complaintId || typeof complaintId !== 'string') {
      throw new Error('CommunityValidationInputDTO requires a non-empty complaintId string.');
    }
    if (!complaintLocation || typeof complaintLocation !== 'object') {
      throw new Error('CommunityValidationInputDTO requires a complaintLocation object.');
    }
    if (complaintLocation.latitude === undefined || complaintLocation.longitude === undefined) {
      throw new Error('CommunityValidationInputDTO complaintLocation requires latitude and longitude.');
    }

    this.complaintId = complaintId;
    this.complaintLocation = {
      latitude: Number(complaintLocation.latitude),
      longitude: Number(complaintLocation.longitude),
      radiusMeters: Number(complaintLocation.radiusMeters) || 1000,
    };
    this.duplicateDetectionResult = duplicateDetectionResult;
    this.existingComplaintId = existingComplaintId;
  }
}

export default CommunityValidationInputDTO;

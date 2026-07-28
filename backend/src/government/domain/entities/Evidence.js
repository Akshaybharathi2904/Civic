export class Evidence {
  constructor({
    id = `evd_${Date.now()}`,
    complaintId,
    fileUrl,
    mediaType = 'IMAGE',
    verified = false,
  }) {
    this.id = id;
    this.complaintId = complaintId;
    this.fileUrl = fileUrl;
    this.mediaType = mediaType;
    this.verified = Boolean(verified);
    this.uploadedAt = new Date().toISOString();
  }
}

export default Evidence;

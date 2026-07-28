import { EvidenceTypeEnum } from './EvidenceTypeEnum.js';

export class Evidence {
  constructor({
    id = `ev_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    complaintId,
    officerId,
    type = EvidenceTypeEnum.COMPLETION_PHOTO,
    fileUrl,
    fileSize = 1024500,
    mimeType = 'image/jpeg',
    remarks = '',
    uploadedAt = new Date().toISOString(),
  }) {
    this.id = id;
    this.complaintId = complaintId;
    this.officerId = officerId;
    this.type = type;
    this.fileUrl = fileUrl;
    this.fileSize = fileSize;
    this.mimeType = mimeType;
    this.remarks = remarks;
    this.uploadedAt = uploadedAt;
  }
}

export default Evidence;

export class CreateWorkflowInputDTO {
  constructor({
    complaintId = null,
    title,
    description = '',
    category = null,
    latitude,
    longitude,
    address = null,
    images = [],
    anonymous = false,
  }) {
    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new Error('CreateWorkflowInputDTO requires a non-empty title.');
    }
    if (latitude === undefined || longitude === undefined || isNaN(Number(latitude)) || isNaN(Number(longitude))) {
      throw new Error('CreateWorkflowInputDTO requires numeric latitude and longitude.');
    }

    this.complaintId = complaintId || `comp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.title = title.trim();
    this.description = (description && typeof description === 'string') ? description.trim() : '';
    this.category = category;
    this.latitude = Number(latitude);
    this.longitude = Number(longitude);
    this.address = address;
    this.images = Array.isArray(images) ? images : [];
    this.anonymous = Boolean(anonymous);
  }
}

export default CreateWorkflowInputDTO;

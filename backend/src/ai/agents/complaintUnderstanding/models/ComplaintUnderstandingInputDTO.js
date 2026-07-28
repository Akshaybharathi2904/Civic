export class ComplaintUnderstandingInputDTO {
  constructor({ title, description, category = null, images = [] }) {
    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new Error('ComplaintUnderstandingInputDTO requires a non-empty title string.');
    }
    this.title = title.trim();
    this.description = (description && typeof description === 'string') ? description.trim() : '';
    this.category = category;
    this.images = Array.isArray(images) ? images : [];
  }
}

export default ComplaintUnderstandingInputDTO;

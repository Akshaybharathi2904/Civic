export class InternalNote {
  constructor({
    id = `note_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    complaintId,
    authorId,
    authorName = 'Field Inspector',
    role = 'FIELD_OFFICER',
    text,
    internalOnly = true,
    createdAt = new Date().toISOString(),
  }) {
    this.id = id;
    this.complaintId = complaintId;
    this.authorId = authorId;
    this.authorName = authorName;
    this.role = role;
    this.text = text;
    this.internalOnly = Boolean(internalOnly);
    this.createdAt = createdAt;
  }
}

export default InternalNote;

export class InternalNoteRepositoryContract {
  async save(internalNote) { throw new Error('InternalNoteRepositoryContract.save must be implemented.'); }
  async findByComplaintId(complaintId) { throw new Error('InternalNoteRepositoryContract.findByComplaintId must be implemented.'); }
}

export class MockInternalNoteRepository extends InternalNoteRepositoryContract {
  constructor() {
    super();
    this.notesMap = new Map(); // complaintId -> Array<InternalNote>
  }

  async save(internalNote) {
    const list = this.notesMap.get(internalNote.complaintId) || [];
    list.push(internalNote);
    this.notesMap.set(internalNote.complaintId, list);
    return internalNote;
  }

  async findByComplaintId(complaintId) {
    return this.notesMap.get(complaintId) || [];
  }
}

export default { InternalNoteRepositoryContract, MockInternalNoteRepository };

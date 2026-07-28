import { InternalNote } from '../models/InternalNote.js';
import { AddInternalNoteDTO } from '../dtos/WorkspaceDTOs.js';
import { MockInternalNoteRepository } from '../repositories/MockInternalNoteRepository.js';

export class InternalNotesServiceContract {
  async addNote(complaintId, authorId, authorName, role, text) { throw new Error('InternalNotesServiceContract.addNote must be implemented.'); }
  async getNotesForComplaint(complaintId) { throw new Error('InternalNotesServiceContract.getNotesForComplaint must be implemented.'); }
}

export class InternalNotesService extends InternalNotesServiceContract {
  constructor(repository = new MockInternalNoteRepository()) {
    super();
    this.repository = repository;
  }

  async addNote(complaintId, authorIdOrInput, authorName, role, text) {
    let dto;
    if (typeof authorIdOrInput === 'object') {
      dto = new AddInternalNoteDTO(authorIdOrInput);
    } else {
      dto = new AddInternalNoteDTO({ authorId: authorIdOrInput, authorName, role, text });
    }

    const note = new InternalNote({
      complaintId,
      authorId: dto.authorId,
      authorName: dto.authorName,
      role: dto.role,
      text: dto.text,
      internalOnly: true,
    });

    return await this.repository.save(note);
  }

  async getNotesForComplaint(complaintId) {
    return await this.repository.findByComplaintId(complaintId);
  }
}

export default { InternalNotesServiceContract, InternalNotesService };

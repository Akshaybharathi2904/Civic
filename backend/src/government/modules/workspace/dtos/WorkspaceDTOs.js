export class UpdateProgressDTO {
  constructor({ progressState, percentage, remarks = '' }) {
    if (!progressState) throw new Error('UpdateProgressDTO requires progressState.');
    this.progressState = progressState.toUpperCase();
    this.percentage = percentage !== undefined ? Number(percentage) : 50;
    this.remarks = remarks;
  }
}

export class AddInternalNoteDTO {
  constructor({ authorId, authorName, role = 'FIELD_OFFICER', text }) {
    if (!text || typeof text !== 'string' || !text.trim()) {
      throw new Error('AddInternalNoteDTO requires non-empty text.');
    }
    this.authorId = authorId || 'usr_off_01';
    this.authorName = authorName || 'Field Officer';
    this.role = role;
    this.text = text.trim();
  }
}

export class SlaCountdownDTO {
  constructor({ complaintId, slaDueDate, hoursRemaining, minutesRemaining, breached, targetSLA }) {
    this.complaintId = complaintId;
    this.slaDueDate = slaDueDate;
    this.hoursRemaining = Number(Number(hoursRemaining).toFixed(1));
    this.minutesRemaining = Math.round(minutesRemaining);
    this.breached = Boolean(breached);
    this.targetSLA = targetSLA || 48;
    this.calculatedAt = new Date().toISOString();
  }
}

export default { UpdateProgressDTO, AddInternalNoteDTO, SlaCountdownDTO };

export class ADKSessionStore {
  constructor() {
    this.sessions = new Map();
  }

  saveSession(context) {
    if (context && context.complaintId) {
      this.sessions.set(context.complaintId, context);
      if (context.ticketId) {
        this.sessions.set(context.ticketId, context);
      }
    }
  }

  getSession(id) {
    return this.sessions.get(id) || null;
  }

  deleteSession(id) {
    this.sessions.delete(id);
  }
}

export const sessionStore = new ADKSessionStore();
export default sessionStore;

export class InvalidStateTransitionException extends Error {
  constructor(fromState, toState, message = null) {
    const detail = message || `Illegal state transition from "${fromState}" to "${toState}".`;
    super(`[InvalidStateTransitionException] ${detail}`);
    this.name = 'InvalidStateTransitionException';
    this.fromState = fromState;
    this.toState = toState;
    this.statusCode = 400;
    this.timestamp = new Date().toISOString();
  }
}

export default InvalidStateTransitionException;

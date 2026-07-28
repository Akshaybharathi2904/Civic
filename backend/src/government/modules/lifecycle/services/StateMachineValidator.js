import { ComplaintStateEnum } from '../models/ComplaintStateEnum.js';
import { InvalidStateTransitionException } from '../errors/InvalidStateTransitionException.js';

export class StateMachineValidator {
  static TRANSITION_MATRIX = Object.freeze({
    [ComplaintStateEnum.NEW]: [ComplaintStateEnum.UNDER_REVIEW, ComplaintStateEnum.REJECTED, ComplaintStateEnum.CANCELLED],
    [ComplaintStateEnum.UNDER_REVIEW]: [ComplaintStateEnum.READY_FOR_ASSIGNMENT, ComplaintStateEnum.REJECTED, ComplaintStateEnum.CANCELLED],
    [ComplaintStateEnum.READY_FOR_ASSIGNMENT]: [ComplaintStateEnum.ASSIGNED, ComplaintStateEnum.REASSIGNED, ComplaintStateEnum.CANCELLED],
    [ComplaintStateEnum.ASSIGNED]: [ComplaintStateEnum.ACCEPTED, ComplaintStateEnum.REJECTED, ComplaintStateEnum.REASSIGNED, ComplaintStateEnum.CANCELLED],
    [ComplaintStateEnum.ACCEPTED]: [ComplaintStateEnum.IN_PROGRESS, ComplaintStateEnum.REASSIGNED, ComplaintStateEnum.ESCALATED, ComplaintStateEnum.CANCELLED],
    [ComplaintStateEnum.IN_PROGRESS]: [ComplaintStateEnum.WORK_COMPLETED, ComplaintStateEnum.ESCALATED, ComplaintStateEnum.CANCELLED],
    [ComplaintStateEnum.WORK_COMPLETED]: [ComplaintStateEnum.VERIFICATION_PENDING, ComplaintStateEnum.VERIFIED, ComplaintStateEnum.IN_PROGRESS],
    [ComplaintStateEnum.VERIFICATION_PENDING]: [ComplaintStateEnum.VERIFIED, ComplaintStateEnum.IN_PROGRESS, ComplaintStateEnum.REJECTED],
    [ComplaintStateEnum.VERIFIED]: [ComplaintStateEnum.CLOSED],
    [ComplaintStateEnum.CLOSED]: [ComplaintStateEnum.UNDER_REVIEW], // Reopening
    [ComplaintStateEnum.REJECTED]: [ComplaintStateEnum.UNDER_REVIEW], // Reopening
    [ComplaintStateEnum.ESCALATED]: [ComplaintStateEnum.READY_FOR_ASSIGNMENT, ComplaintStateEnum.ASSIGNED, ComplaintStateEnum.IN_PROGRESS],
    [ComplaintStateEnum.REASSIGNED]: [ComplaintStateEnum.ASSIGNED, ComplaintStateEnum.ACCEPTED],
    [ComplaintStateEnum.CANCELLED]: [],
  });

  static validateTransition(fromState, toState) {
    if (fromState === toState) {
      return true; // Idempotent transition
    }

    const allowed = this.TRANSITION_MATRIX[fromState] || [];
    if (!allowed.includes(toState)) {
      throw new InvalidStateTransitionException(
        fromState,
        toState,
        `Cannot transition complaint from state "${fromState}" to "${toState}". Allowed next states: [${allowed.join(', ')}].`
      );
    }

    return true;
  }
}

export default StateMachineValidator;

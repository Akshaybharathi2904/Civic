import { EscalationRecord } from '../models/EscalationRecord.js';
import { EscalationLevelEnum } from '../models/EscalationLevelEnum.js';
import { EscalateComplaintDTO, ResolveEscalationDTO } from '../dtos/EscalationDTOs.js';
import { MockEscalationRepository } from '../repositories/MockEscalationRepository.js';
import { MockEscalationNotificationService } from '../notifications/MockEscalationNotificationService.js';

export class EscalationServiceContract {
  async triggerEscalation(escalateDTO) { throw new Error('EscalationServiceContract.triggerEscalation must be implemented.'); }
  async resolveEscalation(escalationId, resolvedBy, notes) { throw new Error('EscalationServiceContract.resolveEscalation must be implemented.'); }
  async getEscalationHistory(complaintId) { throw new Error('EscalationServiceContract.getEscalationHistory must be implemented.'); }
}

export class EscalationService extends EscalationServiceContract {
  constructor(
    repository = new MockEscalationRepository(),
    notificationService = new MockEscalationNotificationService()
  ) {
    super();
    this.repository = repository;
    this.notificationService = notificationService;
  }

  static getTargetRoleForLevel(level) {
    switch (level) {
      case EscalationLevelEnum.LEVEL_2:
        return 'MUNICIPAL_COMMISSIONER';
      case EscalationLevelEnum.LEVEL_3:
        return 'DISTRICT_ADMIN';
      case EscalationLevelEnum.LEVEL_4:
        return 'STATE_ADMIN';
      case EscalationLevelEnum.LEVEL_1:
      default:
        return 'DEPARTMENT_SUPERVISOR';
    }
  }

  async triggerEscalation(escalateInput) {
    const dto = new EscalateComplaintDTO(escalateInput);
    const targetRole = EscalationService.getTargetRoleForLevel(dto.level);

    const record = new EscalationRecord({
      complaintId: dto.complaintId,
      level: dto.level,
      targetRole,
      reason: dto.reason,
    });

    await this.repository.save(record);

    await this.notificationService.sendEscalationAlert(
      targetRole,
      dto.complaintId,
      dto.level,
      `URGENT ESCALATION (${dto.level}): Complaint #${dto.complaintId} requires immediate action. Reason: ${dto.reason}`
    );

    return record;
  }

  async resolveEscalation(escalationId, resolvedByOrInput, notes = '') {
    let dto;
    if (typeof escalationId === 'object') {
      dto = new ResolveEscalationDTO(escalationId);
    } else {
      dto = new ResolveEscalationDTO({ escalationId, resolvedBy: resolvedByOrInput, resolutionNotes: notes });
    }

    const record = await this.repository.findById(dto.escalationId);
    if (!record) throw new Error(`Escalation record #${dto.escalationId} not found.`);

    record.resolve(dto.resolvedBy, dto.resolutionNotes);
    return await this.repository.save(record);
  }

  async getEscalationHistory(complaintId) {
    return await this.repository.findByComplaintId(complaintId);
  }
}

export default { EscalationServiceContract, EscalationService };

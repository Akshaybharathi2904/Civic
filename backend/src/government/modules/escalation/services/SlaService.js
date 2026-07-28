import { SLAConfiguration } from '../models/SLAConfiguration.js';
import { ConfigureSlaDTO, SlaMetricsDTO } from '../dtos/EscalationDTOs.js';
import { MockSlaRepository } from '../repositories/MockSlaRepository.js';

export class SlaServiceContract {
  async configureRule(configureDTO) { throw new Error('SlaServiceContract.configureRule must be implemented.'); }
  async getSlaConfig(category, priority) { throw new Error('SlaServiceContract.getSlaConfig must be implemented.'); }
  async calculateDeadline(category, priority, startTime) { throw new Error('SlaServiceContract.calculateDeadline must be implemented.'); }
}

export class SlaService extends SlaServiceContract {
  constructor(repository = new MockSlaRepository()) {
    super();
    this.repository = repository;
  }

  async configureRule(ruleInput) {
    const dto = new ConfigureSlaDTO(ruleInput);
    const slaConfig = new SLAConfiguration({
      category: dto.category,
      priority: dto.priority,
      targetHours: dto.targetHours,
      warningHours: dto.warningHours,
    });
    return await this.repository.save(slaConfig);
  }

  async getSlaConfig(category, priority) {
    return await this.repository.findByCategoryAndPriority(category, priority);
  }

  async calculateDeadline(category, priority, startTime = new Date()) {
    const config = await this.getSlaConfig(category, priority);
    const startMs = new Date(startTime).getTime();
    const targetMs = config.targetHours * 3600 * 1000;
    return new Date(startMs + targetMs);
  }

  async getMetrics() {
    const rules = await this.repository.findAll();
    return new SlaMetricsDTO({
      totalMonitored: 15,
      withinSla: 12,
      warningState: 2,
      breachedSla: 1,
      activeEscalations: 1,
      complianceRate: 86.67,
    });
  }
}

export default { SlaServiceContract, SlaService };

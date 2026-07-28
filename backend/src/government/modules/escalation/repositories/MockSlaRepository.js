import { SLAConfiguration } from '../models/SLAConfiguration.js';
import { EscalationLevelEnum } from '../models/EscalationLevelEnum.js';

export class SlaRepositoryContract {
  async save(slaConfig) { throw new Error('SlaRepositoryContract.save must be implemented.'); }
  async findByCategoryAndPriority(category, priority) { throw new Error('SlaRepositoryContract.findByCategoryAndPriority must be implemented.'); }
  async findAll() { throw new Error('SlaRepositoryContract.findAll must be implemented.'); }
}

export class MockSlaRepository extends SlaRepositoryContract {
  constructor() {
    super();
    this.configs = new Map();
    this.seedDefaults();
  }

  seedDefaults() {
    const defaultRules = [
      new SLAConfiguration({ category: 'Road Infrastructure', priority: 'Critical', targetHours: 6, warningHours: 4, initialEscalationLevel: EscalationLevelEnum.LEVEL_1 }),
      new SLAConfiguration({ category: 'Road Infrastructure', priority: 'High', targetHours: 24, warningHours: 18, initialEscalationLevel: EscalationLevelEnum.LEVEL_1 }),
      new SLAConfiguration({ category: 'Road Infrastructure', priority: 'Medium', targetHours: 48, warningHours: 36, initialEscalationLevel: EscalationLevelEnum.LEVEL_1 }),
      new SLAConfiguration({ category: 'Water & Sanitation', priority: 'Critical', targetHours: 12, warningHours: 8, initialEscalationLevel: EscalationLevelEnum.LEVEL_1 }),
      new SLAConfiguration({ category: 'Water & Sanitation', priority: 'High', targetHours: 24, warningHours: 18, initialEscalationLevel: EscalationLevelEnum.LEVEL_1 }),
    ];

    defaultRules.forEach(r => this.configs.set(`${r.category}_${r.priority}`.toLowerCase(), r));
  }

  async save(slaConfig) {
    const key = `${slaConfig.category}_${slaConfig.priority}`.toLowerCase();
    this.configs.set(key, slaConfig);
    return slaConfig;
  }

  async findByCategoryAndPriority(category, priority) {
    const key = `${category}_${priority}`.toLowerCase();
    return this.configs.get(key) || new SLAConfiguration({ category, priority, targetHours: 48 });
  }

  async findAll() {
    return Array.from(this.configs.values());
  }
}

export default { SlaRepositoryContract, MockSlaRepository };

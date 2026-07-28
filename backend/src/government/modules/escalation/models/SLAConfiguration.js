import { EscalationLevelEnum } from './EscalationLevelEnum.js';

export class SLAConfiguration {
  constructor({
    id = `sla_cfg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    category = 'Road Infrastructure',
    priority = 'Medium',
    targetHours = 48,
    warningHours = 36,
    initialEscalationLevel = EscalationLevelEnum.LEVEL_1,
    active = true,
  }) {
    this.id = id;
    this.category = category;
    this.priority = priority;
    this.targetHours = targetHours;
    this.warningHours = warningHours;
    this.initialEscalationLevel = initialEscalationLevel;
    this.active = Boolean(active);
    this.updatedAt = new Date().toISOString();
  }
}

export default SLAConfiguration;

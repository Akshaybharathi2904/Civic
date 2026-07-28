import { SlaMonitoringService } from './SlaMonitoringService.js';

export class MockBackgroundScheduler {
  constructor(monitoringService = new SlaMonitoringService()) {
    this.monitoringService = monitoringService;
    this.timerId = null;
    this.running = false;
    this.lastRunAt = null;
    this.runCount = 0;
  }

  start(intervalMs = 60000, activeComplaints = []) {
    if (this.running) return;
    this.running = true;
    this.timerId = setInterval(async () => {
      this.runCount++;
      this.lastRunAt = new Date().toISOString();
      await this.monitoringService.monitorActiveComplaints(activeComplaints);
    }, intervalMs);
  }

  async triggerManualSweep(activeComplaints = []) {
    this.runCount++;
    this.lastRunAt = new Date().toISOString();
    return await this.monitoringService.monitorActiveComplaints(activeComplaints);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.running = false;
  }
}

export default MockBackgroundScheduler;

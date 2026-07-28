export class ReportRepositoryContract {
  async save(report) { throw new Error('ReportRepositoryContract.save must be implemented.'); }
  async findById(id) { throw new Error('ReportRepositoryContract.findById must be implemented.'); }
  async findAll() { throw new Error('ReportRepositoryContract.findAll must be implemented.'); }
}

export class MockReportRepository extends ReportRepositoryContract {
  constructor() {
    super();
    this.reports = new Map();
  }

  async save(report) {
    this.reports.set(report.id, report);
    return report;
  }

  async findById(id) {
    return this.reports.get(id) || null;
  }

  async findAll() {
    return Array.from(this.reports.values());
  }
}

export default { ReportRepositoryContract, MockReportRepository };

export class RegionAssignment {
  constructor({
    id = `reg_asgn_${Date.now()}`,
    officerId,
    ward = 'Ward 72',
    zone = 'Central Zone',
    district = 'Coimbatore',
    assignedAt = new Date().toISOString(),
    active = true,
  }) {
    this.id = id;
    this.officerId = officerId;
    this.ward = ward;
    this.zone = zone;
    this.district = district;
    this.assignedAt = assignedAt;
    this.active = Boolean(active);
  }
}

export default RegionAssignment;

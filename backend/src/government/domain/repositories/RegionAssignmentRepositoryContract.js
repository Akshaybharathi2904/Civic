export class RegionAssignmentRepositoryContract {
  async findById(id) { throw new Error('RegionAssignmentRepositoryContract.findById must be implemented.'); }
  async findByOfficer(officerId) { throw new Error('RegionAssignmentRepositoryContract.findByOfficer must be implemented.'); }
  async save(assignment) { throw new Error('RegionAssignmentRepositoryContract.save must be implemented.'); }
}

export default RegionAssignmentRepositoryContract;

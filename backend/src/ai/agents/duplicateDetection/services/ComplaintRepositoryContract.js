export class ComplaintRepositoryContract {
  /**
   * Abstract method: Find candidate active complaints within spatial radius
   */
  async findNearbyActiveComplaints(latitude, longitude, radiusMeters = 500) {
    throw new Error('ComplaintRepositoryContract.findNearbyActiveComplaints must be implemented by concrete repository.');
  }
}

export default ComplaintRepositoryContract;

export class CommunityResponseRepositoryContract {
  /**
   * Abstract method: Record a user vote ('confirm', 'reject', 'skip')
   */
  async recordResponse(complaintId, userId, action) {
    throw new Error('CommunityResponseRepositoryContract.recordResponse must be implemented.');
  }

  /**
   * Abstract method: Fetch all recorded community responses for a complaint
   */
  async getResponses(complaintId) {
    throw new Error('CommunityResponseRepositoryContract.getResponses must be implemented.');
  }
}

export default CommunityResponseRepositoryContract;

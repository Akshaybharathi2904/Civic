export class DepartmentRepositoryContract {
  /**
   * Abstract method: Retrieve municipal department record by code or ID
   */
  async getDepartmentByCode(code) {
    throw new Error('DepartmentRepositoryContract.getDepartmentByCode must be implemented.');
  }

  /**
   * Abstract method: Retrieve all registered municipal departments
   */
  async getAllDepartments() {
    throw new Error('DepartmentRepositoryContract.getAllDepartments must be implemented.');
  }
}

export default DepartmentRepositoryContract;

export class DepartmentRuleEngineContract {
  /**
   * Abstract method: Recommend department, office, and queue using configurable rules
   */
  async evaluateDepartmentRules(inputDTO) {
    throw new Error('DepartmentRuleEngineContract.evaluateDepartmentRules must be implemented by concrete rule engine.');
  }
}

export default DepartmentRuleEngineContract;

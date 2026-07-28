export class GovernmentPlatformError extends Error {
  constructor(message, moduleName = 'GovernmentPlatform', originalError = null) {
    super(`[${moduleName}] ${message}`);
    this.name = 'GovernmentPlatformError';
    this.moduleName = moduleName;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

export default GovernmentPlatformError;

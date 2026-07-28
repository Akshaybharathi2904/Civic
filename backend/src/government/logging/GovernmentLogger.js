export class GovernmentLogger {
  static info(moduleName, message, metadata = {}) {
    console.log(`[GOV-INFO] [${moduleName}] [${new Date().toISOString()}]: ${message}`, metadata);
  }

  static warn(moduleName, message, metadata = {}) {
    console.warn(`[GOV-WARN] [${moduleName}] [${new Date().toISOString()}]: ${message}`, metadata);
  }

  static error(moduleName, message, error = null) {
    console.error(`[GOV-ERROR] [${moduleName}] [${new Date().toISOString()}]: ${message}`, error ? error.message : '');
  }
}

export default GovernmentLogger;

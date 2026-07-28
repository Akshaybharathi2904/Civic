export class AuthenticationException extends Error {
  constructor(message, originalError = null) {
    super(`[AuthenticationException] ${message}`);
    this.name = 'AuthenticationException';
    this.statusCode = 401;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

export default AuthenticationException;

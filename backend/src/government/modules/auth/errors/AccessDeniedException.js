export class AccessDeniedException extends Error {
  constructor(message, requiredRoleOrPermission = null) {
    super(`[AccessDeniedException] ${message}`);
    this.name = 'AccessDeniedException';
    this.statusCode = 403;
    this.requiredRoleOrPermission = requiredRoleOrPermission;
    this.timestamp = new Date().toISOString();
  }
}

export default AccessDeniedException;

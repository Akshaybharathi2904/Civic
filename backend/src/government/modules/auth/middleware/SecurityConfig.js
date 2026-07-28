import { AccessDeniedException } from '../errors/AccessDeniedException.js';
import { AuthenticationException } from '../errors/AuthenticationException.js';

export const requireAuth = (req, res, next) => {
  if (!req.govUser) {
    return next(new AuthenticationException('Full authentication is required to access this resource.'));
  }
  next();
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.govUser) {
      return next(new AuthenticationException('Full authentication is required to access this resource.'));
    }
    if (!allowedRoles.includes(req.govUser.role)) {
      return next(new AccessDeniedException(`Access Denied: User role "${req.govUser.role}" does not match required roles: [${allowedRoles.join(', ')}].`, allowedRoles));
    }
    next();
  };
};

export const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.govUser) {
      return next(new AuthenticationException('Full authentication is required to access this resource.'));
    }
    const hasAll = requiredPermissions.every(p => req.govUser.hasPermission(p));
    if (!hasAll) {
      return next(new AccessDeniedException(`Access Denied: Missing required permission [${requiredPermissions.join(', ')}].`, requiredPermissions));
    }
    next();
  };
};

export default {
  requireAuth,
  requireRole,
  requirePermission,
};

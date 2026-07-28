import crypto from 'crypto';
import { AuthConfig } from '../config/auth.config.js';

export class JwtServiceContract {
  async generateToken(userPayload) { throw new Error('JwtServiceContract.generateToken must be implemented.'); }
  async verifyToken(token) { throw new Error('JwtServiceContract.verifyToken must be implemented.'); }
  async invalidateToken(token) { throw new Error('JwtServiceContract.invalidateToken must be implemented.'); }
}

export class JwtService extends JwtServiceContract {
  constructor() {
    super();
    this.blacklistedTokens = new Set();
  }

  base64UrlEncode(str) {
    return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  }

  base64UrlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    return Buffer.from(str, 'base64').toString('utf8');
  }

  async generateToken(user) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const exp = now + AuthConfig.JWT_EXPIRATION_SECONDS;

    const payload = {
      iss: AuthConfig.ISSUER,
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
      departmentId: user.departmentId,
      district: user.district,
      iat: now,
      exp,
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const signature = crypto.createHmac('sha256', AuthConfig.JWT_SECRET).update(`${encodedHeader}.${encodedPayload}`).digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  async verifyToken(token) {
    if (!token || typeof token !== 'string') return { valid: false, reason: 'Missing token' };
    if (this.blacklistedTokens.has(token)) return { valid: false, reason: 'Token has been invalidated (logged out)' };

    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false, reason: 'Malformed JWT structure' };

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', AuthConfig.JWT_SECRET).update(`${encodedHeader}.${encodedPayload}`).digest('base64url');

    if (signature !== expectedSignature) {
      return { valid: false, reason: 'Invalid JWT signature' };
    }

    try {
      const payload = JSON.parse(this.base64UrlDecode(encodedPayload));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return { valid: false, reason: 'Token has expired' };
      }
      return { valid: true, payload };
    } catch (e) {
      return { valid: false, reason: 'Failed to decode token payload' };
    }
  }

  async invalidateToken(token) {
    if (token) {
      this.blacklistedTokens.add(token);
    }
    return true;
  }
}

export default { JwtServiceContract, JwtService };

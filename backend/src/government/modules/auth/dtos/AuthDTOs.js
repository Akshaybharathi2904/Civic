export class LoginRequestDTO {
  constructor({ email, password }) {
    if (!email || !password) {
      throw new Error('LoginRequestDTO requires email and password.');
    }
    this.email = email.toLowerCase().trim();
    this.password = password;
  }
}

export class LoginResponseDTO {
  constructor({ token, tokenType = 'Bearer', expiresIn = 28800, user }) {
    this.token = token;
    this.tokenType = tokenType;
    this.expiresIn = expiresIn;
    this.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      departmentId: user.departmentId,
      district: user.district,
    };
    this.timestamp = new Date().toISOString();
  }
}

export class TokenValidationDTO {
  constructor({ valid, user = null, reason = '' }) {
    this.valid = Boolean(valid);
    this.user = user;
    this.reason = reason;
  }
}

export class RefreshTokenDTO {
  constructor({ token }) {
    if (!token) throw new Error('RefreshTokenDTO requires token.');
    this.token = token;
  }
}

export default {
  LoginRequestDTO,
  LoginResponseDTO,
  TokenValidationDTO,
  RefreshTokenDTO,
};

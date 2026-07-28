export class AuthContract {
  async login(loginDTO) { throw new Error('AuthContract.login must be implemented.'); }
  async validateToken(token) { throw new Error('AuthContract.validateToken must be implemented.'); }
}

export class MockAuthService extends AuthContract {
  async login(loginDTO) {
    return {
      token: 'mock_gov_jwt_token_12345',
      user: { id: 'usr_gov_admin', email: loginDTO.email, role: 'SUPER_ADMIN' },
    };
  }

  async validateToken(token) {
    return { valid: true, userId: 'usr_gov_admin', role: 'SUPER_ADMIN' };
  }
}

export default { AuthContract, MockAuthService };

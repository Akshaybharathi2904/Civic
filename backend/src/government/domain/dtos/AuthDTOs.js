export class LoginInputDTO {
  constructor({ email, password }) {
    if (!email || !password) throw new Error('LoginInputDTO requires email and password.');
    this.email = email;
    this.password = password;
  }
}

export class AuthResponseDTO {
  constructor({ token = 'mock_jwt_token', user }) {
    this.token = token;
    this.user = user;
    this.timestamp = new Date().toISOString();
  }
}

export default { LoginInputDTO, AuthResponseDTO };

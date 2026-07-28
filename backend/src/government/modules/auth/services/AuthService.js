import { BCryptPasswordEncoder } from './PasswordEncoder.js';
import { JwtService } from './JwtService.js';
import { UserDetailsService } from './UserDetailsService.js';
import { LoginRequestDTO, LoginResponseDTO, TokenValidationDTO } from '../dtos/AuthDTOs.js';
import { AuthenticationException } from '../errors/AuthenticationException.js';

export class AuthServiceContract {
  async login(loginRequest) { throw new Error('AuthServiceContract.login must be implemented.'); }
  async logout(token) { throw new Error('AuthServiceContract.logout must be implemented.'); }
  async validateToken(token) { throw new Error('AuthServiceContract.validateToken must be implemented.'); }
  async getCurrentUser(token) { throw new Error('AuthServiceContract.getCurrentUser must be implemented.'); }
}

export class AuthService extends AuthServiceContract {
  constructor(
    userDetailsService = new UserDetailsService(),
    jwtService = new JwtService(),
    passwordEncoder = new BCryptPasswordEncoder()
  ) {
    super();
    this.userDetailsService = userDetailsService;
    this.jwtService = jwtService;
    this.passwordEncoder = passwordEncoder;
  }

  async login(loginRequest) {
    const dto = new LoginRequestDTO(loginRequest);
    const user = await this.userDetailsService.loadUserByEmail(dto.email);

    if (!user) {
      throw new AuthenticationException('Invalid email or password credentials.');
    }

    const passwordMatches = await this.passwordEncoder.matches(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new AuthenticationException('Invalid email or password credentials.');
    }

    if (!user.active) {
      throw new AuthenticationException('Government official account has been deactivated.');
    }

    user.lastLoginAt = new Date().toISOString();
    const token = await this.jwtService.generateToken(user);

    return new LoginResponseDTO({ token, user });
  }

  async logout(token) {
    if (!token) return true;
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    return await this.jwtService.invalidateToken(cleanToken);
  }

  async validateToken(token) {
    const cleanToken = (token || '').startsWith('Bearer ') ? token.slice(7) : token;
    const verification = await this.jwtService.verifyToken(cleanToken);

    if (!verification.valid) {
      return new TokenValidationDTO({ valid: false, reason: verification.reason });
    }

    const user = await this.userDetailsService.loadUserById(verification.payload.sub);
    if (!user) {
      return new TokenValidationDTO({ valid: false, reason: 'User not found' });
    }

    return new TokenValidationDTO({ valid: true, user });
  }

  async getCurrentUser(token) {
    const validation = await this.validateToken(token);
    if (!validation.valid) {
      throw new AuthenticationException(`Authentication failed: ${validation.reason}`);
    }
    return validation.user;
  }
}

export default { AuthServiceContract, AuthService };

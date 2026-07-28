import { AuthService } from '../services/AuthService.js';

export class AuthController {
  constructor(authService = new AuthService()) {
    this.authService = authService;
  }

  async login(req, res, next) {
    try {
      const responseDTO = await this.authService.login(req.body);
      return res.status(200).json({
        success: true,
        message: 'Government official authenticated successfully.',
        data: responseDTO,
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const authHeader = req.headers.authorization || req.headers.Authorization;
      await this.authService.logout(authHeader);
      return res.status(200).json({
        success: true,
        message: 'Successfully logged out and invalidated JWT token.',
      });
    } catch (err) {
      next(err);
    }
  }

  async validate(req, res, next) {
    try {
      const authHeader = req.headers.authorization || req.headers.Authorization;
      const result = await this.authService.validateToken(authHeader);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async me(req, res, next) {
    try {
      const authHeader = req.headers.authorization || req.headers.Authorization;
      const user = await this.authService.getCurrentUser(authHeader);
      return res.status(200).json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
          departmentId: user.departmentId,
          district: user.district,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;

import { JwtService } from '../services/JwtService.js';
import { UserDetailsService } from '../services/UserDetailsService.js';

export const createJwtAuthenticationFilter = (
  jwtService = new JwtService(),
  userDetailsService = new UserDetailsService()
) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.slice(7).trim();
    const verification = await jwtService.verifyToken(token);

    if (verification.valid && verification.payload) {
      const user = await userDetailsService.loadUserById(verification.payload.sub);
      if (user && user.active) {
        req.govUser = user;
        req.token = token;
      }
    }
    return next();
  };
};

export default createJwtAuthenticationFilter;

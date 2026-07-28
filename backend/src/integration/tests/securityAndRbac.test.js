import {
  AuthService,
  requireRole,
  requirePermission,
  AccessDeniedException,
} from '../../government/index.js';

export const runSecurityAndRbacTest = async () => {
  console.log('--- [SUITE 3/4] Running Security & RBAC Enforcement Test ---');
  const authService = new AuthService();

  // 1. Authenticate Municipal Commissioner
  const commissionerLogin = await authService.login({ email: 'commissioner@coimbatore.gov.in', password: 'Password@123' });
  if (commissionerLogin.user.role !== 'MUNICIPAL_COMMISSIONER') throw new Error('RBAC role check failed.');
  console.log('  ✔ [Check 1/4] JWT Signing & Role Assignment Verified');

  // 2. Validate Token & Payload Claims
  const validToken = await authService.validateToken(commissionerLogin.token);
  if (!validToken.valid || validToken.user.username !== 'commissioner.cbe') throw new Error('JWT token verification failed.');
  console.log('  ✔ [Check 2/4] JWT Token Verification & Payload Claims Verified');

  // 3. Test Invalidation on Logout
  await authService.logout(commissionerLogin.token);
  const postLogout = await authService.validateToken(commissionerLogin.token);
  if (postLogout.valid) throw new Error('Logout token invalidation failed.');
  console.log('  ✔ [Check 3/4] Logout Token Invalidation Verified');

  // 4. Test RBAC Security Guards
  const mockReq = { govUser: commissionerLogin.user };
  const mockRes = {};
  let rbacGuardBlocked = false;

  const adminOnlyGuard = requireRole('STATE_ADMIN');
  adminOnlyGuard(mockReq, mockRes, (err) => {
    if (err && err instanceof AccessDeniedException) {
      rbacGuardBlocked = true;
    }
  });

  if (!rbacGuardBlocked) throw new Error('RBAC Guard failed to block unauthorized role access.');
  console.log('  ✔ [Check 4/4] SecurityConfig RBAC Guard Access Blocking Verified');

  console.log('✅ [PASS] Security & RBAC Enforcement Test Passed!');
  return true;
};

export default runSecurityAndRbacTest;

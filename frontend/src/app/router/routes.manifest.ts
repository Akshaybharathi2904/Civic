export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CITIZEN_DASHBOARD: '/citizen-dashboard',
  SUBMIT_ISSUE: '/submit-complaint',
  ISSUE_DETAIL: '/complaints/:id',
  AI_PROCESSING: '/ai-processing/:id',
  OFFICIAL_DASHBOARD: '/official-dashboard',
  ANALYTICS: '/analytics',
  LIVE_MAP: '/live-map',
  PROFILE: '/profile',
  USERS: '/users',
  NOT_FOUND: '*',
} as const;

export default ROUTES;

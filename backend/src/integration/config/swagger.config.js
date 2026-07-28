export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Civic AI-Powered Issue Resolution & Government Operations API',
    version: '1.0.0',
    description: 'Production-ready OpenAPI specification connecting Citizen Platform, AI Multi-Agent Platform, and Government Operations Platform.',
  },
  servers: [
    { url: 'http://localhost:5000/api/v1', description: 'Local Development Server' },
    { url: 'https://api.civicgov.in/api/v1', description: 'Production Government Gateway' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ BearerAuth: [] }],
  paths: {
    '/gov/auth/login': {
      post: { summary: 'Government Official Authentication & JWT Generation' },
    },
    '/gov/queue': {
      get: { summary: 'Query Pending Government Complaint Queue' },
    },
    '/gov/assignments/assign': {
      post: { summary: 'Assign AI-Enriched Complaint to Field Officer' },
    },
    '/gov/workspace/complaints': {
      get: { summary: 'Retrieve Field Officer Assigned Cases' },
    },
    '/gov/evidence/upload': {
      post: { summary: 'Upload Work Completion Evidence' },
    },
    '/gov/verifications/approve': {
      post: { summary: 'Supervisor Verification & Sign-Off' },
    },
    '/gov/lifecycle/{id}/status': {
      post: { summary: 'Update Complaint Lifecycle State' },
    },
    '/gov/notifications': {
      post: { summary: 'Dispatch Citizen Multi-Channel Notification' },
    },
    '/gov/dashboard/executive': {
      get: { summary: 'Retrieve Operational & Executive Summary Analytics' },
    },
  },
};

export default swaggerSpec;

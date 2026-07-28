import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  databaseUrl: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/civicswarm',
  jwtSecret: process.env.JWT_SECRET || 'civicswarm_super_secret_jwt_key_2026_hackathon',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development'
};

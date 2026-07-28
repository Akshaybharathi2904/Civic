export interface AppEnv {
  API_BASE_URL: string;
  SOCKET_URL: string;
  APP_TITLE: string;
  IS_DEV: boolean;
  IS_PROD: boolean;
}

const metaEnv = (import.meta as any).env || {};

export const env: AppEnv = {
  API_BASE_URL: metaEnv.VITE_API_BASE_URL || '/api',
  SOCKET_URL: metaEnv.VITE_SOCKET_URL || '',
  APP_TITLE: metaEnv.VITE_APP_TITLE || 'CivicSwarm - AI-Powered Civic Response',
  IS_DEV: !!metaEnv.DEV,
  IS_PROD: !!metaEnv.PROD,
};

export default env;

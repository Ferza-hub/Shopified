export interface AppConfig {
  env: string;
  port: number;
  database: {
    url: string;
  };
  redis: {
    url: string;
    host: string;
    port: number;
  };
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
  };
  smtp: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
  };
  storage: {
    driver: string;
    localPath: string;
    publicUrl: string;
  };
  stripe: {
    secretKey: string;
    webhookSecret: string;
  };
}

export default (): AppConfig => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.API_PORT || '3001', 10),
  database: {
    url: process.env.DATABASE_URL || '',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  smtp: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'no-reply@shopified.com',
  },
  storage: {
    driver: process.env.STORAGE_DRIVER || 'local',
    localPath: process.env.STORAGE_LOCAL_PATH || './uploads',
    publicUrl: process.env.STORAGE_PUBLIC_URL || 'http://localhost:3001/uploads',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
});

import { registerAs } from '@nestjs/config';

export const DatabaseConfigName = 'database';

export interface DatabaseConfig {
  type: 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mongodb';
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
}

export default registerAs(DatabaseConfigName, () => ({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: process.env.DB_SYNC === 'true',
  minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || '5'),
  maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10'),
}));

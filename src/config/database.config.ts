import { TypeOrmModule } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModule = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_USER),
};

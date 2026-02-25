import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenv.config();

function resolveHost(rawHost: string): string {
  if (!rawHost.includes('jdbc:postgresql://')) {
    return rawHost;
  }
  const match = rawHost.match(/jdbc:postgresql:\/\/([^:/]+)/);
  return match?.[1] || rawHost;
}

function shouldUseSsl(host: string): boolean {
  return (
    host.includes('render.com') ||
    host.includes('amazonaws.com') ||
    host.includes('heroku') ||
    host.includes('supabase.co') ||
    host.includes('supabase.com')
  );
}

async function bootstrapSchema() {
  const host = resolveHost(process.env.DB_HOST || 'localhost');
  const options: DataSourceOptions = {
    type: 'postgres',
    host,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'postgres',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
    logging: true,
    ssl: shouldUseSsl(host) ? { rejectUnauthorized: false } : false,
  };

  const dataSource = new DataSource(options);
  await dataSource.initialize();
  console.log('Schema bootstrap complete.');
  await dataSource.destroy();
}

bootstrapSchema().catch((error) => {
  console.error('Schema bootstrap failed:', error);
  process.exit(1);
});

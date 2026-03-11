import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/',
  migrations: {
    path: 'prisma/migrations',
  },
  // engine: 'classic',
  // datasource: {
  //   url: env('DATABASE_URL'),
  // },
});

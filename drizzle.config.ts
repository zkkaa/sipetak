// File: drizzle.config.ts

import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql', // Ganti 'driver' dengan 'dialect'
    dbCredentials: {
        url: process.env.DATABASE_URL!, // Ganti 'connectionString' dengan 'url'
    },
    verbose: true,
    strict: true,
});
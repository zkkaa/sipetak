// File: src/db/db.ts

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema'; // Import skema yang baru Anda buat

// Gunakan URL dari .env
const connectionString = process.env.DATABASE_URL!;

// Buat instance koneksi untuk Drizzle
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
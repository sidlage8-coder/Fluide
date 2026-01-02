import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

const { Pool } = pg;

// Vérification de la variable d'environnement
if (!import.meta.env.VITE_DATABASE_URL) {
  console.warn('⚠️ VITE_DATABASE_URL non définie - Mode développement sans DB');
}

// Pool de connexions PostgreSQL
const pool = new Pool({
  connectionString: import.meta.env.VITE_DATABASE_URL,
  max: 10, // Maximum de connexions dans le pool
  idleTimeoutMillis: 30000, // Fermer les connexions idle après 30s
  connectionTimeoutMillis: 2000, // Timeout de connexion
});

// Instance Drizzle avec le schéma
export const db = drizzle(pool, { schema });

// Export du pool pour les cas où on en a besoin directement
export { pool };

// Export du schéma pour faciliter les imports
export * from './schema';

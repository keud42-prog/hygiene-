const { Pool } = require('pg');
require('dotenv').config();

// Pool de connexions PostgreSQL, partage par toute l'application.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Beaucoup d'hebergeurs (Neon, Render, Railway...) exigent SSL.
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => console.log('✅ Connecte a PostgreSQL'));
pool.on('error', (err) => console.error('❌ Erreur PostgreSQL:', err.message));

module.exports = pool;

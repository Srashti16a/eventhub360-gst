const { Pool } = require('pg');
require('dotenv').config();

// Construct the configuration object based on available environment variables
const poolConfig = {};

if (process.env.DATABASE_URL) {
  poolConfig.connectionString = process.env.DATABASE_URL;
} else {
  poolConfig.host = process.env.PGHOST || '/tmp';
  if (process.env.PGPORT) poolConfig.port = parseInt(process.env.PGPORT, 10);
  poolConfig.user = process.env.PGUSER || 'priyalagrawal';
  poolConfig.password = process.env.PGPASSWORD || '';
  poolConfig.database = process.env.PGDATABASE || 'eventhub360_guest';
}

// Add connection pool configurations for production-level robustness
console.log('Env variables inside db.js:', {
  PGHOST: process.env.PGHOST,
  PGPORT: process.env.PGPORT,
  PGUSER: process.env.PGUSER,
  PGPASSWORD: process.env.PGPASSWORD,
  PGDATABASE: process.env.PGDATABASE,
  USER: process.env.USER,
});
console.log('Initializing DB Pool with config:', poolConfig);
const pool = new Pool({
  ...poolConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Event listeners for log and debug info
pool.on('connect', () => {
  console.log('Database connected successfully.');
});

pool.on('error', (err) => {
  console.error('Unexpected database client error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};

const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 3000;

// Test DB Connection and start listening
async function startServer() {
  try {
    // Run a simple test query to verify connection pool works
    const res = await db.query('SELECT NOW()');
    console.log(`Database connected successfully at: ${res.rows[0].now}`);

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
      console.log(`  Access Swagger docs at: http://localhost:${PORT}/api-docs`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('CRITICAL: Failed to connect to the database. Server not started.', err);
    process.exit(1);
  }
}

startServer();

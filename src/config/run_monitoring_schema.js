const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function init() {
    try {
        const sqlPath = path.join(__dirname, 'communicationLogsSchema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log(`Reading SQL schema from ${sqlPath}...`);
        await pool.query(sql);
        console.log("Database schema executed successfully! Communication monitoring tables initialized.");
    } catch (err) {
        console.error("Failed to execute database schema:", err);
    } finally {
        await pool.end();
    }
}

init();

const pool = require("./src/config/db");

async function main() {
    try {
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log("Tables in database:", res.rows.map(r => r.table_name));
        
        // Describe table definitions if they exist
        for (const row of res.rows) {
            const cols = await pool.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = $1
            `, [row.table_name]);
            console.log(`\nTable: ${row.table_name}`);
            console.log(cols.rows.map(c => `${c.column_name} (${c.data_type}, ${c.is_nullable === 'YES' ? 'null' : 'not null'})`).join(", "));
        }
    } catch (e) {
        console.error("Error connecting to database:", e);
    } finally {
        await pool.end();
    }
}

main();

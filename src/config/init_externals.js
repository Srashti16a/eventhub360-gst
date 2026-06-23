const pool = require('./db');

async function init() {
    try {
        console.log("Creating external guest and event_guest tables if not exists...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS guest (
                guest_id BIGSERIAL PRIMARY KEY,
                company_id BIGINT NOT NULL,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                category VARCHAR(50) NOT NULL DEFAULT 'Attendee',
                company VARCHAR(255),
                job_title VARCHAR(255),
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS event_guest (
                event_guest_id BIGSERIAL PRIMARY KEY,
                event_id BIGINT NOT NULL,
                guest_id BIGINT REFERENCES guest(guest_id) ON DELETE CASCADE,
                invited BOOLEAN DEFAULT TRUE
            );
        `);
        console.log("External tables initialized successfully!");
    } catch (err) {
        console.error("Failed to initialize external tables:", err);
    } finally {
        await pool.end();
    }
}

init();

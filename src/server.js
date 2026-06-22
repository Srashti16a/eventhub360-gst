const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const templateRoutes = require("./routes/templateRoutes");
app.use("/api/v1/templates", templateRoutes);

const rsvpAnalyticsRoutes = require("./routes/rsvpAnalyticsRoutes");
app.use("/api/v1/analytics/rsvp", rsvpAnalyticsRoutes);

const magicLinkRoutes = require("./routes/magicLinkRoutes");
app.use("/api/v1/magic-links", magicLinkRoutes);

app.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Guest Management API Running",
            database: "Connected",
            time: result.rows[0].now,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Database connection failed",
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
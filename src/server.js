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

const badgePrintingRoutes = require("./routes/badgePrintingRoutes");
app.use("/api/v1/badge-printing", badgePrintingRoutes);

const kioskRegistrationRoutes = require("./routes/kioskRegistrationRoutes");
app.use("/api/v1/kiosk-registration", kioskRegistrationRoutes);

const communicationCenterRoutes = require("./routes/communicationCenterRoutes");
app.use("/api/v1/communication-center", communicationCenterRoutes);

const communicationLogsRoutes = require("./routes/communicationLogsRoutes");
app.use("/api/v1/communication-monitoring", communicationLogsRoutes);

const guestReportingRoutes = require("./routes/guestReportingRoutes");
app.use("/api/v1/guest-reporting", guestReportingRoutes);

const transportationRoutes = require("./routes/transportationRoutes");
app.use("/api/v1/transportation", transportationRoutes);

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
import express from "express"; 
import pool from "../config/db.js"; // Ensure correct DB config path

const router = express.Router();

// Middleware to parse JSON requests
router.use(express.json());

/**
 * ✅ Fetch all districts from `crime_statistics` table
 */
router.get("/districts", async (req, res) => {
    try {
        const result = await pool.query("SELECT DISTINCT district FROM crime_statistics ORDER BY district");
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No districts found" });
        }
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error fetching districts:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * ✅ Fetch subdivisions based on selected district
 */
router.get("/subdivisions", async (req, res) => {
    try {
        const { district } = req.query;

        if (!district) {
            return res.status(400).json({ error: "District parameter is required" });
        }

        console.log(`📌 Fetching subdivisions for district: ${district}`);

        const result = await pool.query(
            "SELECT DISTINCT subdivision FROM crime_statistics WHERE district = $1 ORDER BY subdivision",
            [district]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No subdivisions found for this district" });
        }

        res.json(result.rows.map(row => row.subdivision)); // Return only subdivision names
    } catch (error) {
        console.error("❌ Error fetching subdivisions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * ✅ Submit a Crime Report (Insert into Database)
 */
router.post("/report", async (req, res) => {
    console.log("📌 Received Crime Report Data:", req.body);

    const {
        userId, // Add userId
        incidentType,
        date,
        time,
        district,
        subdivision,
        description,
        suspect,
        victim,
        witness,
        evidence
    } = req.body;

    if (!userId || !incidentType || !date || !time || !district || !subdivision || !description) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const insertQuery = `
            INSERT INTO crime_reports (
                user_id, incident_type, date, time, district, subdivision, description,
                suspect, victim, witness, evidence, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Pending')
            RETURNING id, created_at, status;
        `;

        const result = await pool.query(insertQuery, [
            userId, // Include userId
            incidentType,
            date,
            time,
            district,
            subdivision,
            description,
            suspect || null,
            victim || null,
            witness || null,
            evidence ? evidence : null,
        ]);

        console.log("✅ Crime report inserted:", result.rows[0]);

        res.status(201).json({
            message: "Crime report submitted successfully",
            reportId: result.rows[0].id,
            createdAt: result.rows[0].created_at,
        });
    } catch (error) {
        console.error("❌ Error inserting crime report:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * ✅ Fetch Crime Reports
 */
router.get("/status/:policeId", async (req, res) => {
    const { policeId } = req.params;

    try {
        const roleQuery = `SELECT role FROM users WHERE id = $1`;
        const roleResult = await pool.query(roleQuery, [policeId]);

        if (roleResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const userRole = roleResult.rows[0].role;

        let query;
        let values;

        if (userRole === "police") {
            // ✅ Fetch all crime reports for police
            query = `SELECT id, user_id, incident_type, date, district, subdivision, status FROM crime_reports`;
            values = [];
        } else {
            // ✅ Fetch only the user's own reports
            query = `SELECT id, incident_type, date, district, subdivision, status FROM crime_reports WHERE user_id = $1`;
            values = [policeId];
        }

        const result = await pool.query(query, values);

        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error fetching reports:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//Complaint status update
router.patch("/update-status/:id", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "Under Investigation", "Resolved", "Closed"];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
    }

    try {
        const result = await pool.query(
            "UPDATE crime_reports SET status = $1 WHERE id = $2 RETURNING *",
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Crime report not found" });
        }

        res.json({ message: "Status updated successfully", report: result.rows[0] });
    } catch (error) {
        console.error("❌ Error updating status:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



/**
 * ✅ Fetch Crime Statistics (Count by Incident Type)
 */
router.get("/stats", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT incident_type, COUNT(*) AS count 
            FROM crime_reports 
            GROUP BY incident_type
        `);

        const labels = result.rows.map(row => row.incident_type);
        const data = result.rows.map(row => parseInt(row.count));

        res.json({ labels, data });
    } catch (error) {
        console.error("❌ Error fetching crime statistics:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


/**
 * ✅ Fetch Crime Report Locations
 */
router.get("/locations", async (req, res) => {
    try {
        const result = await pool.query("SELECT latitude, longitude FROM crime_reports WHERE latitude IS NOT NULL AND longitude IS NOT NULL");

        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error fetching crime locations:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


export default router;

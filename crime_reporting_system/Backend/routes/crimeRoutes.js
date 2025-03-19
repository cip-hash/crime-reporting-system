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

    // Check required fields
    if (!incidentType || !date || !time || !district || !subdivision || !description) {
        console.error("❌ Missing required fields:", req.body);
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Insert into crime_reports table
        const insertQuery = `
            INSERT INTO crime_reports (
                incident_type, date, time, district, subdivision, description,
                suspect, victim, witness, evidence
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, created_at
        `;

        const result = await pool.query(insertQuery, [
            incidentType,
            date,
            time,
            district,
            subdivision,
            description,
            suspect || null,
            victim || null,
            witness || null,
            evidence ? evidence : null, // Ensure evidence is stored as an array if provided
        ]);

        console.log("✅ Crime report successfully inserted:", result.rows[0]);

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
router.get("/status", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM crime_reports ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error fetching crime reports:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;

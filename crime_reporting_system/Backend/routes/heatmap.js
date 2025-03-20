import express from "express";
import pool from "../db.js"; // Ensure the database connection is configured

const router = express.Router();

// ✅ Route to fetch heatmap data
router.get("/heatmap", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT latitude, longitude FROM crime_statistics WHERE latitude IS NOT NULL AND longitude IS NOT NULL"
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No crime data available for heatmap" });
        }

        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error fetching heatmap data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


export default router;

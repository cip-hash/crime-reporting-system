import express from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db.js"; // Ensure database connection is properly imported

const router = express.Router();

// ✅ Get all police officers from the database
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name, email FROM users WHERE role = 'police'");
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching police list:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Add a new police officer to the database
router.post("/add", async (req, res) => {
    try {
        const { name, email, password, district, subdivision } = req.body;

        if (!name || !email || !password || !district || !subdivision) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const hashpassword = await bcrypt.hash(password, 10);
        // Insert into PostgreSQL
        const newPolice = await pool.query(
            "INSERT INTO police (name, email, password, district,subdivision) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email",
            [name, email, hashpassword, district, subdivision ] // NOTE: Hash passwords before saving in production!
        );

        res.status(201).json({ message: "Police added successfully", data: newPolice.rows[0] });
    } catch (error) {
        console.error("Error adding police:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Remove a police officer from the database
router.delete("/remove/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        const result = await pool.query("DELETE FROM users WHERE id = $1 AND role = 'police' RETURNING *", [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Police officer not found" });
        }

        res.json({ message: "Police removed successfully" });
    } catch (error) {
        console.error("Error removing police:", error);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/get_complaints", async (req, res) => {
    try {
        const { district, subdivision } = req.query;
        // console.log("hi",district,subdivision);
        if (!district || !subdivision) {
            return res.status(400).json({ error: "District and subdivision are required" });
        }
        const query = `SELECT * FROM complaints WHERE district = $1 AND subdivision = $2 ORDER BY date DESC, time DESC;`;
        const result = await pool.query(query, [district, subdivision]);
        res.json(result.rows);
        // console.log(result.rows);
    } catch (error) {
        console.error("Error fetching complaints:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/update_complaint_status/:complaintId", async (req, res) => {
    const { complaintId } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ error: "Status is required" });
    }

    try {
        // Check if complaint exists and get its details
        const complaintResult = await pool.query(
            "SELECT * FROM complaints WHERE complaint_id = $1",
            [complaintId]
        );

        if (complaintResult.rows.length === 0) {
            return res.status(404).json({ error: "Complaint not found" });
        }

        const complaint = complaintResult.rows[0];
        const subdivision = complaint.subdivision;
        const crime_type=complaint.incident_type; // Extract subdivision & crime_type from complaint
        console.log("complaint",subdivision,crime_type);
        // Update the complaint status
        await pool.query(
            "UPDATE complaints SET status = $1 WHERE complaint_id = $2",
            [status, complaintId]
        );
        console.log(status.toLowerCase());
        // If complaint is accepted, update crime_statistics
        if (status.toLowerCase() === "under investigation") {
            console.log("hello");
            const updateCrimeQuery = `
                UPDATE crime_statistics
                SET ${crime_type} = ${crime_type} + 1
                WHERE subdivision = $1
            `;
            await pool.query(updateCrimeQuery, [subdivision]);
        }

        res.json({ message: "Complaint status updated successfully" });
    } catch (error) {
        console.error("Error updating complaint status:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


export default router;

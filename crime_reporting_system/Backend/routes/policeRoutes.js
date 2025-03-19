import express from "express";
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
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Insert into PostgreSQL
        const newPolice = await pool.query(
            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'police') RETURNING id, name, email",
            [name, email, password] // NOTE: Hash passwords before saving in production!
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

export default router;

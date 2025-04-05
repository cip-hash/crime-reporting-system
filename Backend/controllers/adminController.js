import { getUserCount } from "../services/userService.js";
import pool from "../config/db.js";  // PostgreSQL connection
import bcrypt from "bcryptjs";       // For password hashing

export const fetchUserCount = async (req, res) => {
    try {
        const userCount = await getUserCount();
        res.json({ userCount });
    } catch (error) {
        console.error("❌ Error fetching user count:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ✅ Add a new police account
export const addPolice = async (req, res) => {
    try {
        let { name, email, password } = req.body;

        // ✅ Convert email to lowercase to avoid case-sensitive duplicates
        email = email.toLowerCase().trim();

        // ✅ Check if police already exists
        const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "Police with this email already exists" });
        }

        // ✅ Validate password length
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        // ✅ Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Insert police into users table with role = "police"
        const newPolice = await pool.query(
            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
            [name, email, hashedPassword, "police"]
        );

        res.status(201).json({
            message: "Police account created successfully",
            police: newPolice.rows[0], // Return the created police details
        });

    } catch (error) {
        console.error("❌ Error adding police:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ✅ Get all police accounts
export const getPoliceList = async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name, email FROM users WHERE role = 'police'");
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error fetching police list:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ✅ Remove a police account
export const removePolice = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Ensure ID is a valid number
        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid police ID" });
        }

        // ✅ Ensure the police exists before deleting
        const policeExists = await pool.query("SELECT * FROM police WHERE id = $1", [id]);
        if (policeExists.rows.length === 0) {
            return res.status(404).json({ error: "Police account not found" });
        }

        // ✅ Delete police from users table
        await pool.query("DELETE FROM police WHERE id = $1", [id]);

        res.json({ message: "Police account removed successfully" });

    } catch (error) {
        console.error("❌ Error removing police:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

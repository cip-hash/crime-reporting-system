const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Use env for security

// ✅ Register User (Default Role: User)
router.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Ensure only 'user' can register (Police/Admin must be added manually)
    const userRole = role === "admin" || role === "police" ? "user" : role;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
        db.query(query, [name, email, hashedPassword, userRole], (err, result) => {
            if (err) return res.status(500).json({ message: "Error: User may already exist" });

            res.status(201).json({ message: "User registered successfully" });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Login User
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

        res.json({ token, role: user.role });
    });
});

// ✅ Admin Adds a Police Officer
router.post("/add-police", authenticateUser, authorizeRole(["admin"]), (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ message: "Error hashing password" });

        const query = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'police')";
        db.query(query, [name, email, hashedPassword], (err, result) => {
            if (err) return res.status(500).json({ message: "Error adding police officer" });

            res.status(201).json({ message: "Police officer added successfully" });
        });
    });
});

module.exports = router;

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");  // MySQL connection file
require("dotenv").config();

const router = express.Router();

// ✅ User Registration
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Check if user already exists
        const [existingUser] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        await db.promise().query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", 
            [name, email, hashedPassword]);

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error("Registration Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ✅ User Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Check if user exists
        const [user] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
        
        if (user.length === 0) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Compare password
        const validPassword = await bcrypt.compare(password, user[0].password);
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user[0].id, email: user[0].email },
            process.env.JWT_SECRET || "your_secret_key",
            { expiresIn: "1h" }
        );

        res.status(200).json({ message: "Login successful", token });

    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;

import pool from "../config/db.js"; // ✅ Use PostgreSQL database connection
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const register = async ({ name, email, password, role = "user" }) => {
    try {
        console.log("🟢 Registering user:", { name, email, role });

        // Convert email to lowercase to avoid case-sensitive duplicates
        email = email.toLowerCase().trim();

        // Check if user already exists
        const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            console.error("❌ User already exists:", email);
            throw new Error("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("🔒 Hashed password generated");

        const userRole = ["admin", "police"].includes(role) ? role : "user";
        console.log("🔹 Assigned Role:", userRole);

        const query = `
            INSERT INTO users (name, email, password, role) 
            VALUES ($1, $2, $3, $4) RETURNING id, name, email, role;
        `;
        const values = [name, email, hashedPassword, userRole];

        console.log("🟠 Executing Query:", query);
        console.log("📥 Query Values:", values);

        // 🔥 Run query and log result
        const result = await pool.query(query, values);
        console.log("✅ User Registered Successfully:", result.rows[0]);

        return result.rows[0]; // Return the registered user details
    } catch (error) {
        console.error("❌ Error in user registration:", error);
        throw error;
    }
};

const login = async (email, password) => {
    try {
        // Convert email to lowercase to avoid case-sensitive mismatches
        email = email.toLowerCase().trim();

        const query = "SELECT * FROM users WHERE email = $1";
        const { rows } = await pool.query(query, [email]);

        if (rows.length === 0) {
            console.error("❌ Login failed: Email not found", email);
            throw new Error("Invalid email or password");
        }

        const user = rows[0];
        console.log("🔎 User found:", user.email);

        // Ensure password is properly compared
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.error("❌ Login failed: Incorrect password");
            throw new Error("Invalid email or password");
        }

        console.log("✅ Password match successful");

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        return { 
            token, 
            user: { id: user.id, name: user.name, email: user.email, role: user.role } 
        };
    } catch (error) {
        console.error("❌ Error in login:", error);
        throw error;
    }
};

const addPoliceOfficer = async ({ name, email, password }) => {
    try {
        // Convert email to lowercase to avoid case-sensitive duplicates
        email = email.toLowerCase().trim();

        // Check if police officer already exists
        const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            throw new Error("Email already in use");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO users (name, email, password, role) 
            VALUES ($1, $2, $3, 'police') RETURNING id, name, email, role;
        `;
        const values = [name, email, hashedPassword];

        const result = await pool.query(query, values);
        return result.rows[0]; // Return police officer details
    } catch (error) {
        console.error("❌ Error adding police officer:", error);
        throw error;
    }
};

// ✅ Export functions
export { register, login, addPoliceOfficer };

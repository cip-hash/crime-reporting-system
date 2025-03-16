import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet"; // Security headers
import morgan from "morgan"; // Logger
import authRoutes from "./routes/authRoutes.js"; // Ensure .js extension
import pool from "./config/db.js"; // Ensure db.js uses import syntax

dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev")); // Logs HTTP requests
app.use(express.json()); // Replace deprecated bodyParser

// ✅ Test Database Connection (PostgreSQL)
const testDbConnection = async () => {
    try {
        await pool.query("SELECT 1");
        console.log("✅ Connected to PostgreSQL Database");
    } catch (err) {
        console.error("❌ PostgreSQL Connection Failed:", err.message);
    }
};
testDbConnection();

// ✅ Routes
app.use("/api/auth", authRoutes); // Authentication routes

// ✅ Test Route
app.post("/", (req, res) => {
    res.send("🚀 Server is running!");
});

// ✅ 404 Route Handler
app.use((req, res) => {
    res.status(404).json({ message: "❌ Route not found" });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err.message);
    res.status(500).json({ message: err.message || "🔥 Internal Server Error" });
});

app.use((req, res, next) => {
    console.log(`Received ${req.method} request at ${req.url}`);
    next();
});


// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

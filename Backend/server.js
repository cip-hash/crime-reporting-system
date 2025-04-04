import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js"; 
import adminRoutes from "./routes/adminRoutes.js"; 
import policeRoutes from "./routes/policeRoutes.js"; 
import crimeRoutes from "./routes/crimeRoutes.js"; 
import pool from "./config/db.js"; 


dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors({
    origin: "http://localhost:5173", 
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "user-email"],  // Allow `user-email`
    credentials: true
}));


app.use(helmet());
app.use(morgan("dev"));
app.use(express.json()); 

// ✅ Database Connection Test
const testDbConnection = async () => {
    try {
        await pool.query("SELECT 1");
        console.log("✅ Connected to PostgreSQL Database");
    } catch (err) {
        console.error("❌ PostgreSQL Connection Failed:", err.message);
        process.exit(1);
    }
};
testDbConnection();

// ✅ Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/police", policeRoutes);
app.use("/api/crime", crimeRoutes); // ✅ Crime Routes

// ✅ Root Test Route
app.get("/", (req, res) => {
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

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});



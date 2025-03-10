const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const db = require("./config/db"); // Database connection
const authRoutes = require("./routes/authRoutes"); // Import auth routes

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Test Database Connection (Optional)
db.promise().query("SELECT 1")
    .then(() => console.log("✅ Connected to MySQL Database"))
    .catch(err => console.error("❌ Database Connection Failed:", err));

// ✅ Routes
app.use("/api/auth", authRoutes);  // Authentication routes

// ✅ Test Route (Optional)
app.get("/", (req, res) => {
    res.send("Server is running!");
});

// ✅ 404 Route Handler
app.use((req, res) => {
    res.status(404).json({ message: "❌ Route not found" });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err.message);
    res.status(500).json({ message: "🔥 Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

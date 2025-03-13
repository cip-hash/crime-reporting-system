const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Allows up to 10 connections
  queueLimit: 0,
});

// ✅ Test Database Connection (Optional)
db.promise()
  .query("SELECT 1")
  .then(() => console.log("✅ Connected to MySQL Database"))
  .catch((err) => console.error("❌ Database Connection Failed:", err));

module.exports = db;

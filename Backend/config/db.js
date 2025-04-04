import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();





const pool = new Pool({
    // user: process.env.DB_USER,
    // host: process.env.DB_HOST,
    // database: process.env.DB_NAME,
    // password: process.env.DB_PASSWORD,
    // port: process.env.DB_PORT || 5432,
    user:"postgres",
    password:"postgres123@",
    host:"localhost",
    port: 5432,
    database:'crime_reporting_system'
});

pool.connect((err, client, release) => {
    if (err) {
        console.error("❌ PostgreSQL Connection Error:", err.stack);
    } else {
        console.log("✅ PostgreSQL Connected Successfully");
        release();
    }
});

export default pool; // Export using ES module syntax

import pool from "../config/db.js"; // Ensure your db.js also uses ES modules

export const getUserCount = async () => {
    try {
        const result = await pool.query("SELECT COUNT(*) AS count FROM users WHERE role = 'user'");
        const userCount = Number(result.rows[0].count);  // ✅ Ensure it's a number
        console.log("userCount:"+userCount);
        return userCount;
    } catch (error) {
        console.error("Error fetching user count:", error);
        throw error;
    }
};

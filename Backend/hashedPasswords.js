import pool from "./config/db.js"; // Import your database connection
import bcrypt from "bcryptjs";

const updatePolicePasswords = async () => {
    try {
        const { rows: policeUsers } = await pool.query("SELECT id, password FROM users WHERE role = 'police'");

        for (let user of policeUsers) {
            // Skip already hashed passwords (bcrypt hashes are usually 60 chars long)
            if (user.password.length < 60) {  
                const hashedPassword = await bcrypt.hash(user.password, 10);
                
                // Update password in the database
                await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, user.id]);
                console.log(`✅ Updated password for police ID: ${user.id}`);
            } else {
                console.log(`🔹 Police ID: ${user.id} already has a hashed password.`);
            }
        }

        console.log("🔄 Password update process completed!");
    } catch (error) {
        console.error("❌ Error updating passwords:", error);
    } finally {
        pool.end();
    }
};

updatePolicePasswords();

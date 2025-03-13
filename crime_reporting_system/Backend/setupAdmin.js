const bcrypt = require("bcrypt");
const db = require("./config/db");

const adminEmail = "admin123@gmail.com"; 
const adminPassword = "admin123@";   
const adminName = "Admin";

bcrypt.hash(adminPassword, 10, async (err, hashedPassword) => {
  if (err) {
    console.error("Error hashing password:", err);
    return;
  }

  try {
    // Check if the admin already exists
    const [existingAdmin] = await db.promise().execute(
      "SELECT * FROM users WHERE role = ?",
      ["admin"]
    );

    if (existingAdmin.length > 0) {
      // Admin exists, update credentials
      await db.promise().execute(
        "UPDATE users SET name = ?, email = ?, password = ? WHERE role = ?",
        [adminName, adminEmail, hashedPassword, "admin"]
      );
      console.log("✅ Admin user updated successfully!");
    } else {
      // Admin does not exist, insert a new admin
      await db.promise().execute(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [adminName, adminEmail, hashedPassword, "admin"]
      );
      console.log("✅ Admin user created successfully!");
    }
  } catch (error) {
    console.error("❌ Error managing admin user:", error);
  }
});

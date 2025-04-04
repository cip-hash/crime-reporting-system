import bcrypt from "bcrypt";
import pg from "pg";

// PostgreSQL database connection setup
const { Pool } = pg;

// const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "crime_reporting_system",
//   password: "postgres123@",
//   port: 5432, // Default PostgreSQL port
// });
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "crime_reporting_system",
  password: "postgres123@",
  port: 5432, // Default PostgreSQL port
});

const adminEmail = "admin123@gmail.com";
const adminPassword = "admin123@";
const adminName = "Admin";

bcrypt.hash(adminPassword, 10, async (err, hashedPassword) => {
  if (err) {
    console.error("Error hashing password:", err);
    return;
  }

  try {
    const client = await pool.connect(); // Get a client connection

    // Check if the admin already exists
    const result = await client.query("SELECT * FROM users WHERE role = $1", ["admin"]);

    if (result.rows.length > 0) {
      // Admin exists, update credentials
      await client.query(
        "UPDATE users SET name = $1, email = $2, password = $3 WHERE role = $4",
        [adminName, adminEmail, hashedPassword, "admin"]
      );
      console.log("✅ Admin user updated successfully!");
    } else {
      // Admin does not exist, insert a new admin
      await client.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
        [adminName, adminEmail, hashedPassword, "admin"]
      );
      console.log("✅ Admin user created successfully!");
    }

    client.release(); // Release the client connection
  } catch (error) {
    console.error("❌ Error managing admin user:", error);
  }
});

const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, hashedPassword], (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      res.status(201).json({ message: "User registered successfully" });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
      const { email, password } = req.body;

      // 🔍 Check if the user exists
      const userQuery = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

      if (userQuery.rows.length === 0) {
          return res.status(400).json({ message: "User not found. Please register first." });
      }

      const user = userQuery.rows[0];

      // 🔑 Validate password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
          return res.status(401).json({ message: "Invalid email or password." });
      }

      // 🔑 Generate JWT Token
      const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

      res.status(200).json({ message: "Login successful", token, user });

  } catch (error) {
      console.error("🔥 Login Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { registerUser, loginUser };








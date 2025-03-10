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

const loginUser = (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: err.message });

    if (results.length === 0) return res.status(401).json({ message: "Invalid email or password" });

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login successful", token });
  });
};

module.exports = { registerUser, loginUser };

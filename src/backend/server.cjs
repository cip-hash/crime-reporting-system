const {Pool} = require("pg");

const pool= new Pool({
    user:"postgres",
    password:"dbms",
    host:"localhost",
    port: 5432,
    database:'cip' 
})
module.exports=pool;
const express = require("express");
const cors = require("cors");
//const pool = require("./database");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from "uploads" folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up storage location and filename for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Files will be stored in "uploads" folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname); // Unique filename
  }
});

// Set up file filter (optional) for file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type.'), false);
  }
};

// Initialize Multer middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// -----------------------------------
// API to insert complaint and upload files
app.post("/upload_complaint", upload.array('evidenceFiles', 5), async (req, res) => {
  try {
    const {
      complaintId,
      incidentType,
      date,
      time,
      location,
      title,
      description,
      suspectDetails,
      victimDetails,
      witnessDetails
    } = req.body;

    const evidencePaths = req.files.map(file => file.path); // Array of file paths

    // Insert complaint into table
    const newComplaint = await pool.query(
      `INSERT INTO complaints 
      (complaint_id, incident_type, date, time, location, title, description, suspect_details, victim_details, witness_details, evidence_files) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        complaintId,
        incidentType,
        date,
        time,
        location,
        title,
        description,
        suspectDetails,
        victimDetails,
        witnessDetails,
        JSON.stringify(evidencePaths) // store as JSON array
      ]
    );

    res.json({ message: "Complaint submitted successfully!", complaint: newComplaint.rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error, unable to submit complaint." });
  }
});
// -----------------------------------
//POLICEVIEWCOMPLAINTS
// Get all complaints
app.get("/get_complaints", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM complaints ORDER BY date DESC, time DESC");
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  // Update complaint status
  app.put("/update_complaint_status/:complaint_id", async (req, res) => {
    const { complaint_id } = req.params;
    const { status } = req.body;
  
    try {
      await pool.query(
        "UPDATE complaints SET status = $1 WHERE complaint_id = $2",
        [status, complaint_id]
      );
      res.json({ message: "Status updated successfully" });
    } catch (error) {
      console.error("Error updating status:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
//TRACKCOMPLAINT
  app.get('/api/complaints/:complaintId', async (req, res) => {
    const { complaintId } = req.params;
  
    try {
      // Query the complaint with the given ID
      const result = await pool.query('SELECT * FROM complaints WHERE complaint_id = $1', [complaintId]);
  
      // Check if complaint exists
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Complaint not found' });
      }
  
      // Send the complaint data
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching complaint:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

  
  // Server listener
  app.listen(4000, () => {
    console.log("Server running on http://localhost:4000");
  });
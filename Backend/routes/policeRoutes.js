import express from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import fs from "fs";
import csv from "csv-parser";
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import connection from '../config/db.js';
const router = express.Router();
// Add this to the top of your policeRoutes.js file if not already there


// Or if you're using a different pattern, make sure to import your database connection

// For ES modules, we need to recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads', 'evidence');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer with this directory
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// ✅ Get all police officers from the database
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name, email FROM police");
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching police list:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Add a new police officer to the database
router.post("/add", async (req, res) => {
    try {
        const { name, email, password, district, subdivision } = req.body;

        if (!name || !email || !password || !district || !subdivision) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const hashpassword = await bcrypt.hash(password, 10);
        // Insert into PostgreSQL
        const newPolice = await pool.query(
            "INSERT INTO police (name, email, password, district,subdivision) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email",
            [name, email, hashpassword, district, subdivision ] // NOTE: Hash passwords before saving in production!
        );

        res.status(201).json({ message: "Police added successfully", data: newPolice.rows[0] });
    } catch (error) {
        console.error("Error adding police:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Remove a police officer from the database
router.delete("/remove/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        const result = await pool.query("DELETE FROM users WHERE id = $1 AND role = 'police' RETURNING *", [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Police officer not found" });
        }

        res.json({ message: "Police removed successfully" });
    } catch (error) {
        console.error("Error removing police:", error);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/get_complaints", async (req, res) => {
    try {
        const { district, subdivision } = req.query;

        if (!district || !subdivision) {
            return res.status(400).json({ error: "District and subdivision are required" });
        }

        const query = `
            SELECT complaint_id, title, description, incident_type, date, time, district, subdivision, status 
            FROM complaints 
            WHERE district = $1 AND subdivision = $2 
            ORDER BY date DESC, time DESC;
        `;

        const result = await pool.query(query, [district, subdivision]);

        // Hide suspect & victim details for pending complaints
        result.rows = result.rows.map((complaint) => {
            if (complaint.status === "Pending") {
                return {
                    ...complaint,
                    victim_details: "Confidential until accepted",
                    suspect_details: "Confidential until accepted",
                    witness_details: "Confidential until accepted",
                };
            }
            return complaint;
        });

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching complaints:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Updated backend route for updating complaint status
router.put("/update_complaint_status/:complaintId", async (req, res) => {
    const { complaintId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    
    try {
      // Check if complaint exists
      const complaintResult = await pool.query(
        "SELECT * FROM complaints WHERE complaint_id = $1",
        [complaintId]
      );
      
      if (complaintResult.rows.length === 0) {
        return res.status(404).json({ error: "Complaint not found" });
      }
      
      const complaint = complaintResult.rows[0];
      const subdivision = complaint.subdivision;
      let crime_type = complaint.incident_type; // Use let instead of const
      
      if (!crime_type) {
        return res.status(400).json({ error: "Incident type is missing in the complaint" });
      }
      
      crime_type = crime_type.toLowerCase(); // Ensure lowercase
      
      // Update complaint status
      await pool.query(
        "UPDATE complaints SET status = $1 WHERE complaint_id = $2",
        [status, complaintId]
      );
      
      console.log(`Complaint ${complaintId} status updated to: ${status}`);
      
      // If complaint is set to investigation, update crime_statistics
      if (status.toLowerCase() === "under investigation") {
        const updateCrimeQuery = `
          UPDATE crime_statistics
          SET "${crime_type}" = "${crime_type}" + 1
          WHERE subdivision = $1
        `;
        await pool.query(updateCrimeQuery, [subdivision]);
      }
      
      res.json({ message: "Complaint status updated successfully" });
    } catch (error) {
      console.error("Error updating complaint status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });



// This should be in your routes file where other police routes are defined
// In your Express routes file
router.get("/complaint_details/:complaintId", async (req, res) => {
    const { complaintId } = req.params;
    
    try {
      console.log(`Getting details for complaint: ${complaintId}`);
      
      // Get all columns from the complaints table
      const complaintResult = await pool.query(
        `SELECT * FROM complaints WHERE complaint_id = $1`,
        [complaintId]
      );
      
      if (complaintResult.rows.length === 0) {
        console.log(`No complaint found with ID: ${complaintId}`);
        return res.status(404).json({ error: "Complaint not found" });
      }
      
      // Get the complaint data
      const complaintData = complaintResult.rows[0];
      
      // Process the evidence_files field if it exists
      if (complaintData.evidence_files && typeof complaintData.evidence_files === 'string') {
        try {
          complaintData.evidence_files = JSON.parse(complaintData.evidence_files);
        } catch (e) {
          console.warn("Failed to parse evidence_files JSON:", e);
          // Keep as string if parsing fails
        }
      }
      
      // Add a formatted police_station field for convenience
      complaintData.police_station = `${complaintData.district} - ${complaintData.subdivision}`;
      
      console.log("Successfully retrieved complaint details");
      res.json(complaintData);
    } catch (error) {
      console.error("Error fetching complaint details:", error);
      res.status(500).json({ 
        error: "Internal server error",
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });
 
  
  
  // ✅ Route: GET /api/police/find_suspects


router.post("/find_suspects", (req, res) => {
  const { crime_type, identifying_mark, complexion, last_known_address } = req.body;
  const results = [];

  fs.createReadStream("data/Suspect_dataset.csv")
    .pipe(csv())
    .on("data", (row) => {
      const matchCrime = !crime_type || row["Types of Crimes"]?.toLowerCase().includes(crime_type.toLowerCase());
      const matchMark = !identifying_mark || row["Identifying Mark"]?.toLowerCase().includes(identifying_mark.toLowerCase());
      const matchComplexion = !complexion || row["Complexion"]?.toLowerCase().includes(complexion.toLowerCase());
      const matchAddress = !last_known_address || row["Last Known Address"]?.toLowerCase().includes(last_known_address.toLowerCase());

      if (matchCrime && matchMark && matchComplexion && matchAddress) {
        results.push({
          ID: row["ID"],
          Name: row["Name"],
          Gender: row["Gender"],
          Age: row["Age"],
          Height: row["Height"],
          Weight: row["Weight"],
          "Eye Color": row["Eye Color"],
          "Hair Color": row["Hair Color"],
          Complexion: row["Complexion"],
          "Identifying Mark": row["Identifying Mark"],
          Build: row["Build"],
          "Last Known Address": row["Last Known Address"],
          Occupation: row["Occupation"],
          "Previous Convictions": row["Previous Convictions"],
          "Types of Crimes": row["Types of Crimes"],
          "Gang Affiliation": row["Gang Affiliation"]
        });
      }
    })
    .on("end", () => {
      if (results.length === 0) {
        res.json({ message: "No matching suspects found", data: [] });
      } else {
        res.json({ data: results });
      }
    })
    .on("error", (err) => {
      res.status(500).json({ message: "Error reading CSV", error: err.message });
    });
});

// Add these routes to your Express app

// Get notes for a specific complaint
// Get notes for a specific complaint

  // Add a new note
  // Add a new note
  router.get('/complaint_notes/:complaintId', async (req, res) => {
    try {
      const complaintId = req.params.complaintId;
      
      // Query to get notes with officer info
      const query = `
        SELECT n.*, p.name as officer_name 
        FROM investigation_notes n
        LEFT JOIN police p ON n.officer_id = p.id
        WHERE n.complaint_id = $1
        ORDER BY n.created_at DESC
      `;
      
      const result = await pool.query(query, [complaintId]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching notes:', error);
      res.status(500).json({ error: 'Failed to fetch notes' });
    }
  });
  
  // Add a new note
  // Add a new note
  router.post('/add_note', async (req, res) => {
    try {
      const { complaint_id, officer_id, note_text } = req.body;
      
      // Improved validation with specific error messages
      if (!complaint_id) {
        return res.status(400).json({ error: 'Missing complaint_id' });
      }
      
      if (!officer_id) {
        return res.status(400).json({ error: 'Missing officer_id' });
      }
      
      if (!note_text || !note_text.trim()) {
        return res.status(400).json({ error: 'Note text cannot be empty' });
      }
      
      // Only convert officer_id to integer, keep complaint_id as string
      const officerIdInt = parseInt(officer_id, 10);
      
      if (isNaN(officerIdInt)) {
        return res.status(400).json({ error: 'Invalid officer_id format' });
      }
      
      const query = `
        INSERT INTO investigation_notes 
        (complaint_id, officer_id, note_text, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING *
      `;
      
      // Pass complaint_id directly as a string
      const result = await pool.query(query, [complaint_id, officerIdInt, note_text]);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error adding note:', error);
      res.status(500).json({ error: 'Failed to add note: ' + error.message });
    }
  });
  // Update an existing note
  router.put('/update_note/:noteId', async (req, res) => {
    try {
      const noteId = req.params.noteId;
      const { note_text } = req.body;
      
      if (!note_text) {
        return res.status(400).json({ error: 'Note text is required' });
      }
      
      const query = `
        UPDATE investigation_notes
        SET note_text = $1, updated_at = NOW()
        WHERE note_id = $2
        RETURNING *
      `;
      
      const result = await pool.query(query, [note_text, noteId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Note not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating note:', error);
      res.status(500).json({ error: 'Failed to update note' });
    }
  });
  
  // Delete a note
  router.delete('/delete_note/:noteId', async (req, res) => {
    try {
      const noteId = req.params.noteId;
      
      const query = `
        DELETE FROM investigation_notes
        WHERE note_id = $1
        RETURNING *
      `;
      
      const result = await pool.query(query, [noteId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Note not found' });
      }
      
      res.json({ message: 'Note deleted successfully' });
    } catch (error) {
      console.error('Error deleting note:', error);
      res.status(500).json({ error: 'Failed to delete note' });
    }
  });

  // Update an existing note
  router.put('/update_note/:noteId', async (req, res) => {
    try {
      const noteId = req.params.noteId;
      const { note_text } = req.body;
      
      if (!note_text) {
        return res.status(400).json({ error: 'Note text is required' });
      }
      
      const query = `
        UPDATE investigation_notes
        SET note_text = $1, updated_at = NOW()
        WHERE note_id = $2
        RETURNING *
      `;
      
      const result = await pool.query(query, [note_text, noteId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Note not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating note:', error);
      res.status(500).json({ error: 'Failed to update note' });
    }
  });
  
  // Delete a note
  router.delete('/delete_note/:noteId', async (req, res) => {
    try {
      const noteId = req.params.noteId;
      
      const query = `
        DELETE FROM investigation_notes
        WHERE note_id = $1
        RETURNING *
      `;
      
      const result = await pool.query(query, [noteId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Note not found' });
      }
      
      res.json({ message: 'Note deleted successfully' });
    } catch (error) {
      console.error('Error deleting note:', error);
      res.status(500).json({ error: 'Failed to delete note' });
    }
  });


  // Add this new route for handling final reports
  router.post("/final-report", upload.array('evidence', 5), async (req, res) => {
    try {
      const { complaint_id, officer_id, report, final_status, remarks } = req.body;
  
      if (!complaint_id || !officer_id || !report || !final_status) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields"
        });
      }
  
      // Handle multiple evidence files
      let evidence_files = [];
      if (req.files && req.files.length > 0) {
        evidence_files = req.files.map(file => ({
          filename: file.originalname,
          path: file.path,
          mimetype: file.mimetype
        }));
      }
  
      const insertQuery = `
        INSERT INTO final_reports (
          complaint_id,
          officer_id,
          report_text,
          final_status,
          remarks,
          evidence_files
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING report_id
      `;
  
      const result = await pool.query(insertQuery, [
        complaint_id,
        officer_id,
        report,
        final_status,
        remarks,
        JSON.stringify(evidence_files)
      ]);
  
      const report_id = result.rows[0].report_id;
  
      // Update complaint status to "Closed(final_status)"
      const newStatus = `Closed(${final_status})`;
      await pool.query(
        "UPDATE complaints SET status = $1 WHERE complaint_id = $2",
        [newStatus, complaint_id]
      );
  
      console.log(`✅ Final report ${report_id} submitted for complaint ${complaint_id} by officer ${officer_id}`);
      console.log(`🔁 Complaint status updated to: ${newStatus}`);
  
      res.json({
        success: true,
        message: "Final report submitted successfully",
        report_id
      });
  
    } catch (error) {
      console.error("❌ Error submitting final report:", error);
      res.status(500).json({
        success: false,
        error: "Server error while submitting report"
      });
    }
  });

  router.get('/final-report/:complaintId', async (req, res) => {
    try {
      const { complaintId } = req.params;
      console.log(`Fetching final report for complaint ID: ${complaintId}`);
      
      const query = `
        SELECT fr.*, po.name AS officer_name 
        FROM final_reports fr
        LEFT JOIN police po ON fr.officer_id = po.id
        WHERE fr.complaint_id = $1
        ORDER BY fr.created_at DESC
        LIMIT 1
      `;
      
      const result = await pool.query(query, [complaintId]);
      
      if (result.rows.length === 0) {
        console.log(`No final report found for complaint ID: ${complaintId}`);
        return res.status(404).json({ error: 'Final report not found' });
      }
      
      console.log(`Final report found:`, result.rows[0]);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching final report:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
export default router;

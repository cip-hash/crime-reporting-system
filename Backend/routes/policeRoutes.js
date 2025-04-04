import express from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db.js"; // Ensure database connection is properly imported
import fs from "fs";
import csv from "csv-parser";

const router = express.Router();

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

        // If complaint is accepted, update crime_statistics
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



  

export default router;

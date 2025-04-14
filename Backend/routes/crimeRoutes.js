import express from "express";
import pool from "../config/db.js"; // Ensure correct DB config path
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




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

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = express.Router();
// Middleware to parse JSON requests
router.use(express.json());
router.use('/uploads', express.static(path.join(__dirname, 'uploads')));
/**
 * ✅ Fetch all districts from `crime_statistics` table
 */
router.get("/districts", async (req, res) => {
    try {
        const result = await pool.query("SELECT DISTINCT district FROM crime_statistics ORDER BY district");
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No districts found" });
        }
        //console.log(result.rows);
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error fetching districts:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * ✅ Fetch subdivisions based on selected district
 */
router.get("/subdivisions", async (req, res) => {
    try {
        const { district } = req.query;
        
        if (!district) {
            return res.status(400).json({ error: "District parameter is required" });
        }

        console.log(`📌 Fetching subdivisions for district: ${district}`);

        const result = await pool.query(
            "SELECT DISTINCT subdivision FROM crime_statistics WHERE district = $1 ORDER BY subdivision",
            [district]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No subdivisions found for this district" });
        }
        console.log(result.rows);
        res.json(result.rows.map(row => row.subdivision)); // Return only subdivision names
    } catch (error) {
        console.error("❌ Error fetching subdivisions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get('/generate_complaint_id', async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT complaint_id FROM complaints ORDER BY complaint_id DESC LIMIT 1');
  
      let newIdNumber = 1; // default for first entry
      if (rows.length > 0) {
        const lastId = rows[0].complaint_id; // Example: CMP0000000123
        const lastNumber = parseInt(lastId.substring(3), 10); // Extract number part
        newIdNumber = lastNumber + 1;
      }
      const newComplaintId = 'CMP' + String(newIdNumber).padStart(10, '0'); // CMP0000000124
      res.json({ complaintId: newComplaintId });
    } catch (error) {
      console.error('Error generating complaint ID:', error);
      res.status(500).json({ error: 'Failed to generate complaint ID' });
    }
  });
  
/**
 * ✅ Submit a Crime Report (Insert into Database)
 */
router.post("/report", upload.array('evidenceFiles', 5), async (req, res) => {
    console.log("📌 Received Crime Report Data:", req.body);

    const complainantEmail = req.headers["user-email"]; // Fetch email from request headers

    if (!complainantEmail) {
        return res.status(401).json({ error: "Unauthorized: User email not found in request" });
    }

    const {
        complaintId,
        complainantName,
        complainantPhone,
        relationToVictim,
        
        victimName,
        victimPhone,
        victimAgeGender,
        victimRelation,

        incidentType,
        title,
        date,
        time,
        district,
        subdivision,
        exactAddress,
        description,

        suspectName,
        suspectMarks,
        suspectComplexion,
        suspectAddress,

        witnessName,
        witnessContact,
        witnessStatement
    } = req.body;

    const evidencePaths = req.files ? req.files.map(file => file.path) : [];

    // Validate required fields
    if (!complainantName || !complainantPhone || !incidentType || !date || !time || !district || !subdivision || !description || !exactAddress) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const insertQuery = `
            INSERT INTO complaints (
                complaint_id, complainant_name, complainant_phone, complainant_email, relation_to_victim,
                victim_name, victim_phone, victim_age_gender, victim_relation,
                incident_type, title, date, time, district, subdivision, exact_address, description,
                suspect, suspect_marks, suspect_complexion, suspect_address,
                witness, witness_contact, witness_statement,
                evidence_files
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
            RETURNING complaint_id, created_at, status;
        `;

        const result = await pool.query(insertQuery, [
            complaintId, complainantName, complainantPhone, complainantEmail, relationToVictim,
            victimName, victimPhone, victimAgeGender, victimRelation,
            incidentType, title, date, time, district, subdivision, exactAddress, description,
            suspectName, suspectMarks, suspectComplexion, suspectAddress,
            witnessName, witnessContact, witnessStatement,
            JSON.stringify(evidencePaths)
        ]);

        console.log("✅ Crime report inserted:", result.rows[0]);

        res.status(201).json({
            message: "Crime report submitted successfully",
            reportId: result.rows[0].complaint_id,
            createdAt: result.rows[0].created_at,
            status: result.rows[0].status
        });
    } catch (error) {
        console.error("❌ Error inserting crime report:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


/**
 * ✅ Fetch Crime Reports
 */
router.get('/track_complaint/', async (req, res) => {
    const { complaintId,user_email } = req.query;
  
    try {
      // Query the complaint with the given ID
      const result = await pool.query('SELECT * FROM complaints WHERE complaint_id = $1 and complainant_email= $2', [complaintId,user_email]);
      console.log("complaintId:",complaintId);
      // Check if complaint exists
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Complaint not found' });
      }
  
      // Send the complaint data
      res.json(result.rows[0]);
      console.log("res:",result.rows[0]);
    } catch (err) {
      console.error('Error fetching complaint:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
// router.get("/status/:policeId", async (req, res) => {
//     const { policeId } = req.params;

//     try {
//         const roleQuery = `SELECT * FROM police WHERE id = $1`;
//         const roleResult = await pool.query(roleQuery, [policeId]);

//         if (roleResult.rows.length === 0) {
//             return res.status(404).json({ error: "User not found" });
//         }

//         //const userRole = roleResult.rows[0].role;

//         let query;
//         let values;

//         if ( roleResult) {
//             // ✅ Fetch all crime reports for police
//             query = `SELECT id, user_id, incident_type, date, district, subdivision, status FROM complaints`;
//             values = [];
//         } else {
//             // ✅ Fetch only the user's own reports
//             query = `SELECT id, incident_type, date, district, subdivision, status FROM complaints WHERE user_id = $1`;
//             values = [policeId];
//         }

//         const result = await pool.query(query, values);

//         res.json(result.rows);
//     } catch (error) {
//         console.error("❌ Error fetching reports:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

// //Complaint status update
// router.patch("/update-status/:id", async (req, res) => {
//     const { id } = req.params;
//     const { status } = req.body;

//     const validStatuses = ["Pending", "Under Investigation", "Resolved", "Closed"];

//     if (!validStatuses.includes(status)) {
//         return res.status(400).json({ error: "Invalid status value" });
//     }

//     try {
//         const result = await pool.query(
//             "UPDATE crime_reports SET status = $1 WHERE id = $2 RETURNING *",
//             [status, id]
//         );

//         if (result.rows.length === 0) {
//             return res.status(404).json({ error: "Crime report not found" });
//         }

//         res.json({ message: "Status updated successfully", report: result.rows[0] });
//     } catch (error) {
//         console.error("❌ Error updating status:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });



/**
 * ✅ Fetch Crime Statistics (Count by Incident Type)
 */
router.get("/stats", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT incident_type, COUNT(*) AS count 
            FROM crime_reports 
            GROUP BY incident_type
        `);

        const labels = result.rows.map(row => row.incident_type);
        const data = result.rows.map(row => parseInt(row.count));

        res.json({ labels, data });
    } catch (error) {
        console.error("❌ Error fetching crime statistics:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


/**
 * ✅ Fetch Crime Report Locations
 */
router.get("/locations", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM crime_statistics WHERE latitude IS NOT NULL AND longitude IS NOT NULL");
        console.log(result.rows);
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error fetching crime locations:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/latlong", async (req, res) => {
    const { dis, sub } = req.body;
    
    try {
        const result = await pool.query(
            "SELECT  latitude, longitude FROM crime_statistics WHERE district = $1 AND subdivision = $2",
            [dis, sub]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No location found for given district & subdivision" });
        }

        console.log("📍 Location Found:", result.rows[0]);
        res.json(result.rows[0]);  // Return latitude & longitude
        console.log(result.rows[0]);
    } catch (error) {
        console.error("❌ Error fetching lat/lon for:", dis, sub);
        res.status(500).json({ error: "Database error" });
    }
});



//sos

const findNearestPolice = async (lat, lng) => {
    const query = `
        SELECT id, subdivision
        FROM police
        ORDER BY ST_Distance(ST_SetSRID(ST_Point($1, $2), 4326), coordinates) 
        LIMIT 1;
    `;
    const result = await pool.query(query, [lng, lat]);
    return result.rows.length > 0 ? result.rows[0] : null;
};

// ✅ API to send SOS alert
router.post("/sos", async (req, res) => {
    const { user_email, latitude, longitude } = req.body;
    try {
        const policeStation = await findNearestPolice(latitude, longitude);
        if (!policeStation) {
            return res.status(404).json({ message: "No nearby police station found." });
        }

        const locationData = JSON.stringify({ latitude, longitude, timestamp: new Date().toISOString() });

        const insertQuery = `
            INSERT INTO sos_alerts (user_email, locations, police_subdivision, status)
            VALUES ($1, ARRAY[$2::jsonb], $3, 'active') 
            RETURNING id;
        `;
        const newSOS = await pool.query(insertQuery, [user_email, locationData, policeStation.subdivision]);
        console.log("creation:",newSOS.rows[0].id);
        res.json({ message: "SOS Alert Sent!", sos_id: newSOS.rows[0].id });
    } catch (error) {
        console.error("Error creating SOS:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ API to append new location updates
router.put("/sos/:user_email", async (req, res) => {
    const { latitude, longitude } = req.body;
    const { user_email } = req.params;

    try {
        const newLocation = JSON.stringify({ latitude, longitude, timestamp: new Date().toISOString() });

        const updateQuery = `
            UPDATE sos_alerts 
            SET locations = locations || $1::jsonb
            WHERE user_email = $2 AND status = 'active'
            RETURNING id;
        `;
        const updatedSOS = await pool.query(updateQuery, [newLocation, user_email]);
        console.log("updated:",user_email);
        if (updatedSOS.rowCount === 0) {
            return res.status(404).json({ error: "Active SOS not found." });
        }

        res.json({ message: "SOS Location Updated" });
    } catch (error) {
        console.error("Error updating SOS:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ API to stop SOS alert
router.put("/sos/:sosId/stop", async (req, res) => {
    const { sosId } = req.params;

    try {
        const updateQuery = `
            UPDATE sos_alerts 
            SET status = 'inactive'
            WHERE id = $1 AND status = 'active'
            RETURNING id;
        `;
        const updatedSOS = await pool.query(updateQuery, [sosId]);
        console.log("stopped:",sosId);
        if (updatedSOS.rowCount === 0) {
            return res.status(404).json({ error: "Active SOS not found." });
        }

        res.json({ message: "SOS Stopped" });
    } catch (error) {
        console.error("Error stopping SOS:", error);
        res.status(500).json({ error: "Server error" });
    }
});



//user reports
router.get("/final-reports/:user_email", async (req, res) => {
    try {
      const { user_email } = req.params;
  
      const query = `
        SELECT fr.report_id, fr.complaint_id,
               c.title AS complaint_title,
               p.name AS officer_name,
               fr.final_status, fr.remarks,
               fr.report_text, fr.created_at,
               fr.evidence_files
        FROM final_reports fr
        INNER JOIN complaints c ON fr.complaint_id = c.complaint_id
        INNER JOIN police p ON fr.officer_id = p.id
        WHERE TRIM(LOWER(c.complainant_email)) = TRIM(LOWER($1))
        ORDER BY fr.created_at DESC;
      `;
  
      const result = await pool.query(query, [user_email]);
  
      const reports = result.rows.map(report => {
        let evidenceFiles = [];
  
        try {
          evidenceFiles = typeof report.evidence_files === "string"
            ? JSON.parse(report.evidence_files)
            : Array.isArray(report.evidence_files)
              ? report.evidence_files
              : [];
        } catch (e) {
          console.error("Invalid evidence_files JSON:", report.evidence_files);
          evidenceFiles = [];
        }
  
        return {
          ...report,
          evidence_files: evidenceFiles,
        };
      });
  
      res.json(reports);
    } catch (error) {
      console.error("Error fetching final reports:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
export default router;

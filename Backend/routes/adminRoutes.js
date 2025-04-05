import express from "express";
import { fetchUserCount, addPolice, getPoliceList, removePolice } from "../controllers/adminController.js";
import pool from "../config/db.js"; // your Postgres pool
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";

const router = express.Router();

router.get("/user-count", fetchUserCount);

// ✅ Add new police
router.post("/add-police", addPolice);

// ✅ Get all police accounts
router.get("/police-list", getPoliceList);

// ✅ Remove a police account
router.delete("/remove/:id", removePolice);

// adminRoutes.js



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
router.get("/final-reports", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT fr.report_id, fr.complaint_id,
               c.title AS complaint_title,
               p.name AS officer_name,
               fr.final_status, fr.remarks,
               fr.report_text, fr.created_at,
               fr.evidence_files
        FROM final_reports fr
        JOIN complaints c ON fr.complaint_id = c.complaint_id
        JOIN police p ON fr.officer_id = p.id
        ORDER BY fr.created_at DESC;
      `);
  
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
  

// ✅ Download Evidence File
router.get("/download/:fileName", (req, res) => {
    try {
      const fileName = path.basename(req.params.fileName); // Prevent directory traversal
      const filePath = path.join(__dirname, "..", "uploads", "evidence", fileName); // Correct path
  
      console.log("Download request path:", filePath); // Debug
  
      if (fs.existsSync(filePath)) {
        res.download(filePath);
      } else {
        res.status(404).json({ error: "File not found" });
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  
// ✅ Download Full Report as PDF (Optimized Streaming)
router.get("/download-report/:reportId", async (req, res) => {
  const { reportId } = req.params;

  try {
    // Fetch report details from the database
    const result = await pool.query(
      `SELECT fr.*, c.title AS complaint_title, p.name AS officer_name
       FROM final_reports fr
       JOIN complaints c ON fr.complaint_id = c.complaint_id
       JOIN police p ON fr.officer_id = p.id
       WHERE fr.report_id = $1`,
      [reportId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Report not found" });
    }

    const report = result.rows[0];

    // Set response headers for direct PDF streaming
    res.setHeader("Content-Disposition", `attachment; filename=Report_${reportId}.pdf`);
    res.setHeader("Content-Type", "application/pdf");

    // Create a PDF document and stream it directly to response
    const doc = new PDFDocument();
    doc.pipe(res);

    // PDF Content
    doc.fontSize(18).text("Final Report", { align: "center" }).moveDown();
    doc.fontSize(12).text(`Report ID: ${report.report_id}`);
    doc.text(`Complaint Title: ${report.complaint_title || "N/A"}`);
    doc.text(`Complaint ID: ${report.complaint_id}`);
    doc.text(`Officer: ${report.officer_name}`);
    doc.text(`Final Status: ${report.final_status}`);
    doc.text(`Remarks: ${report.remarks || "N/A"}`);
    doc.text(`Report Text: ${report.report_text}`);
    doc.text(`Created At: ${new Date(report.created_at).toLocaleString()}`);

    doc.end();
  } catch (error) {
    console.error("Error generating report PDF:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});




export default router;


import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const FinalReportForm = ({ complaintId, officerId, complaintData, onClose, onSubmitSuccess }) => {
  const [report, setReport] = useState("");
  const [status, setStatus] = useState("Resolved");
  const [remarks, setRemarks] = useState("");
  const [evidence, setEvidence] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [existingReport, setExistingReport] = useState(null);
  const [officerName, setOfficerName] = useState("");
  
  const reportFormRef = useRef(null);

  // Fetch officer name on component mount
  useEffect(() => {
    const fetchOfficerData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/police/officer/${officerId}`);
        if (response.data) {
          setOfficerName(response.data.name);
        }
      } catch (error) {
        console.error("Error fetching officer data:", error);
      }
    };

    // Check if there's an existing report for this complaint
    const fetchExistingReport = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/police/final-report/${complaintId}`);
        if (response.data) {
          setExistingReport(response.data);
          // Pre-fill form if in edit mode and no data already entered
          if (!report) setReport(response.data.report_text);
          if (status === "Resolved") setStatus(response.data.final_status);
          if (!remarks) setRemarks(response.data.remarks || "");
        }
      } catch (error) {
        // It's okay if there's no existing report
        console.log("No existing report found");
      }
    };

    fetchOfficerData();
    fetchExistingReport();
  }, [complaintId, officerId, report, remarks, status]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setEvidence(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate fields
    if (!report.trim()) {
      setErrorMsg("Please enter a report.");
      return;
    }
    
    if (!status) {
      setErrorMsg("Please select a final status.");
      return;
    }
    
    setSuccessMsg("");
    setErrorMsg("");
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("complaint_id", complaintId);
    formData.append("officer_id", officerId);
    formData.append("report", report);
    formData.append("final_status", status);
    formData.append("remarks", remarks);
    
    // Append each file individually with the same field name
    if (evidence.length > 0) {
      evidence.forEach(file => {
        formData.append("evidence", file);
      });
    }
    
    try {
      console.log("Submitting report data:", {
        complaint_id: complaintId,
        officer_id: officerId,
        final_status: status,
        report: report,
        remarks: remarks,
        evidence: evidence.length > 0 ? `${evidence.length} files` : "None"
      });
      
      const response = await axios.post(
        "http://localhost:5000/api/police/submit-final-report",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      console.log("Final report submission response:", response.data);
      
      if (response.data.success) {
        setSuccessMsg("✅ Final report submitted successfully.");
        
        // Also update the complaint status to "Closed(status)"
        await axios.put(`http://localhost:5000/api/police/update_complaint_status/${complaintId}`, {
          status: `Closed(${status})`
        });
        
        // Notify parent component after a brief delay to show success message
        setTimeout(() => {
          onSubmitSuccess();
        }, 1500);
      } else {
        setErrorMsg("❌ Submission failed. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting final report:", error);
      setErrorMsg("❌ Server error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDownloadReport = async () => {
   // Inside handleDownloadReport function, modify how the reportData is accessed:

const handleDownloadReport = async () => {
  if (!report.trim()) {
    alert("Please fill out the report before downloading");
    return;
  }

  setIsDownloading(true);
  
  try {
    // Debug the data to ensure we have what we need
    console.log("Report Data:", existingReport);
    console.log("Current Form Data:", { report, status, remarks });
    
    // Use existingReport data if available, otherwise use current form data
    const reportData = existingReport ? {
      ...existingReport,
      // Make sure report_text is definitely available, fallback to form data
      report_text: existingReport.report_text || report,
      final_status: existingReport.final_status || status,
      remarks: existingReport.remarks || remarks
    } : {
      report_id: "Pending",
      complaint_id: complaintId,
      officer_id: officerId,
      report_text: report, // This is the main field that was showing as undefined
      final_status: status,
      remarks: remarks,
      evidence_files: [],
      created_at: new Date().toISOString(),
      officer_name: officerName
    };

    // Rest of your function remains the same...
   // setIsDownloading(true);
    
    // try {
    //   // Use existing report data if available, otherwise use form data
    //   const reportData = existingReport || {
    //     report_id: "Pending",
    //     complaint_id: complaintId,
    //     officer_id: officerId,
    //     report_text: report,
    //     final_status: status,
    //     remarks: remarks,
    //     evidence_files: [],
    //     created_at: new Date().toISOString(),
    //     officer_name: officerName
    //   };

      // Format evidence files list
      let evidenceFilesList = "";
      if (reportData.evidence_files && reportData.evidence_files.length > 0) {
        try {
          const files = Array.isArray(reportData.evidence_files) 
            ? reportData.evidence_files 
            : JSON.parse(reportData.evidence_files);
          
          if (files.length > 0) {
            evidenceFilesList = files.map(file => {
              const fileName = file.split('/').pop();
              return `<li>${fileName}</li>`;
            }).join('');
          }
        } catch (e) {
          console.error("Error parsing evidence files:", e);
        }
      }

      // Format current evidence selection
      let currentEvidenceList = "";
      if (evidence.length > 0) {
        currentEvidenceList = evidence.map(file => `<li>${file.name}</li>`).join('');
      }

      // Create a formatted version of the report for PDF
      // Inside the HTML template section, make these changes:

const reportDiv = document.createElement('div');
reportDiv.innerHTML = `
  <div style="padding: 20px; font-family: Arial, sans-serif;">
    <h2 style="text-align: center; margin-bottom: 20px;">POLICE FINAL REPORT</h2>
    
    <div style="margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 5px; width: 50%;"><strong>Report ID:</strong> ${reportData.report_id || 'Pending'}</td>
          <td style="padding: 5px; width: 50%;"><strong>Complaint ID:</strong> ${reportData.complaint_id || complaintId}</td>
        </tr>
        <tr>
          <td style="padding: 5px;"><strong>Officer ID:</strong> ${reportData.officer_id || officerId}</td>
          <td style="padding: 5px;"><strong>Officer Name:</strong> ${reportData.officer_name || officerName || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 5px;"><strong>Incident Type:</strong> ${complaintData?.incident_type || 'N/A'}</td>
          <td style="padding: 5px;"><strong>Date Filed:</strong> ${complaintData?.date ? formatDate(complaintData.date) : 'N/A'}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 5px;"><strong>Final Status:</strong> ${reportData.final_status || status}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 5px;"><strong>Report Created On:</strong> ${formatDate(reportData.created_at || new Date().toISOString())}</td>
        </tr>
      </table>
    </div>
    
    <div style="margin-bottom: 20px;">
      <h3 style="margin-bottom: 10px;">Final Report</h3>
      <p style="white-space: pre-wrap;">${reportData.report_text || report}</p>
    </div>
    
    ${(reportData.remarks || remarks) ? `
      <div style="margin-bottom: 20px;">
        <h3 style="margin-bottom: 10px;">Remarks</h3>
        <p style="white-space: pre-wrap;">${reportData.remarks || remarks}</p>
      </div>
    ` : ''}
    
    <!-- Rest of your template remains the same... -->
          <div style="margin-bottom: 20px;">
            <h3 style="margin-bottom: 10px;">Evidence Files</h3>
            ${evidenceFilesList ? `
              <p><strong>Uploaded Evidence:</strong></p>
              <ul>${evidenceFilesList}</ul>
            ` : '<p>No previously uploaded evidence files.</p>'}
            
            ${currentEvidenceList ? `
              <p><strong>New Evidence Being Submitted:</strong></p>
              <ul>${currentEvidenceList}</ul>
            ` : ''}
            
            ${!evidenceFilesList && !currentEvidenceList ? '<p>No evidence files attached.</p>' : ''}
          </div>
          
          <div style="margin-top: 40px;">
            <p style="text-align: right;">Report Date: ${formatDate(new Date().toISOString())}</p>
            <p style="text-align: right; margin-top: 30px;">_______________________</p>
            <p style="text-align: right;">${reportData.officer_name || officerName || 'Officer'} Signature</p>
            <p style="text-align: right;">ID: ${reportData.officer_id}</p>
          </div>
        </div>
      `;
      
      document.body.appendChild(reportDiv);
      
      // Generate PDF from the temporary div
      const canvas = await html2canvas(reportDiv, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm (210mm)
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Final_Report_${complaintId}.pdf`);
      
      // Remove the temporary div
      document.body.removeChild(reportDiv);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    
    //added
    <div className="bg-white p-6 rounded-lg" ref={reportFormRef}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">📄 Submit Final Report</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕ Close
        </button>
      </div>

      {existingReport && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="font-medium text-yellow-700">
            ⚠️ A final report already exists for this complaint. Created on {formatDate(existingReport.created_at)}.
          </p>
          <p className="text-sm text-yellow-600 mt-1">
            Submitting a new report will update the case records.
          </p>
        </div>
      )}

      {successMsg && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4">{successMsg}</div>}
      {errorMsg && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">{errorMsg}</div>}

      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="font-semibold mb-2">Complaint Information:</h4>
        <p><strong>ID:</strong> {complaintId}</p>
        {complaintData && (
          <>
            <p><strong>Type:</strong> {complaintData.incident_type}</p>
            <p><strong>Date Filed:</strong> {new Date(complaintData.date).toLocaleDateString()}</p>
          </>
        )}
        <p><strong>Officer ID:</strong> {officerId}</p>
        {officerName && <p><strong>Officer Name:</strong> {officerName}</p>}
      </div>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Final Report</label>
          <textarea
            className="w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="6"
            value={report}
            onChange={(e) => setReport(e.target.value)}
            placeholder="Enter your detailed findings and conclusion..."
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Final Status / Closure Reason</label>
          <select
            className="w-full border rounded p-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Resolved">Resolved</option>
            <option value="Dismissed">Dismissed</option>
            <option value="Withdrawn">Withdrawn</option>
            <option value="Transferred">Transferred</option>
            <option value="Unsubstantiated">Unsubstantiated</option>
            <option value="False Complaint">False Complaint</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Remarks (Optional)</label>
          <textarea
            className="w-full border rounded p-3"
            rows="3"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Any additional comments or follow-up recommendations..."
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">
            Upload Evidence (Optional)
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            multiple
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
          />
          <p className="text-xs text-gray-500 mt-1">
            Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max: 10MB each)
          </p>
          
          {/* Display selected files */}
          {evidence.length > 0 && (
            <div className="mt-2">
              <p className="font-medium text-gray-700">Selected Files ({evidence.length}):</p>
              <ul className="list-disc pl-5 mt-1">
                {evidence.map((file, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Display existing evidence files if any */}
          {existingReport && existingReport.evidence_files && (
            <div className="mt-3 p-3 bg-gray-50 rounded">
              <p className="font-medium text-gray-700">Previously Uploaded Evidence:</p>
              {typeof existingReport.evidence_files === 'string' 
                ? (
                  <div className="mt-1">
                    {JSON.parse(existingReport.evidence_files).length > 0 ? (
                      <ul className="list-disc pl-5">
                        {JSON.parse(existingReport.evidence_files).map((filePath, idx) => (
                          <li key={idx} className="text-sm text-gray-600">
                            {filePath.split('/').pop()}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No files uploaded previously</p>
                    )}
                  </div>
                )
                : Array.isArray(existingReport.evidence_files) && existingReport.evidence_files.length > 0 ? (
                  <ul className="list-disc pl-5 mt-1">
                    {existingReport.evidence_files.map((filePath, idx) => (
                      <li key={idx} className="text-sm text-gray-600">
                        {filePath.split('/').pop()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">No files uploaded previously</p>
                )
              }
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 justify-between mt-6">
          <button
            type="button"
            onClick={handleDownloadReport}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center"
            disabled={isDownloading || !report.trim()}
          >
            {isDownloading ? "Generating..." : "⬇️ Download as PDF"}
          </button>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Final Report"}
            </button>
          </div>
        </div>
        
      </form>
    </div>
  );
};
}

export default FinalReportForm;
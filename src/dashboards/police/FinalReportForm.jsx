import React, { useState } from "react";
import axios from "axios";

const FinalReportForm = ({ complaintId, complaintTitle, onClose, onSubmitSuccess }) => {
  const [finalStatus, setFinalStatus] = useState("");
  const [report, setReport] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const policeOfficerId = sessionStorage.getItem("policeid");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!finalStatus) {
      setError("Please select a final status");
      return;
    }
    
    if (!report.trim()) {
      setError("Final report cannot be empty");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError("");
      
      console.log("Submitting final report for complaint:", complaintId);
      
      const reportData = {
        complaint_id: complaintId,
        officer_id: parseInt(policeOfficerId, 10),
        final_status: finalStatus,
        report: report,
        remarks: remarks.trim() || null
      };
      
      console.log("Final report data being sent:", reportData);
      
      const response = await axios.post(
        "http://localhost:5000/api/police/final-report",
        reportData
      );
      
      console.log("Final report submission response:", response.data);
      
      // Update the complaint status to closed with reason
      await axios.put(`http://localhost:5000/api/police/update_complaint_status/${complaintId}`, {
        status: `Closed(${finalStatus})`,
      });
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      
    } catch (error) {
      console.error("Error submitting final report:", error);
      
      if (error.response && error.response.data && error.response.data.error) {
        setError(`Submission failed: ${error.response.data.error}`);
      } else {
        setError("Failed to submit final report. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Complaint ID:
        </label>
        <input
          type="text"
          value={complaintId}
          disabled
          className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Complaint Title:
        </label>
        <input
          type="text"
          value={complaintTitle}
          disabled
          className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Officer ID:
        </label>
        <input
          type="text"
          value={policeOfficerId}
          disabled
          className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Final Status: <span className="text-red-500">*</span>
        </label>
        <select
          value={finalStatus}
          onChange={(e) => setFinalStatus(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
          required
        >
          <option value="">-- Select Final Status --</option>
          <option value="Case Solved">Case Solved</option>
          <option value="Case Unsolved">Case Unsolved</option>
          <option value="False Report">False Report</option>
          <option value="Lack of Evidence">Lack of Evidence</option>
          <option value="Complainant Withdrew">Complainant Withdrew</option>
          <option value="Transferred">Transferred to Another Department</option>
          <option value="Other">Other (Specify in Remarks)</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Final Report: <span className="text-red-500">*</span>
        </label>
        <textarea
          value={report}
          onChange={(e) => setReport(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
          rows="8"
          placeholder="Provide a detailed final report of the investigation..."
          required
        ></textarea>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Remarks:
        </label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
          rows="4"
          placeholder="Any additional comments or special notes (optional)"
        ></textarea>
      </div>
      
      <div className="flex justify-end space-x-3 pt-3 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Final Report"}
        </button>
      </div>
    </form>
  );
};

export default FinalReportForm;
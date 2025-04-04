import React, { useEffect, useState } from "react";
import { FiDownload } from "react-icons/fi";

const FinalReports = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/final-reports");
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error("Error fetching final reports:", err);
      }
    };
    fetchReports();
  }, []);

  const handleDownloadEvidence = (fileName) => {
    window.open(`http://localhost:5000/api/admin/download/${fileName}`, "_blank");
  };

  const handleDownloadReport = (reportId) => {
    window.open(`http://localhost:5000/api/admin/download-report/${reportId}`, "_blank");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Final Reports</h2>
      {reports.length === 0 ? (
        <p className="text-gray-600">No reports found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-blue-100 text-left">
                <th className="py-2 px-4">Report ID</th>
                <th className="py-2 px-4">Complaint ID</th>
                {/* <th className="py-2 px-4">Complaint Title</th> */}
                <th className="py-2 px-4">Officer</th>
                <th className="py-2 px-4">Final Status</th>
                <th className="py-2 px-4">Remarks</th>
                <th className="py-2 px-4">Evidence</th>
                <th className="py-2 px-4">Created At</th>
                <th className="py-2 px-4">Download Report</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.report_id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{report.report_id}</td>
                  <td className="py-2 px-4">{report.complaint_id}</td>
                  {/* <td className="py-2 px-4">{report.complaint_title || "N/A"}</td> */}
                  <td className="py-2 px-4">{report.officer_name}</td>
                  <td className="py-2 px-4">{report.final_status}</td>
                  <td className="py-2 px-4">{report.remarks || "N/A"}</td>
                  <td className="py-2 px-4">
  {Array.isArray(report.evidence_files) && report.evidence_files.length > 0 ? (
    report.evidence_files.map((file, i) =>
      file.filename ? (
        <a
          key={i}
          href={`http://localhost:5000/api/admin/download/${file.filename}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline flex items-center space-x-1"
        >
          <FiDownload />
          <span>{file.originalname || file.filename}</span>
        </a>
      ) : (
        <span key={i} className="text-red-500">Invalid file</span>
      )
    )
  ) : (
    "None"
  )}
</td>


                  <td className="py-2 px-4">{new Date(report.created_at).toLocaleDateString()}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleDownloadReport(report.report_id)}
                      className="text-green-600 hover:underline flex items-center space-x-1"
                    >
                      <FiDownload />
                      <span>Download PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FinalReports;

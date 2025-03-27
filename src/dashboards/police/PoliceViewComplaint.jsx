import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const PoliceViewComplaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const complaintRef = useRef(null);

  const policeDistrict = sessionStorage.getItem("policedistrict");
  const policeSubdivision = sessionStorage.getItem("policesubdivision");

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (complaintRef.current && !complaintRef.current.contains(event.target)) {
        setSelectedComplaintId(null); // Close the selected complaint only if clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchComplaints = async () => {
    if (!policeDistrict || !policeSubdivision) {
      setError("District or subdivision not found. Please log in again.");
      return;
    }
    try {
      const response = await axios.get("http://localhost:5000/api/police/get_complaints", {
        params: { district: policeDistrict, subdivision: policeSubdivision },
      });
      setComplaints(response.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch complaints. Try again later.");
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId) => {
    let selectedStatus = status[complaintId];
    if (!selectedStatus) {
      alert("Please select a status to update.");
      return;
    }
    if (selectedStatus === "Accepted") {
      selectedStatus = "Under Investigation";
    }
    try {
      await axios.put(`http://localhost:5000/api/police/update_complaint_status/${complaintId}`, {
        status: selectedStatus,
      });
      alert("Status updated successfully!");

      setComplaints((prevComplaints) =>
        prevComplaints.map((c) =>
          c.complaint_id === complaintId ? { ...c, status: selectedStatus } : c
        )
      );

      setStatus((prev) => ({ ...prev, [complaintId]: "" }));
    } catch (error) {
      alert("Failed to update status.");
    }
  };

  const getNextStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case "Pending":
        return ["Accepted", "Rejected"];
      case "Under Investigation":
        return ["Closed"];
      default:
        return [];
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-4">Police Complaint Dashboard</h1>
      {loading ? (
        <p className="text-center">Loading complaints...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : complaints.length === 0 ? (
        <p className="text-center text-gray-500">No complaints found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {complaints.map((c) => (
            <div
              key={c.complaint_id}
              className={`p-4 border rounded-lg transition cursor-pointer ${
                selectedComplaintId === c.complaint_id ? "bg-blue-100 border-blue-500" : "bg-gray-100"
              }`}
              onClick={() => setSelectedComplaintId(c.complaint_id)}
            >
              <h4 className="font-semibold">ID: {c.complaint_id}</h4>
              <p>Type: {c.incident_type}</p>
              {selectedComplaintId === c.complaint_id && (
                <div ref={complaintRef} className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p><b>Date:</b> {new Date(c.date).toLocaleDateString()}</p>
                  <p><b>Time:</b> {c.time}</p>
                  <p><b>District:</b> {c.district}</p>
                  <p><b>Subdivision:</b> {c.subdivision}</p>
                  <p><b>Description:</b> {c.description}</p>
                  {c.evidence_files && c.evidence_files.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold">Evidence Files:</p>
                      <ul className="list-disc list-inside">
                        {c.evidence_files.map((file, index) => (
                          <li key={index}>
                            <a
                              href={`http://localhost:5173/backend/${file.replace("\\", "/")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline hover:text-blue-800"
                            >
                              {file.split("\\").pop()}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-4">
                    <p><b>Current Status:</b> {c.status === "Accepted" ? "Under Investigation" : c.status}</p>
                    {getNextStatusOptions(c.status).length > 0 && (
                      <>
                        <label className="block mt-2 font-medium">Update Status:</label>
                        <select
                          className="w-full p-2 border rounded-lg mt-1"
                          value={status[c.complaint_id] || ""}
                          onChange={(e) => setStatus((prev) => ({ ...prev, [c.complaint_id]: e.target.value }))}
                        >
                          <option value="">Select Status</option>
                          {getNextStatusOptions(c.status).map((option, idx) => (
                            <option key={idx} value={option}>{option}</option>
                          ))}
                        </select>
                        <button
                          className="w-full mt-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800"
                          onClick={() => handleStatusUpdate(c.complaint_id)}
                        >
                          Update Status
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PoliceViewComplaint;

import React, { useState } from "react";
import axios from "axios";
const TrackStatus = () => {
  const [complaintId, setComplaintId] = useState("");
  const [complaintData, setComplaintData] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!complaintId) {
      setError("Please enter a valid Complaint ID.");
      return;
    }

    try {
      const user_email=sessionStorage.getItem("user_email");
      const res = await axios.get(`http://localhost:5000/api/crime/track_complaint`,{
        params: { // ✅ Pass as query parameters
          complaintId: complaintId,
          user_email: user_email
      }
      });
      
      setComplaintData(res.data);
      console.log(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching complaint:", err);
      setError("No complaint found with this ID. Please check and try again.");
      setComplaintData(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-5 mt-10 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6">Track Your Complaint</h1>

      <input
        type="text"
        placeholder="Enter Complaint ID (e.g., CMP654321123)"
        value={complaintId}
        onChange={(e) => setComplaintId(e.target.value)}
        className="border p-3 rounded-lg w-full mb-4"
      />

      <button onClick={handleSearch}
        className="bg-blue-600 text-white p-3 rounded-lg w-full font-semibold hover:bg-blue-700 transition"
      >
        Track Complaint
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {complaintData && (
        <div className="mt-6 p-5 bg-gray-100 rounded-lg space-y-3">
          <h2 className="text-xl font-semibold text-center">Complaint Details</h2>
          <p><b>Complaint ID:</b> {complaintData.complaint_id}</p>
          <p><b>Incident Type:</b> {complaintData.incident_type}</p>
          {complaintData.title && <p><b>Title:</b> {complaintData.title}</p>}
          <p><b>Date:</b> {new Date(complaintData.date).toLocaleDateString()}</p>
          <p><b>Time:</b> {complaintData.time}</p>
          <p><b>District:</b> {complaintData.district}</p>
          <p><b>Subdivision:</b> {complaintData.subdivision}</p>
          <p><b>Description:</b> {complaintData.description}</p>
          {complaintData.suspect_details && <p><b>Suspect Details:</b> {complaintData.suspect_details}</p>}
          {complaintData.victim_details && <p><b>Victim Details:</b> {complaintData.victim_details}</p>}
          {complaintData.witness_details && <p><b>Witness Details:</b> {complaintData.witness_details}</p>}
          
          {/* Show evidence files if available */}
          {complaintData.evidence_files && complaintData.evidence_files.length > 0 && (
            <div>
              <p><b>Evidence Files:</b></p>
              <ul className="list-disc ml-6">
                {complaintData.evidence_files.map((file, index) => (
                  <li key={index}>
                    <a href={`http://localhost:5173/backend/${file}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      {file.split("\\").pop()}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p><b>Status:</b> <span className={`font-bold ${complaintData.status === "Pending" ? 'text-yellow-600' : 'text-green-600'}`}>{complaintData.status}</span></p>
        </div>
      )}
    </div>
  );
};

export default TrackStatus;
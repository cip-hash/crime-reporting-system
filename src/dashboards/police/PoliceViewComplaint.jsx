import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";



const PoliceViewComplaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [complaintDetails, setComplaintDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const complaintRef = useRef(null);

  const navigate = useNavigate();


  //for crime suspect
  const [crimeTypeInput, setCrimeTypeInput] = useState("");
  const [markInput, setMarkInput] = useState("");
  const [complexionInput, setComplexionInput] = useState("");
  const [addressInput, setAddressInput] = useState("");

  const policeDistrict = sessionStorage.getItem("policedistrict");
  const policeSubdivision = sessionStorage.getItem("policesubdivision");
  

  useEffect(() => {
    fetchComplaints();
  }, [refreshKey]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (complaintRef.current && !complaintRef.current.contains(event.target)) {
        setSelectedComplaintId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch detailed complaint info when selected complaint is under investigation
  useEffect(() => {
    if (selectedComplaintId) {
      const selectedComplaint = complaints.find(c => c.complaint_id === selectedComplaintId);
      if (selectedComplaint && selectedComplaint.status === "Under Investigation") {
        fetchComplaintDetails(selectedComplaintId);
      } else {
        setComplaintDetails(null);
        setDetailsError(null);
      }
    }
  }, [selectedComplaintId, complaints]);

  const fetchComplaints = async () => {
    if (!policeDistrict || !policeSubdivision) {
      setError("District or subdivision not found. Please log in again.");
      setLoading(false);
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
      console.error("Error fetching complaints:", error);
    }
  };

  const fetchComplaintDetails = async (complaintId) => {
    try {
      setDetailsLoading(true);
      setDetailsError(null);
      
      console.log(`Fetching details for complaint: ${complaintId}`);
      
      const response = await axios.get(`http://localhost:5000/api/police/complaint_details/${complaintId}`);
      
      console.log("Response data:", response.data);
      setComplaintDetails(response.data);
      setDetailsLoading(false);
    } catch (error) {
      setDetailsLoading(false);
      setDetailsError("Failed to fetch complaint details. Please try again.");
      
      console.error("Error fetching complaint details:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Request error:", error.message);
      }
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    if (!newStatus) {
      alert("Please select a status before updating.");
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/police/update_complaint_status/${complaintId}`, {
        status: newStatus,
      });
      alert(`Status updated to "${newStatus}" successfully!`);
      setRefreshKey((prev) => prev + 1);
      
      // If status is being updated to "Under Investigation", fetch details immediately
      if (newStatus === "Under Investigation") {
        fetchComplaintDetails(complaintId);
      }
    } catch (error) {
      alert("Failed to update status.");
      console.error("Error updating status:", error);
    }
  };

  const handleStartInvestigation = async (complaintId) => {
    await handleStatusUpdate(complaintId, "Under Investigation");
  };

  // In React

  const getNextStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case "Pending":
        return ["Accepted", "Rejected"];
      case "Accepted":
        return ["Under Investigation"];
      case "Under Investigation":
        return ["Closed"];
      default:
        return [];
    }
  };

  // Helper function to check if a field exists and is not null/empty
  const hasValue = (obj, field) => {
    return obj && obj[field] !== null && obj[field] !== undefined && obj[field] !== "";
  };

  const renderDetailedInvestigation = (complaint) => {
    if (complaint.status !== "Under Investigation") {
      return null;
    }

    if (detailsLoading) {
      return (
        <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-center">Loading investigation details...</p>
        </div>
      );
    }

    if (detailsError) {
      return (
        <div className="mt-4 bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-center text-red-600">{detailsError}</p>
          <button 
            className="w-full mt-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800"
            onClick={() => fetchComplaintDetails(complaint.complaint_id)}
          >
            Retry
          </button>
        </div>
      );
    }

    if (!complaintDetails) {
      return (
        <div className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-center">No investigation details available.</p>
        </div>
      );
    }

    // Merge data from complaint and complaintDetails to ensure we have all the information
    const mergedData = { ...complaint, ...complaintDetails };

    return (
      <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-lg font-bold mb-3">Investigation Details</h3>
        <p><b>Police Station:</b> {mergedData.police_station || `${mergedData.district} - ${mergedData.subdivision}`}</p>
        <p><b>Case Title:</b> {mergedData.title || mergedData.incident_type}</p>
        
        <div className="mt-3 p-3 bg-white rounded border">
          <h4 className="font-bold text-md mb-2">Case Information:</h4>
          
          {/* Complainant Information Section */}
          <div className="mb-3">
            <p className="font-medium text-gray-700">Complainant Information:</p>
            {hasValue(mergedData, 'complainant_name') && <p><b>Name:</b> {mergedData.complainant_name}</p>}
            {hasValue(mergedData, 'complainant_phone') && <p><b>Phone:</b> {mergedData.complainant_phone}</p>}
            {hasValue(mergedData, 'complainant_email') && <p><b>Email:</b> {mergedData.complainant_email}</p>}
            {hasValue(mergedData, 'relation_to_victim') && <p><b>Relation to Victim:</b> {mergedData.relation_to_victim}</p>}
          </div>
          
          {/* Incident Details Section */}
          <div className="mb-3">
            <p className="font-medium text-gray-700">Incident Details:</p>
            <p><b>Incident Type:</b> {mergedData.incident_type}</p>
            {hasValue(mergedData, 'exact_address') && <p><b>Location:</b> {mergedData.exact_address}</p>}
            <p><b>Description:</b> {mergedData.description}</p>
          </div>
          
          {/* Suspect Information Section - Only show if any suspect field has data */}
          {(hasValue(mergedData, 'suspect') || hasValue(mergedData, 'suspect_marks') || 
            hasValue(mergedData, 'suspect_complexion') || hasValue(mergedData, 'suspect_address')) && (
            <div className="mb-3">
              <p className="font-medium text-gray-700">Suspect Details:</p>
              {hasValue(mergedData, 'suspect') && <p>{mergedData.suspect}</p>}
              {hasValue(mergedData, 'suspect_marks') && <p><b>Identifying Marks:</b> {mergedData.suspect_marks}</p>}
              {hasValue(mergedData, 'suspect_complexion') && <p><b>Complexion:</b> {mergedData.suspect_complexion}</p>}
              {hasValue(mergedData, 'suspect_address') && <p><b>Address:</b> {mergedData.suspect_address}</p>}
            </div>
          )}
          
          {/* Victim Information Section - Only show if any victim field has data */}
          {(hasValue(mergedData, 'victim_name') || hasValue(mergedData, 'victim_phone') || 
            hasValue(mergedData, 'victim_age_gender') || hasValue(mergedData, 'victim_relation') || 
            hasValue(mergedData, 'victim_details')) && (
            <div className="mb-3">
              <p className="font-medium text-gray-700">Victim Details:</p>
              {hasValue(mergedData, 'victim_name') && <p><b>Name:</b> {mergedData.victim_name}</p>}
              {hasValue(mergedData, 'victim_phone') && <p><b>Phone:</b> {mergedData.victim_phone}</p>}
              {hasValue(mergedData, 'victim_age_gender') && <p><b>Age/Gender:</b> {mergedData.victim_age_gender}</p>}
              {hasValue(mergedData, 'victim_relation') && <p><b>Relation:</b> {mergedData.victim_relation}</p>}
              {hasValue(mergedData, 'victim_details') && !hasValue(mergedData, 'victim_name') && <p>{mergedData.victim_details}</p>}
            </div>
          )}
          
          {/* Witness Information Section - Only show if any witness field has data */}
          {(hasValue(mergedData, 'witness') || hasValue(mergedData, 'witness_contact') || 
            hasValue(mergedData, 'witness_statement')) && (
            <div className="mb-3">
              <p className="font-medium text-gray-700">Witness Details:</p>
              {hasValue(mergedData, 'witness') && <p>{mergedData.witness}</p>}
              {hasValue(mergedData, 'witness_contact') && <p><b>Contact:</b> {mergedData.witness_contact}</p>}
              {hasValue(mergedData, 'witness_statement') && <p><b>Statement:</b> {mergedData.witness_statement}</p>}
            </div>
          )}
          
          {/* Evidence Files Section - Only show if there are files */}
          {mergedData.evidence_files && Array.isArray(mergedData.evidence_files) && mergedData.evidence_files.length > 0 && (
            <div className="mb-3">
              <p className="font-medium text-gray-700">Evidence Files:</p>
              <ul className="list-disc list-inside pl-2">
                {mergedData.evidence_files.map((file, index) => (
                  <li key={index}>
                    <a
                      href={`http://localhost:5173/backend/${file.replaceAll("\\", "/")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {file.split("/").pop()}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="mt-3">
          <h4 className="font-bold text-md">Investigation Actions:</h4>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
           onClick={() => navigate("/police/suspect-finder")}
            className="bg-blue-600 text-white py-2 px-4 rounded mt-4">
            Find Suspects
            </button>

            <button 
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-800"
              onClick={() => alert("Feature coming soon: This will allow adding investigation notes")}
            >
              Add Notes
            </button>
          </div>
        </div>
      </div>
    );
  };
  const handleGetSuspects = async () => {
    const payload = {
      crime_type: crimeTypeInput,
      identifying_mark: markInput,
      complexion: complexionInput,
      last_known_address: addressInput,
    };
  
    try {
      const response = await axios.post("http://localhost:5000/api/police/find_suspects", payload);
      const suspects = response.data.data;
      if (suspects.length > 0) {
        // Display suspects
      } else {
        alert("No matching suspects found.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong while fetching suspects.");
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
              <p className={`font-medium ${
                c.status === "Under Investigation" ? "text-blue-600" : 
                c.status === "Closed" ? "text-green-600" : 
                c.status === "Rejected" ? "text-red-600" : "text-gray-600"
              }`}>
                Status: {c.status}
              </p>
              
              {selectedComplaintId === c.complaint_id && (
                <div ref={complaintRef} className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {/* Always show basic information */}
                  <p><b>Date:</b> {new Date(c.date).toLocaleDateString()}</p>
                  <p><b>Time:</b> {c.time}</p>
                  <p><b>District:</b> {c.district}</p>
                  <p><b>Subdivision:</b> {c.subdivision}</p>
                  <p><b>Description:</b> {c.description}</p>
                  
                  {/* Render investigation details if status is "Under Investigation" */}
                  {renderDetailedInvestigation(c)}

                  <div className="mt-4">
                    <p><b>Current Status:</b> {c.status}</p>
                    
                    {c.status === "Accepted" && (
                      <button
                        className="w-full mt-2 p-2 bg-green-600 text-white rounded-lg hover:bg-green-800"
                        onClick={() => handleStartInvestigation(c.complaint_id)}
                      >
                        Start Investigation
                      </button>
                    )}

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
                          onClick={() => handleStatusUpdate(c.complaint_id, status[c.complaint_id])}
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
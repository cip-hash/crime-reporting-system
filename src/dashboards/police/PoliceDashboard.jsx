import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import {FiMap} from "react-icons/fi";
import PoliceHeatmap from "./PoliceHeatmap";
const PoliceDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [selectedComplaintId, setSelectedComplaintId] = useState(null);
    const [status, setStatus] = useState({});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // ✅ Get logged-in police details from localStorage
    const policeUser = JSON.parse(localStorage.getItem("loggedInUser"));
    console.log("policeuser:",policeUser);
    const policeDistrict = sessionStorage.getItem("policedistrict");
    const policeSubdivision = sessionStorage.getItem("policesubdivision");
    const location = useLocation();
    const isActive = (path) => {
        return location.pathname.includes(path) ? "bg-blue-700 text-white" : "";
    };
    useEffect(() => {
        fetchComplaints();
    }, []);

    // ✅ Fetch complaints for logged-in police officer's subdivision
    const fetchComplaints = async () => {
        if (!policeDistrict || !policeSubdivision) {
            setError("District or subdivision not found. Please log in again.");
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5000/api/crime/status`, {
                params: { district: policeDistrict, subdivision: policeSubdivision }
            });
            console.log("🟢 Fetched Complaints:", response.data);
            setComplaints(response.data);
        } catch (error) {
            console.error("❌ Error fetching complaints:", error);
            setError("Failed to fetch complaints. Try again later.");
        }
    };

    // ✅ Handle status update
    const handleStatusUpdate = async (complaintId) => {
        if (!status[complaintId]) {
            alert("Please select a status before updating.");
            return;
        }

        setLoading(true);
        try {
            await axios.patch(`http://localhost:5000/api/crime/update-status/${complaintId}`, { 
                status: status[complaintId] 
            });

            // ✅ Update the status in UI
            setComplaints((prevComplaints) =>
                prevComplaints.map((c) =>
                    c.complaint_id === complaintId ? { ...c, status: status[complaintId] } : c
                )
            );
            console.log(`✅ Status updated for ${complaintId}`);
        } catch (error) {
            console.error("❌ Error updating status:", error);
            setError("Failed to update status. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* Header */}
            <h1 className="text-3xl font-bold text-blue-700">🚔 Police Complaint Dashboard</h1>
            {/* District & Subdivision Display */}
            <div className="bg-white shadow-md rounded-lg p-4 my-4">
                <h2 className="text-lg font-semibold text-gray-700">
                    📍 District: <span className="text-blue-600">{policeDistrict}</span> | 🏛 Subdivision: <span className="text-green-600">{policeSubdivision}</span>
                </h2>
            </div>

            {/* Error Message */}
            {error && <p className="text-red-600 font-semibold">{error}</p>}
            <Link 
                            to="/police/heatmap" 
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 ${isActive("/police/heatmap")}`}
                        >
                            <FiMap /> <span>Crime Heatmap</span>
                        </Link>
            {/* Complaints List */}
            {loading ? (
                <p className="text-center">Loading complaints...</p>
            ) : complaints.length === 0 ? (
                <p className="text-center text-gray-500">No complaints found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {complaints.map((c) => (
                        <div
                            key={c.complaint_id}
                            className={`bg-white shadow-md rounded-lg p-4 border ${
                                selectedComplaintId === c.complaint_id ? "border-blue-500" : ""
                            }`}
                            onClick={() =>
                                setSelectedComplaintId(
                                    selectedComplaintId === c.complaint_id ? null : c.complaint_id
                                )
                            }
                        >
                            {/* Summary view */}
                            <h4 className="font-bold">ID: {c.complaint_id}</h4>
                            <p><b>Type:</b> {c.incident_type}</p>

                            {/* Expanded details */}
                            {selectedComplaintId === c.complaint_id && (
                                <div className="mt-2">
                                    {c.title && <p><b>Title:</b> {c.title}</p>}
                                    <p><b>Date:</b> {new Date(c.date).toLocaleDateString()}</p>
                                    <p><b>Time:</b> {c.time}</p>
                                    <p><b>District:</b> {c.district}</p>
                                    <p><b>Subdivision:</b> {c.subdivision}</p>
                                    <p><b>Description:</b> {c.description}</p>
                                    {c.suspect_details && <p><b>Suspect:</b> {c.suspect_details}</p>}
                                    {c.victim_details && <p><b>Victim:</b> {c.victim_details}</p>}
                                    {c.witness_details && <p><b>Witness:</b> {c.witness_details}</p>}

                                    {/* Evidence files */}
                                    {c.evidence_files && c.evidence_files.length > 0 && (
                                        <div className="mt-2">
                                            <p><b>Evidence Files:</b></p>
                                            <ul>
                                                {c.evidence_files.map((file, index) => (
                                                    <li key={index}>
                                                        <a
                                                            href={`http://localhost:4000/${file.replace("\\", "/")}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 underline"
                                                        >
                                                            {file.split("\\").pop()}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Status Section */}
                                    <div className="mt-4">
                                        <p><b>Current Status:</b> {c.status}</p>

                                        {/* Status update options */}
                                        <label className="block mt-2">Update Status:</label>
                                        <select
                                            className="border p-2 rounded w-full"
                                            value={status[c.complaint_id] || ""}
                                            onChange={(e) =>
                                                setStatus((prev) => ({
                                                    ...prev,
                                                    [c.complaint_id]: e.target.value,
                                                }))
                                            }
                                        >
                                            <option value="">Select Status</option>
                                            <option value="Accepted">Accepted</option>
                                            <option value="Rejected">Rejected</option>
                                            <option value="Closed">Closed</option>
                                        </select>

                                        <button
                                            onClick={() => handleStatusUpdate(c.complaint_id)}
                                            className="mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 w-full"
                                            disabled={loading}
                                        >
                                            Update Status
                                        </button>
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

export default PoliceDashboard;

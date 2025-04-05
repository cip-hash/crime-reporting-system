import React, { useState, useEffect } from "react";
import axios from "axios";
import { Send, FileText, LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PoliceHeatmap from "./PoliceHeatmap";
import PoliceViewComplaint from "./PoliceViewComplaint";
import PoliceSos from "./PoliceSos";

const PoliceDashboard = () => {
    const [activeTab, setActiveTab] = useState("report");
    const [complaints, setComplaints] = useState([]);  // Ensure it's an array
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchComplaints = async () => {
            setLoading(true);
            try {
                const district = sessionStorage.getItem("policedistrict");
                const subdivision = sessionStorage.getItem("policesubdivision");
    
                if (!district || !subdivision) {
                    console.error("Missing district or subdivision in session storage");
                    setLoading(false);
                    return;
                }
    
                const response = await axios.get("http://localhost:5000/api/police/get_complaints", {
                    params: { district, subdivision },
                });
    
                console.log("API Response:", response.data); // Debugging line
    
                if (Array.isArray(response.data)) {
                    setComplaints(response.data);
                } else {
                    console.error("Expected an array, but got:", response.data);
                    setComplaints([]);
                }
            } catch (err) {
                console.error("Error fetching complaints:", err);
                setError("Failed to load complaints");
            } finally {
                setLoading(false);
            }
        };
    
        fetchComplaints();
    }, []);
    
    const handleLogout = () => {
        localStorage.removeItem("userToken");
        navigate("/login");
    };

    const policeDistrict = sessionStorage.getItem("policedistrict");
    const policeSubdivision = sessionStorage.getItem("policesubdivision");

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex">
            <div className="w-72 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white p-6 flex flex-col shadow-xl">
                <div className="mb-10 flex items-center">
                    <Shield className="w-8 h-8 mr-3 text-blue-200" />
                    <div>
                        <h1 className="text-2xl font-bold">Crime Reporting</h1>
                        <p className="text-blue-200 text-sm">Police Portal</p>
                    </div>
                </div>
                <nav className="space-y-3 flex-grow">
                    <h3 className="text-xs uppercase text-blue-300 ml-3 mb-3">Main Menu</h3>
                    <button
                        className={`flex items-center p-3 w-full rounded-lg transition-all duration-200 ${
                            activeTab === "report" ? "bg-blue-700 shadow-lg border-l-4 border-blue-400" : "hover:bg-blue-800/50"
                        }`}
                        onClick={() => setActiveTab("report")}
                    >
                        <Send size={18} className="mr-3" /> View Complaints
                    </button>
                    <button
                        className={`flex items-center p-3 w-full rounded-lg transition-all duration-200 ${
                            activeTab === "heatmap" ? "bg-blue-700 shadow-lg border-l-4 border-blue-400" : "hover:bg-blue-800/50"
                        }`}
                        onClick={() => setActiveTab("heatmap")}
                    >
                        <FileText size={18} className="mr-3" /> View Heatmap
                    </button>

                    <button
                        className={`flex items-center p-3 w-full rounded-lg transition-all duration-200 ${
                            activeTab === "sos" ? "bg-blue-700 shadow-lg border-l-4 border-blue-400" : "hover:bg-blue-800/50"
                        }`}
                        onClick={() => setActiveTab("sos")}
                    >
                        <FileText size={18} className="mr-3" /> Sos alerts
                    </button>
                </nav>
                <div className="mt-auto border-t border-blue-700/50 pt-4">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center p-3 w-full rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-100"
                    >
                        <LogOut size={18} className="mr-3" /> Logout
                    </button>
                </div>
            </div>
            <div className="flex-1 p-6">
                <h1 className="text-3xl font-bold text-blue-700">🚔 Police Complaint Dashboard</h1>
                <div className="bg-white shadow-md rounded-lg p-4 my-4">
                    <h2 className="text-lg font-semibold text-gray-700">
                        📍 District: <span className="text-blue-600">{policeDistrict}</span> | 🏛 Subdivision: <span className="text-green-600">{policeSubdivision}</span>
                    </h2>
                </div>
                {error && <p className="text-red-600 font-semibold">{error}</p>}
                {/* {activeTab === "report" && (
                    <div className="bg-white p-4 shadow rounded-lg">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Complaints</h2>
                        {loading ? (
                            <p className="text-gray-600">Loading...</p>
                        ) : (
                            <div className="space-y-4">
                                {(complaints || []).map((complaint) => (
                                    <div key={complaint.complaint_id} className="border rounded-lg p-4 bg-gray-50">
                                        <h3 className="text-lg font-semibold text-blue-700 mb-2">{complaint.title}</h3>
                                        <PoliceViewComplaint complaintId={complaint.complaint_id} />
                                    </div>
                                ))}
                                {complaints.length === 0 && (
                                    <p className="text-gray-500 italic">No complaints found for this district and subdivision.</p>
                                )}
                            </div>
                        )}
                    </div>
                )} */}
                {activeTab === "report" && <PoliceViewComplaint />}
                {activeTab === "heatmap" && <PoliceHeatmap />}
                {activeTab === "sos" && <PoliceSos />}
            </div>
        </div>
    );
};

export default PoliceDashboard;
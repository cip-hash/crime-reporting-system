import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PoliceDashboard = () => {
    const [reports, setReports] = useState([]);
    const [crimeStats, setCrimeStats] = useState({});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(null);

    useEffect(() => {
        fetchReports();
        fetchCrimeStatistics();
    }, []);

    // ✅ Get police user ID from localStorage
    const policeUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const policeId = policeUser ? policeUser.id : null;

    // ✅ Fetch crime reports for police
    const fetchReports = async () => {
        if (!policeId) {
            setError("Police ID not found. Please log in again.");
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5000/api/crime/status/${policeId}`);
            console.log("🟢 Fetched Reports:", response.data);
            setReports(response.data);
        } catch (error) {
            console.error("❌ Error fetching reports:", error);
            setError("Failed to fetch reports. Try again later.");
        }
    };

    // ✅ Fetch crime statistics
    const fetchCrimeStatistics = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/crime/stats");
            console.log("🟢 Fetched Crime Statistics:", response.data);
            setCrimeStats(response.data);
        } catch (error) {
            console.error("❌ Error fetching crime statistics:", error);
            setError("Failed to load crime statistics.");
        }
    };

    // ✅ Handle status update
    const updateStatus = async (id, newStatus) => {
        setLoading(id); // Set loading for this report
        try {
            const response = await axios.patch(`http://localhost:5000/api/crime/update-status/${id}`, { status: newStatus });
            console.log("✅ Status Updated:", response.data);

            // ✅ Update the reports state with new status
            setReports((prevReports) =>
                prevReports.map((report) =>
                    report.id === id ? { ...report, status: newStatus } : report
                )
            );
        } catch (error) {
            console.error("❌ Error updating status:", error);
            setError("Failed to update status. Try again later.");
        } finally {
            setLoading(null); // Remove loading state
        }
    };

    // ✅ Format chart data
    const chartData = {
        labels: crimeStats.labels || [],
        datasets: [
            {
                label: "Number of Crimes",
                data: crimeStats.data || [],
                backgroundColor: "rgba(75,192,192,0.6)",
                borderColor: "rgba(75,192,192,1)",
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* Dashboard Header */}
            <h1 className="text-3xl font-bold text-blue-700">🚔 Police Dashboard</h1>

            {/* Display Errors */}
            {error && <p className="text-red-600 font-semibold mt-2">{error}</p>}

            {/* Crime Statistics Graph */}
            <div className="bg-white shadow-md rounded-lg p-4 my-6">
                <h2 className="text-xl font-semibold">📊 Crime Statistics</h2>
                <Bar data={chartData} />
            </div>

            {/* Crime Reports Table */}
            <div className="bg-white shadow-md rounded-lg p-4">
                <h2 className="text-xl font-semibold">📝 Crime Reports</h2>
                <table className="w-full table-auto border-collapse border border-gray-300 mt-4">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border p-2">ID</th>
                            <th className="border p-2">Incident Type</th>
                            <th className="border p-2">Date</th>
                            <th className="border p-2">District</th>
                            <th className="border p-2">Subdivision</th>
                            <th className="border p-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.length > 0 ? (
                            reports.map((report) => (
                                <tr key={report.id} className="text-center border">
                                    <td className="border p-2">{report.id}</td>
                                    <td className="border p-2">{report.incident_type}</td>
                                    <td className="border p-2">{report.date}</td>
                                    <td className="border p-2">{report.district}</td>
                                    <td className="border p-2">{report.subdivision}</td>
                                    <td className="border p-2">
                                        <select
                                            className="bg-gray-200 border p-1 rounded"
                                            value={report.status}
                                            onChange={(e) => updateStatus(report.id, e.target.value)}
                                            disabled={loading === report.id}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Under Investigation">Under Investigation</option>
                                            <option value="Resolved">Resolved</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center text-gray-600 p-4">
                                    No crime reports found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PoliceDashboard;

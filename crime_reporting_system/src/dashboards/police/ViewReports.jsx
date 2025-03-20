import React, { useState, useEffect } from "react";
import axios from "axios";

const ViewReports = () => {
    const [reports, setReports] = useState([]);
    const statusOptions = ["Pending", "Under Investigation", "Resolved", "Closed"];

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/crime/status");
            setReports(response.data);
        } catch (error) {
            console.error("❌ Error fetching reports:", error);
        }
    };

    const handleStatusChange = async (reportId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:5000/api/crime/update-status/${reportId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) throw new Error("Failed to update status");

            alert("✅ Complaint status updated successfully!");
            fetchReports(); // Refresh the data
        } catch (error) {
            console.error("❌ Error updating status:", error);
            alert("❌ Failed to update complaint status");
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold">📝 Crime Reports</h2>
            <table className="w-full table-auto border-collapse border border-gray-300 mt-4">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">ID</th>
                        <th className="border p-2">Incident Type</th>
                        <th className="border p-2">Date</th>
                        <th className="border p-2">District</th>
                        <th className="border p-2">Subdivision</th>
                        <th className="border p-2">Status</th>
                        <th className="border p-2">Update Status</th>
                        <th className="border p-2">Details</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map((report) => (
                        <tr key={report.id} className="text-center border">
                            <td className="border p-2">{report.id}</td>
                            <td className="border p-2">{report.incident_type}</td>
                            <td className="border p-2">{report.date}</td>
                            <td className="border p-2">{report.district}</td>
                            <td className="border p-2">{report.subdivision}</td>
                            <td className="border p-2">{report.status}</td>
                            <td className="border p-2">
                                <select
                                    className="border p-1"
                                    value={report.status}
                                    onChange={(e) => handleStatusChange(report.id, e.target.value)}
                                >
                                    {statusOptions.map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </td>
                            <td className="border p-2">
                                <button className="bg-blue-500 text-white px-3 py-1 rounded">
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ViewReports;

import { useEffect, useState } from "react";
import axios from "axios";

const MyReports = () => {
    const [reports, setReports] = useState([]);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/crimes/myreports");
                setReports(res.data);
            } catch (error) {
                console.error("Error fetching reports:", error);
            }
        };
        fetchReports();
    }, []);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">My Reports</h2>
            <ul>
                {reports.map((report) => (
                    <li key={report.id} className="border-b py-2">
                        <p><strong>Type:</strong> {report.type}</p>
                        <p><strong>Location:</strong> {report.location}</p>
                        <p><strong>Date:</strong> {new Date(report.created_at).toLocaleString()}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MyReports;

import { useEffect, useState } from "react";
import axios from "axios";

const TrackStatus = () => {
    const [statusList, setStatusList] = useState([]);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/crimes/status");
                setStatusList(res.data);
            } catch (error) {
                console.error("Error fetching status:", error);
            }
        };
        fetchStatus();
    }, []);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Crime Report Status</h2>
            <ul>
                {statusList.map((report) => (
                    <li key={report.id} className="border-b py-2">
                        <p><strong>Type:</strong> {report.type}</p>
                        <p><strong>Status:</strong> {report.status}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TrackStatus;

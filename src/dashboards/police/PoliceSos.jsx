import { useEffect, useState } from "react";
import axios from "axios";

const PoliceSos = () => {
    const [activeSosAlerts, setActiveSosAlerts] = useState([]);
    const [inactiveSosAlerts, setInactiveSosAlerts] = useState([]);
    const subdivision = sessionStorage.getItem("policesubdivision");

    useEffect(() => {
        if (!subdivision) {
            console.error("❌ Subdivision not found in session storage");
            return;
        }

        const fetchSOS = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/police/sos?subdivision=${subdivision}`);
                
                // Separate active and inactive alerts
                const activeAlerts = response.data.filter(alert => alert.status === "active");
                const inactiveAlerts = response.data.filter(alert => alert.status === "inactive");

                setActiveSosAlerts(activeAlerts);
                setInactiveSosAlerts(inactiveAlerts);
                const len=inactiveAlerts.length-1
                const l = inactiveAlerts[len].locations.length-1;
                console.log(len, l, "hi ",inactiveAlerts[len].locations);
                
            } catch (error) {
                console.error("Error fetching SOS alerts:", error);
            }
        };

        // Fetch SOS alerts immediately
        fetchSOS();

        // Set up polling every 3 seconds
        const interval = setInterval(fetchSOS, 3000);

        // Cleanup function to clear interval when component unmounts
        return () => clearInterval(interval);
    }, [subdivision]);

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            <h2 className="text-2xl font-bold mb-4">🚨 SOS Alerts</h2>

            {/* Active SOS Alerts */}
            <h3 className="text-xl font-semibold text-red-600 mb-2">🔴 Active Alerts</h3>
            {activeSosAlerts.length === 0 ? (
                <p className="text-gray-500">No active SOS alerts</p>
            ) : (
                <div className="space-y-4">
                    {activeSosAlerts.map((sos) => {
                        const lastLocation = sos.locations[sos.locations.length - 1];
                        return (
                            <div 
                                key={sos.id} 
                                className="p-4 bg-red-100 border-l-4 border-red-500 rounded-lg cursor-pointer hover:bg-red-200 transition"
                                onClick={() => window.open(`https://www.google.com/maps?q=${lastLocation.latitude},${lastLocation.longitude}`, "_blank")}
                            >
                                <p><strong>User name:</strong> {sos.name}</p>
                                <p><strong>User email:</strong> {sos.user_email}</p>
                                <p><strong>Last Location:</strong> {lastLocation.latitude}, {lastLocation.longitude}</p>
                                <p><strong>Time:</strong> {new Date(lastLocation.timestamp).toLocaleString()}</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Inactive SOS Alerts */}
            <h3 className="text-xl font-semibold text-gray-600 mt-6 mb-2">⚪ Past SOS Alerts</h3>
            {inactiveSosAlerts.length === 0 ? (
                <p className="text-gray-500">No past SOS alerts</p>
            ) : (
                <div className="space-y-4">
                    {inactiveSosAlerts.map((sos) => {
                        const lastLocation = sos.locations[sos.locations.length - 1];
                        return (
                            <div key={sos.id} className="p-4 bg-gray-200 border-l-4 border-gray-500 rounded-lg">
                                <p><strong>User name:</strong> {sos.name}</p>
                                <p><strong>User email:</strong> {sos.user_email}</p>
                                <p><strong>Last Location:</strong> {lastLocation.latitude}, {lastLocation.longitude}</p>
                                <p><strong>Resolved At:</strong> {new Date(lastLocation.timestamp).toLocaleString()}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PoliceSos;
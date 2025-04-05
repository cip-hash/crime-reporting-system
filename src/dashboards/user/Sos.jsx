import { useEffect, useState } from "react";
import axios from "axios";

const Sos = () => {
    const [location, setLocation] = useState(null);
    const [sosActive, setSosActive] = useState(false);
    const [intervalId, setIntervalId] = useState(null);
    const [sosId, setSosId] = useState(null); // Store SOS ID

    const sendSOS = async (isFirst = false) => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const user_email = sessionStorage.getItem('user_email');
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });

                try {
                    let response;
                    if (isFirst) {
                        // Create a new SOS entry
                        response = await axios.post("http://localhost:5000/api/crime/sos", { user_email, latitude, longitude });
                        setSosId(response.data.sos_id); // Store SOS ID for future updates
                        console.log(sosId);
                    } else {
                        // Update the existing SOS entry with a new location
                        await axios.put(`http://localhost:5000/api/crime/sos/${user_email}`, { latitude, longitude });
                    }
                } catch (error) {
                    console.error("Error sending SOS:", error);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                alert("Unable to fetch location.");
            },
            { enableHighAccuracy: true }
        );
    };

    const startSOS = () => {
        if (sosActive) return;

        setSosActive(true);
        sendSOS(true); // Send the first SOS immediately

        const id = setInterval(() => {
            sendSOS(false);
        }, 20000); // Update every 20 seconds

        setIntervalId(id);
    };

    const stopSOS = async () => {
        setSosActive(false);
        if (intervalId) clearInterval(intervalId);
        setIntervalId(null);

        if (sosId) {
            try {
                await axios.put(`http://localhost:5000/api/crime/sos/${sosId}/stop`);
            } catch (error) {
                console.error("Error stopping SOS:", error);
            }
        }
        alert("SOS Stopped.");
    };

    return (
        <button
            onClick={sosActive ? stopSOS : startSOS}
            className={`px-6 py-3 text-white font-bold rounded-lg transition-all duration-300 ${
                sosActive ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"
            }`}
        >
            {sosActive ? "Stop SOS" : "SOS"}
        </button>
    );
};

export default Sos;
import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, HeatmapLayer } from "@react-google-maps/api";
import axios from "axios";

const containerStyle = {
    width: "100%",
    height: "500px",
};

const center = { lat: 11.1271, lng: 78.6569 }; // Default center (Tamil Nadu)

const CrimeHeatmap = () => {
    const [heatmapData, setHeatmapData] = useState([]);

    useEffect(() => {
        fetchCrimeLocations();
    }, []);

    const fetchCrimeLocations = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/crime/locations");
            const points = response.data.map(loc => ({
                location: new window.google.maps.LatLng(loc.latitude, loc.longitude),
                weight: 1,
            }));
            setHeatmapData(points);
        } catch (error) {
            console.error("Error fetching crime locations:", error);
        }
    };

    return (
        <LoadScript googleMapsApiKey="AlzaSy7axvF6kHxVsWAt3MpcUAG7hMixC43vYsn" libraries={["visualization"]}>
            <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={7}>
                {heatmapData.length > 0 && <HeatmapLayer data={heatmapData} />}
            </GoogleMap>
        </LoadScript>
    );
};

export default CrimeHeatmap;

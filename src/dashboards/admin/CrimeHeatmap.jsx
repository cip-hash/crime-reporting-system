import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet.heat";

const Heatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/heatmap");
        const data = await response.json();

        const formattedData = data.map((item) => [
          item.latitude,
          item.longitude,
          item.totalcrimes, // Crime intensity
        ]);

        setHeatmapData(formattedData);
      } catch (err) {
        console.error("❌ Failed to fetch heatmap data:", err);
      }
    };

    fetchHeatmapData();
  }, []);

  useEffect(() => {
    if (heatmapData.length === 0) return;

    const map = L.map("heatmap-container").setView([11.1271, 78.6569], 7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    L.heatLayer(heatmapData, {
      radius: 25,
      blur: 15,
    }).addTo(map);

    return () => {
      map.remove();
    };
  }, [heatmapData]);

  return <div id="heatmap-container" style={{ height: "100vh", width: "100%" }}></div>;
};

export default Heatmap;

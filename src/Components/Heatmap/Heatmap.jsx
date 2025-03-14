import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet.heat';

const HeatmapLayer = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const heatLayer = L.heatLayer(points, { radius: 25, blur: 15 }).addTo(map);
    return () => {
      map.removeLayer(heatLayer); // Cleanup heat layer when component unmounts
    };
  }, [map, points]);

  return null;
};

const Heatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  useEffect(() => {
    // Fetch data from backend API
    fetch('http://localhost:4000/heatmap',{method:'POST'})
      .then((res) => res.json())
      .then((data) => {
        const formattedData = data.map((item) => [
          item.latitude,
          item.longitude,
          item.totalcrimes , // Normalize crime intensity (adjust as needed)
        ]);
        setHeatmapData(formattedData);
      })
      .catch((err) => console.error('Failed to fetch heatmap data:', err));
  }, []);

  return (
    <MapContainer center={[11.1271, 78.6569]} zoom={7.2} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <HeatmapLayer points={heatmapData} />
    </MapContainer>
  );
};

export default Heatmap;

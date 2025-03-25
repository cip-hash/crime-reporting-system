import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet.heat';

const HeatmapLayer = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
     const heatLayer = L.heatLayer(points, {
          radius: 35,  // Increase size for better coverage
          blur: 20,    // Reduce blur for sharper contrast
          minOpacity:0.3, // Increase minimum visibility
          gradient: {  // Custom color scale for better visibility
            0.1: 'blue', 
            0.3: 'cyan',
            0.5: 'lime',
            0.7: 'yellow',
            1.0: 'red'
          }
        }).addTo(map);
    return () => {
      map.removeLayer(heatLayer); // Cleanup heat layer when component unmounts
    };
  }, [map, points]);

  return null;
};

const AdminHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  useEffect(() => {
    // Fetch data from backend API
    fetch('http://localhost:5000/api/crime/locations')
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
    <MapContainer center={[11.1271, 78.6569]} zoom={7} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <HeatmapLayer points={heatmapData} />
    </MapContainer>
  );
};

export default AdminHeatmap;
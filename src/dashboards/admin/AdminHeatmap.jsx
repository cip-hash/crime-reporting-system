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
          radius: 35,
          blur: 20,
          minOpacity: 0.3,
          gradient: {
            0.1: 'blue', 
            0.3: 'cyan',
            0.5: 'lime',
            0.7: 'yellow',
            1.0: 'red'
          }
        }).addTo(map);
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);
  return null;
};

const AdminHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/crime/locations')
      .then((res) => res.json())
      .then((data) => {
        const crimeCounts = data.map(item =>
          selectedIncident && item[selectedIncident] !== undefined
            ? item[selectedIncident]
            : item.totalcrimes
        );

        const minValue = Math.min(...crimeCounts);
        const maxValue = Math.max(...crimeCounts);

        const formattedData = data.map((item) => {
          const crimeValue = selectedIncident && item[selectedIncident] !== undefined
            ? item[selectedIncident]
            : item.totalcrimes;

          let normalizedValue = (crimeValue - minValue) / (maxValue - minValue);
          if (maxValue === minValue) normalizedValue = 1;

          return [item.latitude, item.longitude, normalizedValue];
        });
        setHeatmapData(formattedData);
      })
      .catch((err) => console.error('Failed to fetch heatmap data:', err));
  }, [selectedIncident]);

  return (
    <div>
      <select
        onChange={(e) => setSelectedIncident(e.target.value)}
        value={selectedIncident}
        style={{ margin: '10px', padding: '5px' }}
      >
        <option value="">Select Incident Type</option>
        <option value="harassment">Harassment</option>
        <option value="murder">Murder</option>
        <option value="murderforgain">Murder for Gain</option>
        <option value="dacoity">Dacoity</option>
        <option value="robbery">Robbery</option>
        <option value="graveburglary">Grave Burglary</option>
        <option value="gravetheft">Grave Theft</option>
        <option value="other">Other</option>
      </select>

      <MapContainer center={[11.1271, 78.6569]} zoom={7} style={{ height: '100vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <HeatmapLayer points={heatmapData} />
      </MapContainer>
    </div>
  );
};

export default AdminHeatmap;
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet.heat';

const HeatmapLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;

    const heatLayer = L.heatLayer(points, {
      radius: 35,  // Increase size for better coverage
      blur: 20,    // Reduce blur for sharper contrast
      minOpacity:0.4, // Increase minimum visibility
      gradient: {  // Custom color scale for better visibility
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

// Component to dynamically center the map when lat/lng changes
const MapUpdater = ({ latitude, longitude }) => {
  const map = useMap();

  useEffect(() => {
    if (latitude && longitude) {
      map.setView([latitude, longitude], 13);
    }
  }, [latitude, longitude, map]);

  return null;
};

const PoliceHeatmap = () => {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    const fetchLocationAndHeatmap = async () => {
      try {
        const policeDistrict = sessionStorage.getItem("policedistrict");
        const policeSubdivision = sessionStorage.getItem("policesubdivision");

        if (!policeDistrict || !policeSubdivision) {
          console.error("District or subdivision not found in sessionStorage.");
          return;
        }

        // Fetch latitude & longitude
        const locationRes = await fetch("http://localhost:5000/api/crime/latlong", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dis: policeDistrict, sub: policeSubdivision }),
        });
        const locationData = await locationRes.json();

        if (locationData.latitude && locationData.longitude) {
          setLatitude(locationData.latitude);
          setLongitude(locationData.longitude);
        }

        // Fetch heatmap data
        const heatmapRes = await fetch("http://localhost:5000/api/crime/locations");
        const heatmapData = await heatmapRes.json();

        // Normalize and boost crime intensity
        const maxCrimes = Math.max(...heatmapData.map((item) => item.totalcrimes));
        const minCrimes = Math.min(...heatmapData.map((item) => item.totalcrimes));

        const formattedData = heatmapData.map((item) => [
          item.latitude,
          item.longitude,
          item.totalcrimes // Boost intensity
        ]);

        setHeatmapData(formattedData);

      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchLocationAndHeatmap();
  }, []);

  if (latitude === null || longitude === null) {
    return <p>Loading map...</p>;
  }

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={11}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <MapUpdater latitude={latitude} longitude={longitude} />
      <HeatmapLayer points={heatmapData} />
    </MapContainer>
  );
};

export default PoliceHeatmap;

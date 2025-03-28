import { MapContainer, TileLayer, useMap, Marker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet.heat';

const HeatmapLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;

    const heatLayer = L.heatLayer(points.map(p => [p.lat, p.lng, p.intensity]), {
      radius: 35,
      blur: 20,
      minOpacity: 0.4,
      gradient: {
        0.0: '#0000FF', // Deep Blue
        0.14: '#008080', // Teal
        0.28: '#00FFFF', // Cyan
        0.42: '#00FF00', // Green
        0.56: '#ADFF2F', // Yellow-Green
        0.70: '#FFFF00', // Yellow
        0.84: '#FF7F00', // Orange
        1.0: '#FF0000'   // Red 
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
};

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
  const [selectedIncident, setSelectedIncident] = useState('');

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const policeDistrict = sessionStorage.getItem("policedistrict");
        const policeSubdivision = sessionStorage.getItem("policesubdivision");
        if (!policeDistrict || !policeSubdivision) {
          console.error("District or subdivision not found in sessionStorage.");
          return;
        }

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
      } catch (err) {
        console.error("Error fetching location:", err);
      }
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        setHeatmapData([]); // Clear old data before fetching new data
        const heatmapRes = await fetch("http://localhost:5000/api/crime/locations");
        const heatmapData = await heatmapRes.json();

        // Determine min/max for normalization
        const crimeCounts = heatmapData.map(item =>
          selectedIncident && item[selectedIncident] !== undefined
            ? item[selectedIncident] 
            : item.totalcrimes
        );

        const minValue = Math.min(...crimeCounts);
        const maxValue = Math.max(...crimeCounts);

        const formattedData = heatmapData.map(item => {
          const crimeValue = selectedIncident && item[selectedIncident] !== undefined
            ? item[selectedIncident]
            : item.totalcrimes;

          let normalizedValue = (crimeValue - minValue) / (maxValue - minValue);
          if (maxValue === minValue) normalizedValue = 1; // Avoid division by zero

          return {
            lat: item.latitude,
            lng: item.longitude,
            intensity: normalizedValue,
            subdivision: item.subdivision, // Store subdivision for tooltip
            crimes: item
  ? {
      harassment: item.harassment ?? 0,
      murder: item.murder ?? 0,
      murderforgain: item.murderforgain ?? 0,
      dacoity: item.dacoity ?? 0,
      robbery: item.robbery ?? 0,
      graveburglary: item.graveburglary ?? 0,
      gravetheft: item.gravetheft ?? 0,
      other: item.other ?? 0,
    }
  : {},

          };
        });

        setHeatmapData(formattedData);
      } catch (err) {
        console.error("Error fetching heatmap data:", err);
      }
    };

    fetchHeatmapData();
  }, [selectedIncident]); // Update whenever `selectedIncident` changes

  if (latitude === null || longitude === null) {
    return <p>Loading map...</p>;
  }

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

      <MapContainer center={[latitude, longitude]} zoom={11} style={{ height: '90vh', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <MapUpdater latitude={latitude} longitude={longitude} />
        <HeatmapLayer points={heatmapData} />

        {/* Add Markers with Tooltips for Incident Breakdown */}
        {heatmapData.map((point, index) => (
           <Marker key={index} position={[point.lat, point.lng]}>
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
              <strong>{point.subdivision}</strong><br />
              {Object.entries(point.crimes).map(([incident, count]) => (
                <div key={incident}>{incident.charAt(0).toUpperCase() + incident.slice(1)}: {count}</div>
              ))}
            </Tooltip>
           </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default PoliceHeatmap;

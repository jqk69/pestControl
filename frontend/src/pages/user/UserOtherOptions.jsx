import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function HeatmapLayer({ points }) {
  const map = useMap();
  const [heatLayer, setHeatLayer] = useState(null);

  useEffect(() => {
    if (!points || points.length === 0) return;

    const layer = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      minOpacity: 0.5,
      gradient: {
        0.1: 'blue',
        0.3: 'cyan',
        0.5: 'lime',
        0.7: 'yellow',
        0.9: 'red',
      },
    }).addTo(map);
    setHeatLayer(layer);

    const handleZoom = () => {
      const zoom = map.getZoom();
      const newRadius = Math.max(15, 35 - zoom);
      layer.setOptions({ radius: newRadius });
    };

    map.on('zoomend', handleZoom);

    return () => {
      map.off('zoomend', handleZoom);
      map.removeLayer(layer);
    };
  }, [map, points]);

  return null;
}

function UserLocationMarker({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 13, { duration: 1 });
    }
  }, [position, map]);

  return position ? (
    <Marker position={position}>
      <Popup>Your Location</Popup>
    </Marker>
  ) : null;
}

export default function UserOtherOptions() {
  const [userPosition, setUserPosition] = useState(null);
  const [allBookingData, setAllBookingData] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [filteredPoints, setFilteredPoints] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loadingPredict, setLoadingPredict] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
      () => {
        toast.warn('Geolocation unavailable, defaulting to India center');
        setUserPosition([20.5937, 78.9629]);
      }
    );

    const fetchLocations = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        toast.error('Please login to view booking locations');
        navigate('/login');
        setLoadingLocations(false);
        return;
      }

      try {
        const res = await axios.get('http://127.0.0.1:5000/user/booking-locations', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setAllBookingData(res.data.locations || []);
        } else {
          toast.error('Failed to load booking locations');
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        toast.error('Error fetching booking locations');
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, [navigate]);

  // Filter by selected pest type
  useEffect(() => {
    let filtered = allBookingData;

    if (selectedType !== 'all') {
      filtered = filtered.filter((loc) => {
        if (!loc.pest_type) return false;
        return loc.pest_type.toLowerCase().trim() === selectedType.toLowerCase().trim();
      });
    }

    const heatmapPoints = filtered
      .map((loc) => [
        parseFloat(loc.location_lat),
        parseFloat(loc.location_lng),
        Math.random() + 0.5,
      ])
      .filter((point) => !isNaN(point[0]) && !isNaN(point[1]));

    setFilteredPoints(heatmapPoints);
  }, [selectedType, allBookingData]);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setPrediction(null);
  };

  const handlePredict = async () => {
    if (!image) {
      toast.error('Please select an image');
      return;
    }

    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Please login to predict pest type');
      navigate('/login');
      return;
    }

    setLoadingPredict(true);
    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/user/predict-pest',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setPrediction(response.data.pest_type || 'Unknown');
        toast.success('Pest type predicted successfully');
      } else {
        toast.error(response.data.message || 'Failed to predict pest type');
      }
    } catch (error) {
      console.error('Error calling pest prediction API:', error);
      toast.error('Error predicting pest type');
    } finally {
      setLoadingPredict(false);
    }
  };

  return (
    <div className="p-4 space-y-8 bg-gray-900 min-h-screen">
      {/* Pest Prediction Section */}
      <div className="bg-gray-800 shadow-lg rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-100">Predict Pest Type from Image</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mb-4 text-gray-300 file:bg-gray-700 file:text-gray-100 file:border-none file:px-4 file:py-2 file:rounded-md file:cursor-pointer"
        />
        <button
          onClick={handlePredict}
          disabled={!image || loadingPredict}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500 disabled:opacity-50 transition duration-300"
        >
          {loadingPredict ? 'Predicting...' : 'Predict'}
        </button>
        {prediction && (
          <p className="mt-3 font-medium text-green-400">Prediction: {prediction}</p>
        )}
      </div>

      {/* Heatmap with Pest Type Filter */}
      <div className="bg-gray-800 shadow-lg rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-100">Pest Service Heatmap</h2>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-gray-700 bg-gray-900 text-gray-100 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Types</option>
            <option value="rodent">Rodent</option>
            <option value="insect">Insect</option>
            <option value="worm">Worm</option>
            <option value="fungus">Fungus</option>
            <option value="other">Others</option>
          </select>
        </div>

        {loadingLocations ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <MapContainer
            center={userPosition || [20.5937, 78.9629]}
            zoom={7}
            style={{ height: '500px', width: '100%', borderRadius: '0.5rem' }}
            tap={false}
            className="border border-gray-700"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <UserLocationMarker position={userPosition} />
            <HeatmapLayer points={filteredPoints} />
          </MapContainer>
        )}

        <div className="mt-4 flex justify-center space-x-4 text-gray-300">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span>Low Activity</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span>High Activity</span>
          </div>
        </div>
      </div>
    </div>
  );
}
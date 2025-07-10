import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPinIcon,
  ArrowUpTrayIcon,
  SparklesIcon,
  GlobeAltIcon,
  BugAntIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  BeakerIcon,
  LightBulbIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs, ParticleField } from '../../components/ui/FloatingElements';

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
  const [imagePreview, setImagePreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loadingPredict, setLoadingPredict] = useState(false);
  const [activeTab, setActiveTab] = useState('heatmap');
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
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setPrediction(null);
    }
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  const pestTypes = [
    { value: 'all', label: 'All Types', icon: BugAntIcon, color: 'emerald' },
    { value: 'rodent', label: 'Rodent', icon: BugAntIcon, color: 'red' },
    { value: 'insect', label: 'Insect', icon: BugAntIcon, color: 'blue' },
    { value: 'worm', label: 'Worm', icon: BugAntIcon, color: 'yellow' },
    { value: 'fungus', label: 'Fungus', icon: BugAntIcon, color: 'purple' },
    { value: 'other', label: 'Others', icon: BugAntIcon, color: 'gray' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 relative overflow-hidden">
      <FloatingOrbs />
      <ParticleField />
      
      <motion.div
        className="relative z-10 p-6 max-w-7xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
              className="relative z-10"
            >
              <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
            </motion.div>
            <motion.h1 
              className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Advanced Tools
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-300 mb-6 max-w-3xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Explore our cutting-edge pest analysis tools and interactive visualizations
            </motion.p>
            
            {/* Tab Navigation */}
            <motion.div 
              className="flex flex-wrap justify-center gap-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <AnimatedButton
                variant={activeTab === 'heatmap' ? 'primary' : 'ghost'}
                size="lg"
                onClick={() => setActiveTab('heatmap')}
                icon={<GlobeAltIcon className="w-5 h-5" />}
              >
                Pest Heatmap
              </AnimatedButton>
              <AnimatedButton
                variant={activeTab === 'prediction' ? 'primary' : 'ghost'}
                size="lg"
                onClick={() => setActiveTab('prediction')}
                icon={<CameraIcon className="w-5 h-5" />}
              >
                Pest Identification
              </AnimatedButton>
            </motion.div>
          </GlassCard>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Heatmap Section */}
          {activeTab === 'heatmap' && (
            <motion.div
              key="heatmap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <NeonCard className="p-6 relative overflow-hidden" color="blue">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-emerald-500/5" />
                
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <MapPinIcon className="w-6 h-6 text-blue-400" />
                        Pest Activity Heatmap
                      </h2>
                      <p className="text-gray-300">
                        Visualize pest activity hotspots in your region
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      {pestTypes.map((type) => (
                        <motion.button
                          key={type.value}
                          onClick={() => setSelectedType(type.value)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                            selectedType === type.value
                              ? `bg-${type.color}-500/20 text-${type.color}-400 border border-${type.color}-500/30`
                              : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {loadingLocations ? (
                    <div className="h-[500px] flex items-center justify-center bg-white/5 rounded-xl border border-white/10">
                      <motion.div
                        className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                  ) : (
                    <div className="h-[500px] rounded-xl overflow-hidden border border-white/20 shadow-lg">
                      <MapContainer
                        center={userPosition || [20.5937, 78.9629]}
                        zoom={7}
                        style={{ height: '100%', width: '100%' }}
                        tap={false}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        <UserLocationMarker position={userPosition} />
                        <HeatmapLayer points={filteredPoints} />
                      </MapContainer>
                    </div>
                  )}

                  <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="w-6 h-6 bg-blue-500 rounded-full mx-auto mb-2 opacity-80"></div>
                      <span className="text-gray-300 text-sm">Low Activity</span>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full mx-auto mb-2 opacity-80"></div>
                      <span className="text-gray-300 text-sm">Medium Activity</span>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="w-6 h-6 bg-red-500 rounded-full mx-auto mb-2 opacity-80"></div>
                      <span className="text-gray-300 text-sm">High Activity</span>
                    </div>
                  </div>
                </div>
              </NeonCard>
            </motion.div>
          )}

          {/* Prediction Section */}
          {activeTab === 'prediction' && (
            <motion.div
              key="prediction"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Image Upload Card */}
              <NeonCard className="p-6 relative overflow-hidden" color="purple">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />
                
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <CameraIcon className="w-6 h-6 text-purple-400" />
                    Pest Identification
                  </h2>
                  <p className="text-gray-300 mb-6">
                    Upload an image of a pest to identify its type using our advanced AI
                  </p>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Upload Pest Image
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer bg-white/5 border-white/20 hover:bg-white/10 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {imagePreview ? (
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-full h-full object-contain rounded-lg"
                            />
                          ) : (
                            <>
                              <ArrowUpTrayIcon className="w-10 h-10 text-gray-400 mb-3" />
                              <p className="mb-2 text-sm text-gray-300">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-400">
                                PNG, JPG or JPEG (MAX. 5MB)
                              </p>
                            </>
                          )}
                        </div>
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  
                  <AnimatedButton
                    variant="neon"
                    size="lg"
                    onClick={handlePredict}
                    loading={loadingPredict}
                    disabled={!image || loadingPredict}
                    icon={!loadingPredict && <SparklesIcon className="w-5 h-5" />}
                    className="w-full"
                    color="purple"
                  >
                    {loadingPredict ? 'Analyzing Image...' : 'Identify Pest'}
                  </AnimatedButton>
                </div>
              </NeonCard>

              {/* Results Card */}
              <GlassCard className="p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5" />
                
                <div className="relative z-10 h-full flex flex-col">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <BeakerIcon className="w-6 h-6 text-emerald-400" />
                    Analysis Results
                  </h2>
                  
                  {prediction ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center mb-6">
                        <CheckCircleIcon className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Pest Identified!</h3>
                      <div className="text-center mb-6">
                        <p className="text-gray-300 mb-2">Our AI has identified this as:</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                          {prediction}
                        </p>
                      </div>
                      <div className="w-full p-4 bg-white/5 rounded-xl border border-white/10">
                        <h4 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
                          <LightBulbIcon className="w-5 h-5 text-yellow-400" />
                          Recommended Action
                        </h4>
                        <p className="text-gray-300 text-sm">
                          Based on the identification, we recommend our professional {prediction.toLowerCase()} control service for effective elimination.
                        </p>
                        <div className="mt-4">
                          <AnimatedButton
                            variant="primary"
                            size="sm"
                            onClick={() => navigate('/user/services')}
                          >
                            View Recommended Services
                          </AnimatedButton>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      {image ? (
                        <div>
                          <motion.div
                            animate={{ 
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{ 
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="mb-6"
                          >
                            <SparklesIcon className="w-16 h-16 text-emerald-400 mx-auto" />
                          </motion.div>
                          <h3 className="text-xl font-bold text-white mb-2">Ready for Analysis</h3>
                          <p className="text-gray-400 mb-6">
                            Click the "Identify Pest" button to analyze your image
                          </p>
                        </div>
                      ) : (
                        <div>
                          <ExclamationTriangleIcon className="w-16 h-16 text-gray-500 mx-auto mb-6" />
                          <h3 className="text-xl font-bold text-white mb-2">No Image Selected</h3>
                          <p className="text-gray-400 mb-6">
                            Please upload an image of the pest you want to identify
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Additional Information */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <ChartBarIcon className="w-6 h-6 text-emerald-400" />
              Pest Insights
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-emerald-400" />
                  Seasonal Trends
                </h3>
                <p className="text-gray-300 text-sm">
                  Pest activity typically increases during warmer months. Monitor your property more frequently during spring and summer.
                </p>
              </div>
              
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-blue-400" />
                  Regional Patterns
                </h3>
                <p className="text-gray-300 text-sm">
                  Urban areas show higher rodent activity, while rural regions experience more diverse insect infestations.
                </p>
              </div>
              
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-purple-400" />
                  Prevention Tips
                </h3>
                <p className="text-gray-300 text-sm">
                  Regular cleaning, proper food storage, and sealing entry points are the most effective preventive measures.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
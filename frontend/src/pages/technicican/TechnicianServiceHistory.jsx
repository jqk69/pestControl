import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClockIcon,
  XMarkIcon,
  CheckCircleIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs } from '../../components/ui/FloatingElements';

// Icons fix for markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Custom routing control
function RouteControl({ from, to }) {
  const map = useMap();

  useEffect(() => {
    if (!from || !to) return;

    const control = L.Routing.control({
      waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
      routeWhileDragging: false,
      draggableWaypoints: false,
      addWaypoints: false,
      show: false,
      createMarker: () => null,
      lineOptions: {
        styles: [{ color: "#f97316", weight: 5, opacity: 0.7 }],
      },
    }).addTo(map);

    return () => map.removeControl(control);
  }, [from, to, map]);

  return null;
}

export default function TechnicianServiceHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [techLocation, setTechLocation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServiceHistory = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Get technician's current location
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setTechLocation([pos.coords.latitude, pos.coords.longitude]);
          },
          () => {
            console.warn("Geolocation unavailable");
            setTechLocation(null);
          }
        );

        const response = await axios.get('http://127.0.0.1:5000/technician/service-history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.assigned_services) {
          setHistory(response.data.assigned_services);
        } else {
          setHistory([]);
        }
      } catch (err) {
        console.error('Error fetching service history:', err);
        setError(err.response?.data?.message || 'Failed to load service history');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceHistory();
  }, [navigate]);

  const handleViewLocation = (service) => {
    setSelectedService(service);
    setShowMapModal(true);
  };

  const closeMapModal = () => {
    setShowMapModal(false);
    setSelectedService(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Group services by month for better organization
  const groupedHistory = history.reduce((groups, service) => {
    const date = new Date(service.booking_date);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    
    groups[monthYear].push(service);
    return groups;
  }, {});

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading service history...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 relative overflow-hidden">
      <FloatingOrbs />
      
      <div
        className="relative z-10 p-6 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                  <ClockIcon className="w-10 h-10 text-orange-400" />
                  Service History
                </h1>
                <p className="text-gray-300 text-lg">Your completed service records</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Stats Summary */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NeonCard className="p-6 text-center" color="emerald">
              <CheckCircleIcon className="w-8 h-8 mx-auto mb-3 text-emerald-400" />
              <h3 className="text-2xl font-bold text-emerald-400 mb-1">
                {history.length}
              </h3>
              <p className="text-white font-medium">Completed Services</p>
              <p className="text-gray-400 text-sm mt-1">Total services delivered</p>
            </NeonCard>
            
            <NeonCard className="p-6 text-center" color="blue">
              <ChartBarIcon className="w-8 h-8 mx-auto mb-3 text-blue-400" />
              <h3 className="text-2xl font-bold text-blue-400 mb-1">
                {Object.keys(groupedHistory).length}
              </h3>
              <p className="text-white font-medium">Active Months</p>
              <p className="text-gray-400 text-sm mt-1">Months with completed services</p>
            </NeonCard>
            
            <NeonCard className="p-6 text-center" color="orange">
              <ShieldCheckIcon className="w-8 h-8 mx-auto mb-3 text-orange-400" />
              <h3 className="text-2xl font-bold text-orange-400 mb-1">
                100%
              </h3>
              <p className="text-white font-medium">Success Rate</p>
              <p className="text-gray-400 text-sm mt-1">All services completed successfully</p>
            </NeonCard>
          </div>
        </motion.div>

        {/* Service History List */}
        {history.length === 0 ? (
          <motion.div variants={itemVariants}>
            <GlassCard className="p-12 text-center">
              <ExclamationTriangleIcon className="w-20 h-20 text-gray-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">No completed services</h2>
              <p className="text-gray-400 text-lg">
                You haven't completed any services yet
              </p>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="space-y-8">
            {Object.entries(groupedHistory).map(([monthYear, services]) => (
              <div key={monthYear}>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <CalendarDaysIcon className="w-6 h-6 text-orange-400" />
                  {monthYear}
                </h2>
                
                <div className="space-y-4">
                  <AnimatePresence>
                    {services.map((service, index) => (
                      <motion.div
                        key={service.booking_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <NeonCard className="p-6" color="emerald">
                          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                            {/* Service Info */}
                            <div className="flex-1">
                              <div className="flex items-start gap-4">
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold text-white mb-4">{service.service_name}</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-gray-300">
                                      <CalendarDaysIcon className="w-4 h-4 text-emerald-400" />
                                      <span><strong>Date:</strong> {formatDate(service.booking_date)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-300">
                                      <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                                      <span><strong>Status:</strong> <span className="capitalize">{service.status}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-300">
                                      <span><strong>Booking ID:</strong> #{service.booking_id}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div>
                              {service.location_lat && service.location_lng && (
                                <AnimatedButton
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewLocation(service)}
                                  icon={<MapPinIcon className="w-4 h-4" />}
                                >
                                  View Location
                                </AnimatedButton>
                              )}
                            </div>
                          </div>
                        </NeonCard>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Map Modal */}
      <AnimatePresence>
        {showMapModal && selectedService && (
          <div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-4xl h-[600px] relative"
            >
              <GlassCard className="h-full relative overflow-hidden">
                <button
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white transition-colors"
                  onClick={closeMapModal}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
                
                <div className="p-6 h-full flex flex-col">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <MapPinIcon className="w-6 h-6 text-orange-400" />
                    Service Location
                  </h2>
                  
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-4">
                    <h3 className="text-lg font-medium text-white mb-2">{selectedService.service_name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <p className="text-gray-300">
                        <strong>Date:</strong> {formatDate(selectedService.booking_date)}
                      </p>
                      <p className="text-gray-300">
                        <strong>Status:</strong> <span className="capitalize">{selectedService.status}</span>
                      </p>
                      <p className="text-gray-300 md:col-span-2">
                        <strong>Location:</strong> {selectedService.location_lat}, {selectedService.location_lng}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex-1 rounded-xl overflow-hidden">
                    <MapContainer
                      center={[selectedService.location_lat, selectedService.location_lng]}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={[selectedService.location_lat, selectedService.location_lng]}>
                        <Popup>
                          <div className="text-center">
                            <strong>Service Location</strong><br />
                            {selectedService.service_name}
                          </div>
                        </Popup>
                      </Marker>
                      
                      {techLocation && (
                        <>
                          <Marker position={techLocation}>
                            <Popup>
                              <div className="text-center">
                                <strong>Your Location</strong><br />
                                Current position
                              </div>
                            </Popup>
                          </Marker>
                          
                          <RouteControl 
                            from={techLocation} 
                            to={[selectedService.location_lat, selectedService.location_lng]} 
                          />
                        </>
                      )}
                    </MapContainer>
                  </div>
                  
                  {techLocation && (
                    <div className="mt-4 bg-white/5 p-4 rounded-xl border border-white/10">
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPinIcon className="w-5 h-5 text-orange-400" />
                        <span>
                          Route to service location is displayed on the map
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
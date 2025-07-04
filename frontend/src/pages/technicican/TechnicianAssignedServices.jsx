import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheckIcon,
  XMarkIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
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

export default function TechnicianAssignedServices() {
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("confirmed");
  const [technicianLocation, setTechnicianLocation] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignedServices = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get("http://127.0.0.1:5000/technician/assigned-services", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setAssigned(response.data.assigned_services || []);
      } catch (err) {
        console.error("Error fetching assigned services", err);
      } finally {
        setLoading(false);
      }
    };

    // Get technician's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTechnicianLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.warn("Geolocation error:", err);
          setTechnicianLocation(null);
        }
      );
    }

    fetchAssignedServices();
  }, [navigate]);

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    if (!lat1 || !lng1 || !lat2 || !lng2) return Infinity;
    
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const filteredAndSorted = assigned
    .filter((item) => item.status === filter)
    .sort((a, b) => {
      if (!technicianLocation || !a.location_lat || !b.location_lat) return 0;
      const distA = calculateDistance(
        technicianLocation.lat,
        technicianLocation.lng,
        a.location_lat,
        a.location_lng
      );
      const distB = calculateDistance(
        technicianLocation.lat,
        technicianLocation.lng,
        b.location_lat,
        b.location_lng
      );
      return distA - distB;
    });

  const goToDetails = (bookingId) => {
    navigate(`/technician/service/${bookingId}`);
  };
  
  const handleViewLocation = (service) => {
    setSelectedService(service);
    setShowMapModal(true);
  };

  const closeMapModal = () => {
    setShowMapModal(false);
    setSelectedService(null);
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
          <p className="text-white text-xl">Loading assigned services...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 relative overflow-hidden">
      <FloatingOrbs />
      
      <motion.div
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
                  <ShieldCheckIcon className="w-10 h-10 text-orange-400" />
                  Assigned Services
                </h1>
                <p className="text-gray-300 text-lg">Manage your upcoming service appointments</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div variants={itemVariants}>
          <div className="flex space-x-4">
            {[
              { key: 'confirmed', label: 'Confirmed', color: 'blue' },
              { key: 'pending', label: 'Pending', color: 'yellow' },
            ].map((status) => (
              <motion.button
                key={status.key}
                onClick={() => setFilter(status.key)}
                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  filter === status.key
                    ? `bg-${status.color}-500 text-white shadow-lg shadow-${status.color}-500/25`
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {status.key === 'confirmed' ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  <ClockIcon className="w-5 h-5" />
                )}
                {status.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Services List */}
        {filteredAndSorted.length === 0 ? (
          <motion.div variants={itemVariants}>
            <GlassCard className="p-12 text-center">
              <ExclamationTriangleIcon className="w-20 h-20 text-gray-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">No {filter} services</h2>
              <p className="text-gray-400 text-lg">
                You don't have any {filter} services assigned at the moment
              </p>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="space-y-6">
            <AnimatePresence>
              {filteredAndSorted.map((item, index) => {
                const distance = technicianLocation && item.location_lat && item.location_lng
                  ? calculateDistance(
                      technicianLocation.lat,
                      technicianLocation.lng,
                      item.location_lat,
                      item.location_lng
                    ).toFixed(1)
                  : null;
                
                return (
                  <motion.div
                    key={item.booking_id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <NeonCard className="p-6" color={filter === 'confirmed' ? 'blue' : 'yellow'}>
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        {/* Service Info */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white mb-4">{item.service_name || 'Service Appointment'}</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-300">
                                  <CalendarDaysIcon className="w-4 h-4 text-orange-400" />
                                  <span><strong>Date & Time:</strong> {new Date(item.booking_date).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <UserIcon className="w-4 h-4 text-orange-400" />
                                  <span><strong>Customer:</strong> {item.user_name || 'Not specified'}</span>
                                </div>
                                {item.user_phone && (
                                  <div className="flex items-center gap-2 text-gray-300">
                                    <PhoneIcon className="w-4 h-4 text-orange-400" />
                                    <span><strong>Phone:</strong> {item.user_phone}</span>
                                  </div>
                                )}
                                {distance && (
                                  <div className="flex items-center gap-2 text-gray-300">
                                    <MapPinIcon className="w-4 h-4 text-orange-400" />
                                    <span><strong>Distance:</strong> {distance} km</span>
                                    <AnimatedButton
                                      variant="ghost"
                                      size="xs"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewLocation(item);
                                      }}
                                      icon={<MapPinIcon className="w-3 h-3" />}
                                    >
                                      Map
                                    </AnimatedButton>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-gray-300">
                                  <ClockIcon className="w-4 h-4 text-orange-400" />
                                  <span><strong>Status:</strong> <span className="capitalize">{item.status}</span></span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div>
                          <AnimatedButton
                            variant={filter === 'confirmed' ? 'blue' : 'warning'}
                            size="md"
                            onClick={() => goToDetails(item.booking_id)}
                            icon={<ArrowRightIcon className="w-5 h-5" />}
                          >
                            View Details
                          </AnimatedButton>
                        </div>
                      </div>
                    </NeonCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Location Status */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-orange-400" />
              Location Status
            </h3>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              {technicianLocation ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                    <span>Your location is being used to sort services by proximity</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {technicianLocation.lat.toFixed(6)}, {technicianLocation.lng.toFixed(6)}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-300">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
                  <span>Location access is disabled. Enable location services for better service sorting.</span>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
      
      {/* Map Modal */}
      <AnimatePresence>
        {showMapModal && selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-4xl"
            >
              <GlassCard className="p-6 relative">
                <button
                  onClick={closeMapModal}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
                >
                  ✕
                </button>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <MapPinIcon className="w-6 h-6 text-orange-400" />
                  Service Location
                </h2>
                
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
                  <h3 className="text-lg font-medium text-white mb-2">{selectedService.service_name}</h3>
                  <p className="text-gray-300 text-sm mb-2">
                    <strong>Date:</strong> {new Date(selectedService.booking_date).toLocaleString()}
                  </p>
                  <p className="text-gray-300 text-sm">
                    <strong>Status:</strong> <span className="capitalize">{selectedService.status}</span>
                  </p>
                </div>
                
                <div className="h-[400px] rounded-xl overflow-hidden border border-white/20 shadow-lg">
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
                    
                    {technicianLocation && (
                      <>
                        <Marker position={technicianLocation}>
                          <Popup>
                            <div className="text-center">
                              <strong>Your Location</strong><br />
                              Current position
                            </div>
                          </Popup>
                        </Marker>
                        
                        <RouteControl from={technicianLocation} to={[selectedService.location_lat, selectedService.location_lng]} />
                      </>
                    )}
                  </MapContainer>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <AnimatedButton
                    variant="ghost"
                    size="md"
                    onClick={closeMapModal}
                    icon={<XMarkIcon className="w-4 h-4" />}
                  >
                    Close
                  </AnimatedButton>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
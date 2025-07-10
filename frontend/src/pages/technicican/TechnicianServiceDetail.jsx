import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheckIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  KeyIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
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

export default function TechnicianServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [techLocation, setTechLocation] = useState(null);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("default"); // default | otp_sent | verified
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");
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

        const response = await axios.get(`http://127.0.0.1:5000/technician/service/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.data.details) {
          setDetails(response.data.details);
        } else {
          setError("Service details not found");
        }
      } catch (err) {
        console.error("Failed to fetch service details:", err);
        setError(err.response?.data?.message || "Failed to load service details");
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [id, navigate]);

  const handleSendOtp = async () => {
    try {
      setSendingOtp(true);
      setError(null);
      
      const token = sessionStorage.getItem("token");
      await axios.post(`http://127.0.0.1:5000/technician/send_otp/${id}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setStep("otp_sent");
    } catch (err) {
      console.error("Failed to send OTP:", err);
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError("Please enter the OTP");
      return;
    }
    
    try {
      setVerifyingOtp(true);
      setError(null);
      
      const token = sessionStorage.getItem("token");
      await axios.post(
        `http://127.0.0.1:5000/technician/verify_otp/${id}`,
        { otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setStep("verified");
      setDetails({ ...details, status: "completed" });
    } catch (err) {
      console.error("Failed to verify OTP:", err);
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setVerifyingOtp(false);
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
          <p className="text-white text-xl">Loading service details...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <GlassCard className="text-center p-8 max-w-md mx-auto">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Service Not Found</h2>
          <p className="text-gray-300 mb-6">{error || "The requested service could not be found."}</p>
          <AnimatedButton
            variant="primary"
            onClick={() => navigate('/technician/assigned')}
            icon={<ArrowLeftIcon className="w-5 h-5" />}
          >
            Back to Assigned Services
          </AnimatedButton>
        </GlassCard>
      </div>
    );
  }

  const servicePos = details.location_lat && details.location_lng 
    ? [details.location_lat, details.location_lng] 
    : [20.5937, 78.9629]; // Default to India center if no location

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
                  <ShieldCheckIcon className="w-10 h-10 text-orange-400" />
                  Service Details
                </h1>
                <p className="text-gray-300 text-lg">Manage your service appointment</p>
              </div>
              <AnimatedButton
                variant="ghost"
                size="lg"
                onClick={() => navigate('/technician/assigned')}
                icon={<ArrowLeftIcon className="w-5 h-5" />}
              >
                Back to Services
              </AnimatedButton>
            </div>
          </GlassCard>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Service Details */}
          <motion.div variants={itemVariants}>
            <NeonCard className="p-6" color="orange">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <DocumentTextIcon className="w-6 h-6 text-orange-400" />
                Appointment Information
              </h2>
              
              <div className="space-y-6">
                {/* Service Info */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5 text-orange-400" />
                    Service
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="font-medium">Service Name:</span>
                      <span>{details.service_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="font-medium">Booking ID:</span>
                      <span>#{details.booking_id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <CalendarDaysIcon className="w-4 h-4 text-orange-400" />
                      <span><strong>Date & Time:</strong> {new Date(details.booking_date).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <ClockIcon className="w-4 h-4 text-orange-400" />
                      <span><strong>Status:</strong> <span className={`capitalize ${
                        details.status === 'completed' ? 'text-emerald-400' : 'text-blue-400'
                      }`}>{details.status}</span></span>
                    </div>
                  </div>
                </div>
                
                {/* Customer Info */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-orange-400" />
                    Customer Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <UserIcon className="w-4 h-4 text-orange-400" />
                      <span><strong>Name:</strong> {details.user_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <PhoneIcon className="w-4 h-4 text-orange-400" />
                      <span><strong>Phone:</strong> {details.user_phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <EnvelopeIcon className="w-4 h-4 text-orange-400" />
                      <span><strong>Email:</strong> {details.user_email || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Timestamps */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-orange-400" />
                    Timestamps
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="font-medium">Created:</span>
                      <span>{new Date(details.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="font-medium">Updated:</span>
                      <span>{new Date(details.updated_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Completion Section */}
                {details.status !== "completed" && (
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-orange-400" />
                      Mark as Completed
                    </h3>
                    
                    <AnimatePresence mode="wait">
                      {step === "default" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <p className="text-gray-300 mb-4">
                            Once you've completed the service, send an OTP to the customer for verification.
                          </p>
                          <AnimatedButton
                            variant="primary"
                            size="lg"
                            onClick={handleSendOtp}
                            loading={sendingOtp}
                            disabled={sendingOtp}
                            icon={!sendingOtp && <KeyIcon className="w-5 h-5" />}
                            className="w-full"
                          >
                            {sendingOtp ? 'Sending OTP...' : 'Send OTP to Customer'}
                          </AnimatedButton>
                        </motion.div>
                      )}

                      {step === "otp_sent" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4"
                        >
                          <p className="text-emerald-400 mb-2">
                            OTP has been sent to the customer. Ask them to check their phone.
                          </p>
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter OTP from customer"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                              />
                            </div>
                            <AnimatedButton
                              variant="primary"
                              size="lg"
                              onClick={handleVerifyOtp}
                              loading={verifyingOtp}
                              disabled={verifyingOtp || !otp.trim()}
                              icon={!verifyingOtp && <CheckCircleIcon className="w-5 h-5" />}
                            >
                              {verifyingOtp ? 'Verifying...' : 'Verify & Complete'}
                            </AnimatedButton>
                          </div>
                          {error && (
                            <p className="text-red-400 text-sm">{error}</p>
                          )}
                        </motion.div>
                      )}

                      {step === "verified" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-center py-4"
                        >
                          <CheckCircleIcon className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-white mb-2">Service Completed!</h3>
                          <p className="text-gray-300">
                            The service has been marked as completed successfully.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </NeonCard>
          </motion.div>

          {/* Map Section */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <MapPinIcon className="w-6 h-6 text-orange-400" />
                Service Location
              </h2>
              
              <div className="h-[500px] rounded-xl overflow-hidden border border-white/20 shadow-lg">
                <MapContainer
                  center={servicePos}
                  zoom={13}
                  scrollWheelZoom={true}
                  className="h-full w-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  <Marker position={servicePos}>
                    <Popup>
                      <div className="text-center">
                        <strong>Service Location</strong><br />
                        {details.user_name}'s location
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
                      
                      <RouteControl from={techLocation} to={servicePos} />
                    </>
                  )}
                </MapContainer>
              </div>
              
              <div className="mt-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPinIcon className="w-5 h-5 text-orange-400" />
                  <span>
                    {techLocation 
                      ? 'Route to service location is displayed on the map'
                      : 'Enable location services to see the route to the service location'}
                  </span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
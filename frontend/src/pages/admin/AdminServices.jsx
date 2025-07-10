import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheckIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  SparklesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs } from '../../components/ui/FloatingElements';

const getEmoji = (pest_type) => {
  const emojiMap = {
    'rodent': '🐀',
    'worm': '🪱', 
    'insect': '🐜',
    'fungus': '🍄',
    'mosquito': '🦟',
    'termite': '🐛',
    'cockroach': '🪳',
    'spider': '🕷️',
  };
  return emojiMap[pest_type?.toLowerCase()] || '❓';
};

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchServices = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:5000/admin/services", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setServices(response.data.services || []);
    } catch (error) {
      console.error("Failed to fetch services:", error);
      toast.error(error.response?.data?.message || "Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEdit = (serviceId) => {
    navigate(`edit_service/${serviceId}`);
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    
    setIsDeleting(true);
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(
        `http://127.0.0.1:5000/admin/services/delete_service/${serviceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true
        }
      );
      toast.success("Service deleted successfully");
      setServices(prev => prev.filter(service => service.service_id !== serviceId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete service");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAdd = () => {
    navigate('add_service');
  };

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.service_type]) acc[service.service_type] = {};
    if (!acc[service.service_type][service.category]) {
      acc[service.service_type][service.category] = [];
    }
    acc[service.service_type][service.category].push(service);
    return acc;
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading services...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 relative overflow-hidden">
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
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                  <ShieldCheckIcon className="w-10 h-10 text-blue-400" />
                  Service Management
                </h1>
                <p className="text-gray-300 text-lg">Manage your pest control services</p>
              </div>
              <AnimatedButton
                variant="blue"
                size="lg"
                onClick={handleAdd}
                icon={<PlusIcon className="w-5 h-5" />}
              >
                Add New Service
              </AnimatedButton>
            </div>
          </GlassCard>
        </motion.div>

        {/* Services Content */}
        {Object.keys(groupedServices).length === 0 ? (
          <motion.div variants={itemVariants}>
            <GlassCard className="p-12 text-center">
              <ExclamationTriangleIcon className="w-20 h-20 text-gray-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">No services found</h2>
              <p className="text-gray-400 mb-8 text-lg">Start by adding your first service</p>
              <AnimatedButton
                variant="blue"
                size="lg"
                onClick={handleAdd}
                icon={<PlusIcon className="w-5 h-5" />}
              >
                Add First Service
              </AnimatedButton>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="space-y-12">
            <AnimatePresence>
              {Object.entries(groupedServices).map(([serviceType, categories], typeIndex) => (
                <motion.div
                  key={serviceType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: typeIndex * 0.1 }}
                >
                  <GlassCard className="p-6">
                    <h2 className="text-3xl font-bold text-white mb-6 border-b border-white/20 pb-4">
                      {serviceType}
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {Object.entries(categories).map(([category, servicesList], catIndex) => (
                        <motion.div
                          key={category}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (typeIndex * 2 + catIndex) * 0.1 }}
                        >
                          <NeonCard className="p-6" color="blue">
                            <h3 className="text-2xl font-semibold text-white mb-6 border-b border-white/20 pb-3">
                              {category}
                            </h3>

                            <div className="space-y-4">
                              {servicesList.map((service, serviceIndex) => (
                                <motion.div
                                  key={service.service_id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: (typeIndex * 4 + catIndex * 2 + serviceIndex) * 0.05 }}
                                  whileHover={{ scale: 1.02 }}
                                  className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="text-2xl">
                                        {getEmoji(service.pest_type)}
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-white">{service.name}</h4>
                                        <p className="text-sm text-gray-400 capitalize">
                                          {service.pest_type || 'General'}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <AnimatedButton
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(service.service_id)}
                                        icon={<PencilIcon className="w-4 h-4" />}
                                      >
                                        Edit
                                      </AnimatedButton>
                                      <AnimatedButton
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(service.service_id)}
                                        disabled={isDeleting}
                                        icon={<TrashIcon className="w-4 h-4" />}
                                      >
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                      </AnimatedButton>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </NeonCard>
                        </motion.div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
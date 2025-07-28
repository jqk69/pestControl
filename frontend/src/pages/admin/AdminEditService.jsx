import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheckIcon,
  CheckIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  TagIcon,
  BugAntIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs } from '../../components/ui/FloatingElements';

export default function AdminEditService() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [serviceType, setServiceType] = useState("");
  const [customServiceType, setCustomServiceType] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [name, setName] = useState("");
  const [techniciansNeeded, setTechniciansNeeded] = useState(1);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pestType, setPestType] = useState("");
  const [customPestType, setCustomPestType] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [error, setError] = useState("");

  const serviceTypeOptions = ["Home Service", "Industrial Service", "Custom"];
  const categoryOptions = ["General", "Pest Control", "Custom"];
  const pestTypeOptions = ["General", "Rodent", "Insect", "Mosquito", "Worm", "Fungus", "Other", "Custom"];

  useEffect(() => {
    const fetchService = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated. Please login.");
        navigate("/login");
        return;
      }

      try {
        setInitialLoading(true);
        setError("");

        const response = await axios.get(
          `http://127.0.0.1:5000/admin/services/edit_service/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        if (response.data?.data) {
          const service = response.data.data;
          setName(service.name || "");
          setDescription(service.description || "");
          setPrice(service.price || "");
          setTechniciansNeeded(service.technicians_needed || 1);
          setPestType(service.pest_type || "");
          setDurationMinutes(service.duration_minutes || 30);

          if (serviceTypeOptions.includes(service.service_type)) {
            setServiceType(service.service_type);
            setCustomServiceType("");
          } else {
            setServiceType("Custom");
            setCustomServiceType(service.service_type || "");
          }

          if (categoryOptions.includes(service.category)) {
            setCategory(service.category);
            setCustomCategory("");
          } else {
            setCategory("Custom");
            setCustomCategory(service.category || "");
          }

          if (pestTypeOptions.includes(service.pest_type)) {
            setPestType(service.pest_type);
            setCustomPestType("");
          } else if (service.pest_type) {
            setPestType("Custom");
            setCustomPestType(service.pest_type);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load service");
        toast.error(err.response?.data?.message || "Failed to load service");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchService();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("Not authenticated. Please login.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const finalServiceType = serviceType === "Custom" ? customServiceType : serviceType;
      const finalCategory = category === "Custom" ? customCategory : category;
      const finalPestType = pestType === "Custom" ? customPestType : pestType;

      await axios.patch(
        `http://127.0.0.1:5000/admin/services/edit_service/${id}`,
        {
          name,
          description,
          price,
          technicians_needed: techniciansNeeded,
          service_type: finalServiceType,
          category: finalCategory,
          pest_type: finalPestType,
          duration_minutes: durationMinutes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      toast.success("Service updated successfully!");
      navigate("/admin/services");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update service");
      toast.error(err.response?.data?.message || "Failed to update service");
    } finally {
      setLoading(false);
    }
  };

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

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading service details...</p>
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
                  Edit Service
                </h1>
                <p className="text-gray-300 text-lg">Update service information</p>
              </div>
              <AnimatedButton
                variant="ghost"
                size="lg"
                onClick={() => navigate('/admin/services')}
                icon={<ArrowLeftIcon className="w-5 h-5" />}
              >
                Back to Services
              </AnimatedButton>
            </div>
          </GlassCard>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <GlassCard className="p-4 border-l-4 border-red-500">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
                  <p className="text-red-400">{error}</p>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Service Form */}
        <motion.div variants={itemVariants}>
          <NeonCard className="p-6" color="blue">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Service Type & Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <BuildingOfficeIcon className="w-4 h-4 text-blue-400" />
                    Service Type
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    required
                    disabled={loading}
                  >
                    <option value="" disabled className="bg-gray-800">
                      Select service type
                    </option>
                    {serviceTypeOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-gray-800">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {serviceType === "Custom" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <TagIcon className="w-4 h-4 text-blue-400" />
                      Custom Service Type
                    </label>
                    <input
                      type="text"
                      value={customServiceType}
                      onChange={(e) => setCustomServiceType(e.target.value)}
                      placeholder="Enter custom service type"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={serviceType === "Custom"}
                      disabled={loading}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <TagIcon className="w-4 h-4 text-blue-400" />
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    required
                    disabled={loading}
                  >
                    <option value="" disabled className="bg-gray-800">
                      Select category
                    </option>
                    {categoryOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-gray-800">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {category === "Custom" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <TagIcon className="w-4 h-4 text-blue-400" />
                      Custom Category
                    </label>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter custom category"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={category === "Custom"}
                      disabled={loading}
                    />
                  </div>
                )}
              </div>

              {/* Duration, Technicians, Price */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-blue-400" />
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    placeholder="Duration in minutes"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <UserGroupIcon className="w-4 h-4 text-blue-400" />
                    Technicians Needed
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={techniciansNeeded}
                    onChange={(e) => setTechniciansNeeded(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <CurrencyDollarIcon className="w-4 h-4 text-blue-400" />
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={30001}
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Price"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Pest Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <BugAntIcon className="w-4 h-4 text-blue-400" />
                    Pest Type
                  </label>
                  <select
                    value={pestType}
                    onChange={(e) => setPestType(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    required
                    disabled={loading}
                  >
                    <option value="" disabled className="bg-gray-800">
                      Select pest type
                    </option>
                    {pestTypeOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-gray-800">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {pestType === "Custom" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <BugAntIcon className="w-4 h-4 text-blue-400" />
                      Custom Pest Type
                    </label>
                    <input
                      type="text"
                      value={customPestType}
                      onChange={(e) => setCustomPestType(e.target.value)}
                      placeholder="Enter custom pest type"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={pestType === "Custom"}
                      disabled={loading}
                    />
                  </div>
                )}
              </div>

              {/* Service Name & Description */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <TagIcon className="w-4 h-4 text-blue-400" />
                    Service Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Service name"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4 text-blue-400" />
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed description"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-32"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Service Guidelines */}
              <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-400" />
                  Service Guidelines
                </h3>
                <ul className="space-y-3 text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>Provide clear, detailed descriptions of what the service includes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>Set appropriate duration based on service complexity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>Assign the correct number of technicians needed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>Ensure pricing is competitive and reflects service value</span>
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-white/20">
                <AnimatedButton
                  type="submit"
                  variant="neon"
                  size="lg"
                  loading={loading}
                  disabled={loading}
                  icon={!loading && <CheckIcon className="w-5 h-5" />}
                  className="w-full"
                  color="blue"
                >
                  {loading ? 'Updating Service...' : 'Update Service'}
                </AnimatedButton>
              </div>
            </form>
          </NeonCard>
        </motion.div>
      </div>
    </div>
  );
}
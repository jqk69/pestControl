import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  SparklesIcon,
  FunnelIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
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

const UserService = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serviceType, setServiceType] = useState('');
  const [category, setCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/user/services', {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
        });
        if (response.data.success) {
          setServices(response.data.services);
        } else {
          setError('Failed to load services');
        }
      } catch {
        setError('Error fetching services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    let filtered = services;
    if (serviceType) filtered = filtered.filter((service) => service.service_type === serviceType);
    if (category) filtered = filtered.filter((service) => service.category === category);
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(lowerSearch) ||
          service.description.toLowerCase().includes(lowerSearch) ||
          service.pest_type?.toLowerCase().includes(lowerSearch)
      );
    }
    setFilteredServices(filtered);
  }, [services, serviceType, category, searchTerm]);

  const handleBookNow = (id) => navigate(`/user/service/${id}`);

  const serviceTypes = [...new Set(services.map((s) => s.service_type))];
  const categories = [...new Set(services.map((s) => s.category))];

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading premium services...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <GlassCard className="text-center p-8 max-w-md mx-auto">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <AnimatedButton
            variant="primary"
            onClick={() => window.location.reload()}
            icon={<SparklesIcon className="w-4 h-4" />}
          >
            Try Again
          </AnimatedButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 relative overflow-hidden">
      <FloatingOrbs />
      
      {/* Hero Section */}
      <div className="relative z-10">
        <motion.div
          className="bg-gradient-to-r from-emerald-600/20 to-teal-500/20 backdrop-blur-xl border-b border-white/10 py-20 text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-6"
          >
            <ShieldCheckIcon className="w-20 h-20 mx-auto text-emerald-400" />
          </motion.div>
          
          <motion.h1 
            className="text-6xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
          >
            Elite Pest Control
          </motion.h1>
          
          <motion.p 
            className="text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Professional pest elimination services with guaranteed results and eco-friendly solutions
          </motion.p>

          <motion.div 
            className="max-w-2xl mx-auto relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="text-gray-400 w-6 h-6" />
            </div>
            <input
              type="text"
              placeholder="Search services by name, type, or pest..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-xl text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-400 text-lg"
            />
          </motion.div>
        </motion.div>

        {/* Filters */}
        <div className="container mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <GlassCard className="p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FunnelIcon className="w-5 h-5 text-emerald-400" />
                  Filter Services
                </h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden text-emerald-400 hover:text-emerald-300"
                >
                  <ChevronDownIcon className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Service Type</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full p-3 border border-white/20 bg-white/10 backdrop-blur-xl text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="" className="bg-gray-800">All Types</option>
                    {serviceTypes.map((type) => (
                      <option key={type} value={type} className="bg-gray-800">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 border border-white/20 bg-white/10 backdrop-blur-xl text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="" className="bg-gray-800">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-gray-800">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(serviceType || category) && (
                <div className="mt-4 flex gap-2">
                  <AnimatedButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setServiceType('');
                      setCategory('');
                    }}
                  >
                    Clear Filters
                  </AnimatedButton>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Services Grid */}
          {filteredServices.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <GlassCard className="max-w-md mx-auto p-8">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-white mb-2">No services found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your search or filter criteria</p>
                <AnimatedButton
                  variant="primary"
                  onClick={() => {
                    setSearchTerm('');
                    setServiceType('');
                    setCategory('');
                  }}
                  icon={<SparklesIcon className="w-4 h-4" />}
                >
                  Show All Services
                </AnimatedButton>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.service_id}
                  variants={itemVariants}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group"
                >
                  <NeonCard className="h-full flex flex-col overflow-hidden" color="emerald">
                    {/* Service Icon/Emoji */}
                    <div className="h-32 flex justify-center items-center bg-gradient-to-br from-emerald-500/20 to-teal-500/20 relative overflow-hidden">
                      <motion.div
                        className="text-6xl"
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        {getEmoji(service.pest_type)}
                      </motion.div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      {/* Service Header */}
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {service.name}
                        </h3>
                        <span className="text-xs px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                          {service.category}
                        </span>
                      </div>

                      <p className="text-gray-400 text-sm mb-4 flex-1 line-clamp-3">
                        {service.description}
                      </p>

                      {/* Service Details */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-300">
                            <UserGroupIcon className="w-4 h-4 text-emerald-400" />
                            <span>Technicians</span>
                          </div>
                          <span className="text-white font-medium">{service.technicians_needed}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-300">
                            <ClockIcon className="w-4 h-4 text-emerald-400" />
                            <span>Duration</span>
                          </div>
                          <span className="text-white font-medium">
                            {service.duration_minutes ? `${service.duration_minutes} min` : 'Varies'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-300">
                            <CurrencyDollarIcon className="w-4 h-4 text-emerald-400" />
                            <span>Price</span>
                          </div>
                          <span className="text-2xl font-bold text-emerald-400">₹{service.price}</span>
                        </div>
                      </div>

                      {/* Book Button */}
                      <AnimatedButton
                        variant="primary"
                        size="md"
                        onClick={() => handleBookNow(service.service_id)}
                        icon={<ShieldCheckIcon className="w-4 h-4" />}
                        className="w-full"
                      >
                        Book Service
                      </AnimatedButton>
                    </div>
                  </NeonCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserService;
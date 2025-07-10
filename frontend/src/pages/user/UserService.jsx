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
  ChevronDownIcon,
  BugAntIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  MapPinIcon,
  BeakerIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs, ParticleField } from '../../components/ui/FloatingElements';

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
  const [featuredService, setFeaturedService] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = sessionStorage.getItem('token');
        if (!token) {
          setError('Please login to view services');
          navigate('/login');
          return;
        }

        console.log('Fetching services...');
        
        const response = await axios.get('http://127.0.0.1:5000/user/services', {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        console.log('Services response:', response.data);

        let fetchedServices = [];

        if (response.data.success && response.data.services) {
          fetchedServices = response.data.services;
        } else if (Array.isArray(response.data)) {
          fetchedServices = response.data;
        } else {
          console.error('Unexpected response format:', response.data);
          setError('Invalid response format from server');
          return;
        }

        // Set a featured service (first premium one or just the first one)
        const premium = fetchedServices.find(s => s.price > 1000) || fetchedServices[0];
        setFeaturedService(premium);
        
        setServices(fetchedServices);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err.response?.data?.message || err.message || 'Error fetching services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [navigate]);

  useEffect(() => {
    let filtered = services;
    
    // Filter by tab
    if (activeTab === 'premium') {
      filtered = filtered.filter(service => service.price > 1000);
    } else if (activeTab === 'residential') {
      filtered = filtered.filter(service => service.service_type === 'Home Service');
    } else if (activeTab === 'commercial') {
      filtered = filtered.filter(service => service.service_type === 'Industrial Service');
    }
    
    // Apply additional filters
    if (serviceType) filtered = filtered.filter((service) => service.service_type === serviceType);
    if (category) filtered = filtered.filter((service) => service.category === category);
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.name?.toLowerCase().includes(lowerSearch) ||
          service.description?.toLowerCase().includes(lowerSearch) ||
          service.pest_type?.toLowerCase().includes(lowerSearch)
      );
    }
    
    setFilteredServices(filtered);
  }, [services, serviceType, category, searchTerm, activeTab]);

  const handleBookNow = (id) => navigate(`/user/services/${id}`);

  const serviceTypes = [...new Set(services.map((s) => s.service_type).filter(Boolean))];
  const categories = [...new Set(services.map((s) => s.category).filter(Boolean))];
  const pestTypes = [...new Set(services.map((s) => s.pest_type).filter(Boolean))];

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-20 h-20 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
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
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
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
      <ParticleField />
      
      {/* Enhanced Hero Section */}
      <div className="relative z-10">
        <motion.div
          className="bg-gradient-to-r from-emerald-600/20 to-teal-500/20 backdrop-blur-xl border-b border-white/10 py-20 text-center relative overflow-hidden"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full opacity-10"
                style={{
                  background: `linear-gradient(45deg, #10b981, #06b6d4)`,
                  width: 150 + i * 100,
                  height: 150 + i * 100,
                  left: `${20 + i * 20}%`,
                  top: `${10 + i * 20}%`,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 15 + i * 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>
          
          <div className="relative z-10 max-w-5xl mx-auto px-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-6"
            >
              <ShieldCheckIcon className="w-20 h-20 mx-auto text-emerald-400" />
            </motion.div>
            
            <motion.h1 
              className="text-6xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
            >
              Professional Pest Control
            </motion.h1>
            
            <motion.p 
              className="text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Expert solutions for every pest problem with guaranteed results and eco-friendly options
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
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-xl text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-400 text-lg shadow-lg"
              />
            </motion.div>
            
            {/* Service Stats */}
            <motion.div 
              className="flex flex-wrap justify-center gap-8 mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {[
                { value: '24/7', label: 'Support', icon: ClockIcon },
                { value: '100%', label: 'Satisfaction', icon: CheckCircleIcon },
                { value: '1000+', label: 'Happy Customers', icon: UserGroupIcon },
              ].map((stat, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content Container */}
        <div className="container mx-auto px-6 py-12">
          {/* Featured Service */}
          {featuredService && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mb-12"
            >
              <NeonCard className="overflow-hidden" color="emerald">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-emerald-500/20 text-emerald-400 text-sm font-medium px-3 py-1 rounded-full">
                        {featuredService.category || 'Premium Service'}
                      </span>
                      <span className="bg-yellow-500/20 text-yellow-400 text-sm font-medium px-3 py-1 rounded-full flex items-center">
                        <StarIcon className="w-3 h-3 mr-1" />
                        Featured
                      </span>
                    </div>
                    
                    <h2 className="text-3xl font-bold text-white mb-4">
                      {featuredService.name}
                    </h2>
                    
                    <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                      {featuredService.description || 'Our premium service offers comprehensive pest control with guaranteed results. Professional technicians, eco-friendly solutions, and long-lasting protection for your home or business.'}
                    </p>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                        <CurrencyDollarIcon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                        <div className="text-xl font-bold text-white">₹{featuredService.price}</div>
                        <div className="text-xs text-gray-400">Fixed Price</div>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                        <ClockIcon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                        <div className="text-xl font-bold text-white">{featuredService.duration_minutes || 60} min</div>
                        <div className="text-xs text-gray-400">Duration</div>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                        <UserGroupIcon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                        <div className="text-xl font-bold text-white">{featuredService.technicians_needed}</div>
                        <div className="text-xs text-gray-400">Technicians</div>
                      </div>
                    </div>

                    <AnimatedButton
                      variant="neon"
                      size="lg"
                      onClick={() => handleBookNow(featuredService.service_id)}
                      icon={<ArrowRightIcon className="w-5 h-5" />}
                    >
                      Book Premium Service
                    </AnimatedButton>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="w-64 h-64 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 flex items-center justify-center"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 8,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <div className="text-9xl">
                          {getEmoji(featuredService.pest_type) || '🛡️'}
                        </div>
                      </motion.div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                </div>
              </NeonCard>
            </motion.div>
          )}

          {/* Service Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="mb-8"
          >
            <GlassCard className="p-6">
              <div className="flex flex-wrap gap-4">
                {[
                  { id: 'all', label: 'All Services', icon: ShieldCheckIcon },
                  { id: 'premium', label: 'Premium', icon: StarIcon },
                  { id: 'residential', label: 'Residential', icon: MapPinIcon },
                  { id: 'commercial', label: 'Commercial', icon: BuildingStorefrontIcon },
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </motion.button>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Advanced Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="mb-8"
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FunnelIcon className="w-5 h-5 text-emerald-400" />
                  Advanced Filters
                </h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden text-emerald-400 hover:text-emerald-300"
                >
                  <ChevronDownIcon className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Pest Type</label>
                  <select
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border border-white/20 bg-white/10 backdrop-blur-xl text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="" className="bg-gray-800">All Pests</option>
                    {pestTypes.map((type) => (
                      <option key={type} value={type} className="bg-gray-800">
                        {type} {getEmoji(type)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(serviceType || category || searchTerm) && (
                <div className="mt-4 flex gap-2">
                  <AnimatedButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setServiceType('');
                      setCategory('');
                      setSearchTerm('');
                    }}
                    icon={<SparklesIcon className="w-4 h-4" />}
                  >
                    Clear Filters
                  </AnimatedButton>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Services Grid */}
          {filteredServices.length === 0 ? (
            <div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <GlassCard className="max-w-md mx-auto p-8">
                <ExclamationTriangleIcon className="w-16 h-16 text-gray-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">No services found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your search or filter criteria</p>
                <AnimatedButton
                  variant="primary"
                  onClick={() => {
                    setSearchTerm('');
                    setServiceType('');
                    setCategory('');
                    setActiveTab('all');
                  }}
                  icon={<SparklesIcon className="w-4 h-4" />}
                >
                  Show All Services
                </AnimatedButton>
              </GlassCard>
            </div>
          ) : (
            <div
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
                    {/* Service Icon/Emoji with Animated Background */}
                    <div className="h-32 flex justify-center items-center bg-gradient-to-br from-emerald-500/20 to-teal-500/20 relative overflow-hidden">
                      <motion.div
                        className="absolute inset-0 opacity-30"
                        animate={{ 
                          background: [
                            'radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
                            'radial-gradient(circle at 70% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
                            'radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)'
                          ]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <motion.div
                        className="text-6xl z-10"
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
                          {service.name || 'Unnamed Service'}
                        </h3>
                        <span className="text-xs px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                          {service.category || 'General'}
                        </span>
                      </div>

                      <p className="text-gray-400 text-sm mb-4 flex-1 line-clamp-3">
                        {service.description || 'No description available'}
                      </p>

                      {/* Service Details */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-300">
                            <UserGroupIcon className="w-4 h-4 text-emerald-400" />
                            <span>Technicians</span>
                          </div>
                          <span className="text-white font-medium">{service.technicians_needed || 1}</span>
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
                          <span className="text-2xl font-bold text-emerald-400">₹{service.price || 0}</span>
                        </div>
                      </div>

                      {/* Book Button */}
                      <AnimatedButton
                        variant="neon"
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
            </div>
          )}
        </div>
        
        {/* Why Choose Us Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="bg-gradient-to-r from-emerald-600/20 to-teal-500/20 backdrop-blur-xl border-t border-white/10 py-16 mt-12"
        >
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Why Choose Our Services</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                We deliver exceptional pest control with guaranteed results and eco-friendly solutions
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: CheckCircleIcon,
                  title: "Certified Experts",
                  description: "Our technicians are certified professionals with years of experience in pest control"
                },
                {
                  icon: BeakerIcon,
                  title: "Eco-Friendly Solutions",
                  description: "We use environmentally responsible products that are safe for your family and pets"
                },
                {
                  icon: ShieldCheckIcon,
                  title: "Guaranteed Results",
                  description: "We stand behind our work with a 100% satisfaction guarantee on all services"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2 + index * 0.2 }}
                  className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center mb-6 mx-auto">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 text-center">{feature.title}</h3>
                  <p className="text-gray-300 text-center">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2 }}
          className="container mx-auto px-6 py-16"
        >
          <GlassCard className="p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready for a Pest-Free Environment?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Book your service today and enjoy a cleaner, healthier space tomorrow
            </p>
            <AnimatedButton
              variant="neon"
              size="lg"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              icon={<SparklesIcon className="w-5 h-5" />}
            >
              Explore Services
            </AnimatedButton>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default UserService;
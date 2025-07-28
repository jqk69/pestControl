import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBagIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs, ParticleField } from '../../components/ui/FloatingElements';

const STATUSES = ['all', 'ordered', 'shipped', 'delivered', 'cancelled'];

const statusConfig = {
  ordered: { color: 'blue', icon: ClockIcon, label: 'Ordered' },
  shipped: { color: 'orange', icon: TruckIcon, label: 'Shipped' },
  delivered: { color: 'emerald', icon: CheckCircleIcon, label: 'Delivered' },
  cancelled: { color: 'red', icon: XCircleIcon, label: 'Cancelled' },
};

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Please login to view your orders');
      navigate('/login');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('http://127.0.0.1:5000/user/cart/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch = !searchTerm || 
      order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.delivery_address?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
          <p className="text-white text-xl">Loading your orders...</p>
        </motion.div>
      </div>
    );
  }

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
        {/* Enhanced Header */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
              className="relative z-10"
            >
              <ShoppingBagIcon className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
            </motion.div>
            <motion.h1 
              className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Your Order History
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-300"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Track and manage all your purchases
            </motion.p>
          </GlassCard>
        </motion.div>

        {/* Search and Filters */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by product name or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1); // Reset to first page when filter changes
                  }}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all" className="bg-gray-800">All Orders</option>
                  <option value="ordered" className="bg-gray-800">Ordered</option>
                  <option value="shipped" className="bg-gray-800">Shipped</option>
                  <option value="delivered" className="bg-gray-800">Delivered</option>
                  <option value="cancelled" className="bg-gray-800">Cancelled</option>
                </select>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Status Tabs */}
        <motion.div variants={itemVariants}>
          <div className="flex flex-wrap gap-3">
            {STATUSES.map((status) => (
              <motion.button
                key={status}
                onClick={() => {
                  setFilterStatus(status);
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  filterStatus === status
                    ? status === 'all'
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                      : `bg-${statusConfig[status]?.color || 'gray'}-500 text-white shadow-lg shadow-${statusConfig[status]?.color || 'gray'}-500/25`
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {status === 'all' ? 'All Orders' : statusConfig[status]?.label || status}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <motion.div variants={itemVariants}>
            <GlassCard className="p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-emerald-500/5" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="relative z-10"
              >
                <ExclamationTriangleIcon className="w-24 h-24 text-gray-500 mx-auto mb-6" />
              </motion.div>
              <h2 className="text-4xl font-bold text-white mb-4">No orders found</h2>
              <p className="text-gray-400 mb-8 text-lg max-w-md mx-auto">
                {orders.length === 0 
                  ? 'Start shopping to see your orders here'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              <AnimatedButton
                variant="neon"
                size="lg"
                onClick={() => navigate('/user/store')}
                icon={<ShoppingBagIcon className="w-5 h-5" />}
              >
                Start Shopping
              </AnimatedButton>
            </GlassCard>
          </motion.div>
        ) : (
          <>
            <motion.div variants={itemVariants} className="space-y-6">
              <AnimatePresence>
                {currentOrders.map((item, index) => {
                  const config = statusConfig[item.status] || { color: 'gray', icon: ClockIcon, label: item.status };
                  const StatusIcon = config.icon;
                  
                  return (
                    <motion.div
                      key={item.cart_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <NeonCard className="p-6 relative overflow-hidden" color={config.color}>
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-transparent" />
                        
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                          {/* Order Info */}
                          <div className="flex-1">
                            <div className="flex items-start gap-4">
                              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0 shadow-lg">
                                <img
                                  src={`http://127.0.0.1:5000/static/products/${item.image_path}`}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => (e.target.src = '/placeholder-image.jpg')}
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-3">{item.name}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                  <div className="flex items-center gap-2 text-gray-300">
                                    <ShoppingBagIcon className="w-4 h-4 text-emerald-400" />
                                    <span><strong>Order ID:</strong> #{item.cart_id}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-300">
                                    <CalendarDaysIcon className="w-4 h-4 text-emerald-400" />
                                    <span><strong>Ordered:</strong> {item.order_date ? new Date(item.order_date).toLocaleDateString() : 'N/A'}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-300">
                                    <UserIcon className="w-4 h-4 text-emerald-400" />
                                    <span><strong>Quantity:</strong> {item.quantity}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-300">
                                    <PhoneIcon className="w-4 h-4 text-emerald-400" />
                                    <span><strong>Phone:</strong> {item.phone || 'N/A'}</span>
                                  </div>
                                  {item.delivery_address && (
                                    <div className="flex items-start gap-2 text-gray-300 md:col-span-2">
                                      <MapPinIcon className="w-4 h-4 text-emerald-400 mt-0.5" />
                                      <span><strong>Address:</strong> {item.delivery_address}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Status and Price */}
                          <div className="flex flex-col items-end gap-4">
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`w-5 h-5 text-${config.color}-400`} />
                              <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${config.color}-500/20 text-${config.color}-400 border border-${config.color}-500/30`}>
                                {config.label}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <CurrencyDollarIcon className="w-5 h-5 text-emerald-400" />
                                <span className="text-2xl font-bold text-emerald-400">
                                  ₹{(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400">₹{item.price} × {item.quantity}</p>
                            </div>
                            
                            {/* Action Buttons */}
                            {item.status === 'delivered' && (
                              <AnimatedButton
                                variant="primary"
                                size="sm"
                                onClick={() => navigate(`/user/store/`)}
                                icon={<ShoppingBagIcon className="w-4 h-4" />}
                              >
                                Buy Again
                              </AnimatedButton>
                            )}
                          </div>
                        </div>
                      </NeonCard>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div variants={itemVariants} className="flex justify-center mt-8">
                <GlassCard className="p-4 flex items-center gap-2">
                  <AnimatedButton
                    variant="ghost"
                    size="sm"
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    icon={<ArrowLeftIcon className="w-4 h-4" />}
                  >
                    Prev
                  </AnimatedButton>
                  
                  <div className="flex gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <motion.button
                        key={i}
                        onClick={() => paginate(i + 1)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          currentPage === i + 1
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {i + 1}
                      </motion.button>
                    ))}
                  </div>
                  
                  <AnimatedButton
                    variant="ghost"
                    size="sm"
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    icon={<ArrowRightIcon className="w-4 h-4" />}
                  >
                    Next
                  </AnimatedButton>
                </GlassCard>
              </motion.div>
            )}
          </>
        )}

        {/* Order Summary */}
        {filteredOrders.length > 0 && (
          <motion.div variants={itemVariants}>
            <GlassCard className="p-6">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <ShoppingBagIcon className="w-6 h-6 text-emerald-400" />
                Order Summary
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                {[
                  { 
                    label: 'Total Orders', 
                    value: orders.length, 
                    icon: ShoppingBagIcon,
                    color: 'emerald'
                  },
                  { 
                    label: 'Delivered', 
                    value: orders.filter(o => o.status === 'delivered').length, 
                    icon: CheckCircleIcon,
                    color: 'emerald'
                  },
                  { 
                    label: 'In Progress', 
                    value: orders.filter(o => ['ordered', 'shipped'].includes(o.status)).length, 
                    icon: TruckIcon,
                    color: 'blue'
                  },
                  { 
                    label: 'Cancelled', 
                    value: orders.filter(o => o.status === 'cancelled').length, 
                    icon: XCircleIcon,
                    color: 'red'
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className="p-4 bg-white/5 rounded-xl border border-white/10"
                  >
                    <stat.icon className={`w-8 h-8 mx-auto mb-2 text-${stat.color}-400`} />
                    <div className={`text-2xl font-bold text-${stat.color}-400 mb-1`}>{stat.value}</div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
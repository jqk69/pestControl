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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs } from '../../components/ui/FloatingElements';

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
    const matchesSearch = !searchTerm || order.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
          <p className="text-white text-xl">Loading your orders...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 relative overflow-hidden">
      <FloatingOrbs />
      
      <motion.div
        className="relative z-10 p-6 max-w-7xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                  <ShoppingBagIcon className="w-10 h-10 text-emerald-400" />
                  Your Orders
                </h1>
                <p className="text-gray-300 text-lg">Track and manage your purchases</p>
              </div>

              {/* Search */}
              <div className="relative w-full md:w-80">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Status Filter */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <FunnelIcon className="w-5 h-5 text-emerald-400" />
              <span className="text-white font-medium">Filter by status:</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {STATUSES.map((status) => (
                <motion.button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filterStatus === status
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {status === 'all' ? 'All Orders' : statusConfig[status]?.label || status}
                </motion.button>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <motion.div variants={itemVariants}>
            <GlassCard className="p-12 text-center">
              <ExclamationTriangleIcon className="w-20 h-20 text-gray-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">
                {orders.length === 0 ? 'No orders found' : 'No matching orders'}
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                {orders.length === 0 
                  ? 'Start shopping to see your orders here'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              <AnimatedButton
                variant="primary"
                size="lg"
                onClick={() => navigate('/user/store')}
                icon={<ShoppingBagIcon className="w-5 h-5" />}
              >
                Start Shopping
              </AnimatedButton>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="space-y-6">
            <AnimatePresence>
              {filteredOrders.map((item, index) => {
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
                    <NeonCard className="p-6" color={config.color}>
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        {/* Order Info */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                              <img
                                src={`http://127.0.0.1:5000/static/products/${item.image_path}`}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => (e.target.src = '/placeholder-image.jpg')}
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <p className="text-gray-300">
                                  <span className="font-medium">Quantity:</span> {item.quantity}
                                </p>
                                <p className="text-gray-300">
                                  <span className="font-medium">Order ID:</span> #{item.cart_id}
                                </p>
                                {item.delivery_address && (
                                  <p className="text-gray-300 md:col-span-2">
                                    <span className="font-medium">Address:</span> {item.delivery_address}
                                  </p>
                                )}
                                {item.phone && (
                                  <p className="text-gray-300">
                                    <span className="font-medium">Phone:</span> {item.phone}
                                  </p>
                                )}
                                {item.order_date && (
                                  <p className="text-gray-300">
                                    <span className="font-medium">Ordered:</span> {new Date(item.order_date).toLocaleDateString()}
                                  </p>
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
                            <p className="text-2xl font-bold text-emerald-400">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-400">₹{item.price} × {item.quantity}</p>
                          </div>
                        </div>
                      </div>
                    </NeonCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
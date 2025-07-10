import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs } from '../../components/ui/FloatingElements';

const statusConfig = {
  ordered: { color: 'blue', icon: ClockIcon, label: 'Ordered' },
  shipped: { color: 'orange', icon: TruckIcon, label: 'Shipped' },
  delivered: { color: 'emerald', icon: CheckCircleIcon, label: 'Delivered' },
  cancelled: { color: 'red', icon: XCircleIcon, label: 'Cancelled' },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ordered');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:5000/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders);
    } catch (error) {
      console.error("Failed to fetch orders", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (cartId, newStatus) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.patch(`http://127.0.0.1:5000/admin/orders/${cartId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(prev =>
        prev.map(order =>
          order.cart_id === cartId ? { ...order, status: newStatus } : order
        )
      );
      toast.success(`Order ${newStatus === 'shipped' ? 'shipped' : 'cancelled'} successfully`);
    } catch (error) {
      console.error("Failed to update order", error);
      toast.error("Failed to update order");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const filtered = orders.filter(order =>
      order.status === statusFilter &&
      (order.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchTerm]);

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
          <p className="text-white text-xl">Loading orders...</p>
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
                  <ShoppingBagIcon className="w-10 h-10 text-blue-400" />
                  Order Management
                </h1>
                <p className="text-gray-300 text-lg">Manage customer orders and fulfillment</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by product or customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ordered" className="bg-gray-800">Ordered</option>
                  <option value="shipped" className="bg-gray-800">Shipped</option>
                  <option value="delivered" className="bg-gray-800">Delivered</option>
                  <option value="cancelled" className="bg-gray-800">Cancelled</option>
                </select>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <motion.div variants={itemVariants}>
            <GlassCard className="p-12 text-center">
              <ExclamationTriangleIcon className="w-20 h-20 text-gray-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">No orders found</h2>
              <p className="text-gray-400 text-lg">
                {orders.length === 0 
                  ? 'No orders have been placed yet'
                  : 'No orders match your current filters'
                }
              </p>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="space-y-6">
            <AnimatePresence>
              {filteredOrders.map((order, index) => {
                const config = statusConfig[order.status] || statusConfig.ordered;
                const StatusIcon = config.icon;
                
                return (
                  <motion.div
                    key={order.cart_id}
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
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white mb-2">{order.product_name}</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <p className="text-gray-300">
                                  <span className="font-medium">Order ID:</span> #{order.cart_id}
                                </p>
                                <p className="text-gray-300">
                                  <span className="font-medium">Customer:</span> {order.user_name}
                                </p>
                                <p className="text-gray-300">
                                  <span className="font-medium">Quantity:</span> {order.quantity}
                                </p>
                                <p className="text-gray-300">
                                  <span className="font-medium">Phone:</span> {order.phone}
                                </p>
                                {order.delivery_address && (
                                  <p className="text-gray-300 md:col-span-2">
                                    <span className="font-medium">Address:</span> {order.delivery_address}
                                  </p>
                                )}
                                {order.order_date && (
                                  <p className="text-gray-300">
                                    <span className="font-medium">Ordered:</span> {new Date(order.order_date).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status and Actions */}
                        <div className="flex flex-col items-end gap-4">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-5 h-5 text-${config.color}-400`} />
                            <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${config.color}-500/20 text-${config.color}-400 border border-${config.color}-500/30`}>
                              {config.label}
                            </span>
                          </div>

                          {order.status === 'ordered' && (
                            <div className="flex gap-2">
                              <AnimatedButton
                                variant="blue"
                                size="sm"
                                onClick={() => updateOrderStatus(order.cart_id, 'shipped')}
                                icon={<TruckIcon className="w-4 h-4" />}
                              >
                                Ship Order
                              </AnimatedButton>
                              <AnimatedButton
                                variant="danger"
                                size="sm"
                                onClick={() => updateOrderStatus(order.cart_id, 'cancelled')}
                                icon={<XCircleIcon className="w-4 h-4" />}
                              >
                                Cancel
                              </AnimatedButton>
                            </div>
                          )}
                        </div>
                      </div>
                    </NeonCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
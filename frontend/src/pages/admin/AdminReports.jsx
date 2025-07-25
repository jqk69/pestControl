import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  MinusIcon,
  DocumentChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs } from '../../components/ui/FloatingElements';

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

export default function AdminReports() {
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    totalServices: 0,
    completedBookings: 0,
    monthlyGrowth : 0,
    topServices: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please log in.');
          setLoading(false);
          navigate('/login');
          return;
        }
        const response = await axios.get('http://127.0.0.1:5000/admin/reports', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setReportData(response.data.data);
        } else {
          setError('Failed to load reports');
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Error fetching reports';
        setError(errorMsg);
        console.error('Error fetching reports:', errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-emerald-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading reports...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-emerald-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <div className="text-center">
          <GlassCard className="p-12 text-center opacity-100">
            <ExclamationTriangleIcon className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
            <p className="text-red-400 text-lg mb-8">{error}</p>
            <AnimatedButton
              variant="primary"
              size="lg"
              onClick={() => navigate('/login')}
              icon={<CheckCircleIcon className="w-5 h-5" />}
              className="hover:bg-emerald-600 transition-colors"
            >
              Go to Login
            </AnimatedButton>
          </GlassCard>
        </div>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-emerald-900 relative overflow-hidden">
      <FloatingOrbs />
      
      <div
        className="relative z-10 p-6 max-w-7xl mx-auto space-y-8"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-8 opacity-100 bg-white/5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-5xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-3 flex items-center gap-4">
                  <ChartBarIcon className="w-12 h-12 text-emerald-400" />
                  Analytics & Reports
                </h1>
                <p className="text-gray-200 text-xl max-w-2xl">Business insights and performance metrics for your pest control operations.</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Key Metrics */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                label: 'Total Revenue', 
                value: `₹${reportData.totalRevenue.toLocaleString('en-IN')}`, 
                color: 'emerald',
                icon: CurrencyDollarIcon,
                description: 'This month'
              },
              { 
                label: 'Active Users', 
                value: reportData.totalUsers.toLocaleString('en-IN'), 
                color: 'blue',
                icon: UsersIcon,
                description: 'Registered customers'
              },
              { 
                label: 'Services Offered', 
                value: reportData.totalServices, 
                color: 'purple',
                icon: ShieldCheckIcon,
                description: 'Available services'
              },
              { 
                label: 'Completed Bookings', 
                value: reportData.completedBookings, 
                color: 'orange',
                icon: DocumentChartBarIcon,
                description: 'This month'
              },
            ].map((metric, index) => (
              <motion.div
                key={metric.label}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <NeonCard className="p-6 text-center opacity-100 hover:shadow-emerald-500/30 transition-shadow duration-300" color={metric.color}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.2, type: 'spring' }}
                  >
                    <metric.icon className={`w-8 h-8 mx-auto mb-3 text-${metric.color}-400`} />
                  </motion.div>
                  <h3 className={`text-2xl font-bold text-${metric.color}-400 mb-1`}>
                    {metric.value}
                  </h3>
                  <p className="text-white font-medium">{metric.label}</p>
                  <p className="text-gray-400 text-sm mt-1">{metric.description}</p>
                </NeonCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Growth Indicator */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6 opacity-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-6 h-6 text-emerald-400" />
                  Monthly Growth
                </h3>
                <p className="text-gray-300">Business performance this month</p>
              </div>
              <div className="text-right">
                <div
                    className={`text-3xl font-bold flex items-center gap-2 ${
                      reportData.monthlyGrowth > 0
                        ? 'text-green-400'
                        : reportData.monthlyGrowth < 0
                        ? 'text-red-400'
                        : 'text-gray-300'
                    }`}
                  >
                    {reportData.monthlyGrowth > 0 ? (
                      <ArrowUpRightIcon className="w-8 h-8" />
                    ) : reportData.monthlyGrowth < 0 ? (
                      <ArrowDownRightIcon className="w-8 h-8" />
                    ) : (
                      <MinusIcon className="w-8 h-8" />
                    )}
                    {reportData.monthlyGrowth > 0 ? '+' : ''}
                    {reportData.monthlyGrowth}%
                  </div>
                <p className="text-gray-400 text-sm">vs last month</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Detailed Reports */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Services */}
            <GlassCard className="p-6 opacity-100">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <ShieldCheckIcon className="w-6 h-6 text-blue-400" />
                Top Services
              </h3>
              <div className="space-y-4">
                {reportData.topServices.length === 0 ? (
                  <p className="text-gray-400 text-center">No services booked yet.</p>
                ) : (
                  reportData.topServices.map((service, index) => (
                    <motion.div
                      key={service.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                    >
                      <div>
                        <h4 className="text-white font-medium">{service.name}</h4>
                        <p className="text-gray-400 text-sm">{service.bookings} bookings</p>
                      </div>
                      <div className="text-blue-400 font-bold text-lg">
                        #{index + 1}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </GlassCard>

            {/* Recent Activity */}
            <GlassCard className="p-6 opacity-100">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <CalendarDaysIcon className="w-6 h-6 text-purple-400" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {reportData.recentActivity.length === 0 ? (
                  <p className="text-gray-400 text-center">No recent activity.</p>
                ) : (
                  reportData.recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                    >
                      <div>
                        <h4 className="text-white font-medium">{activity.action}</h4>
                        <p className="text-gray-400 text-sm">{activity.time}</p>
                      </div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    </motion.div>
                  ))
                )}
              </div>
            </GlassCard>
          </div>
        </motion.div>

        {/* Coming Soon */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-12 text-center opacity-100">
            <ExclamationTriangleIcon className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Advanced Analytics Coming Soon</h2>
            <p className="text-gray-400 text-lg">
              Detailed charts, revenue analytics, and customer insights will be available in the next update.
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
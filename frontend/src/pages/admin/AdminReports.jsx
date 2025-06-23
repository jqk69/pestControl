import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  CalendarDaysIcon,
  DocumentChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { FloatingOrbs } from '../../components/ui/FloatingElements';

export default function AdminReports() {
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    totalServices: 0,
    completedBookings: 0,
    monthlyGrowth: 0,
    topServices: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading report data
    setTimeout(() => {
      setReportData({
        totalRevenue: 125000,
        totalUsers: 1250,
        totalServices: 45,
        completedBookings: 890,
        monthlyGrowth: 15.5,
        topServices: [
          { name: 'Rodent Control', bookings: 234 },
          { name: 'Termite Treatment', bookings: 189 },
          { name: 'General Pest Control', bookings: 156 }
        ],
        recentActivity: [
          { action: 'New user registration', time: '2 hours ago' },
          { action: 'Service booking completed', time: '4 hours ago' },
          { action: 'Payment received', time: '6 hours ago' }
        ]
      });
      setLoading(false);
    }, 1500);
  }, []);

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
          <p className="text-white text-xl">Loading reports...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 relative overflow-hidden">
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
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                  <ChartBarIcon className="w-10 h-10 text-blue-400" />
                  Analytics & Reports
                </h1>
                <p className="text-gray-300 text-lg">Business insights and performance metrics</p>
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
                value: `₹${reportData.totalRevenue.toLocaleString()}`, 
                color: 'emerald',
                icon: CurrencyDollarIcon,
                description: 'This month'
              },
              { 
                label: 'Active Users', 
                value: reportData.totalUsers.toLocaleString(), 
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
                whileHover={{ y: -5 }}
              >
                <NeonCard className="p-6 text-center" color={metric.color}>
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
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <TrendingUpIcon className="w-6 h-6 text-emerald-400" />
                  Monthly Growth
                </h3>
                <p className="text-gray-300">Business performance this month</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-emerald-400 flex items-center gap-2">
                  <TrendingUpIcon className="w-8 h-8" />
                  +{reportData.monthlyGrowth}%
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
            <GlassCard className="p-6">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <ShieldCheckIcon className="w-6 h-6 text-blue-400" />
                Top Services
              </h3>
              <div className="space-y-4">
                {reportData.topServices.map((service, index) => (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
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
                ))}
              </div>
            </GlassCard>

            {/* Recent Activity */}
            <GlassCard className="p-6">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <CalendarDaysIcon className="w-6 h-6 text-purple-400" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {reportData.recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                  >
                    <div>
                      <h4 className="text-white font-medium">{activity.action}</h4>
                      <p className="text-gray-400 text-sm">{activity.time}</p>
                    </div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </div>
        </motion.div>

        {/* Coming Soon */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-12 text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Advanced Analytics Coming Soon</h2>
            <p className="text-gray-400 text-lg">
              Detailed charts, revenue analytics, and customer insights will be available in the next update.
            </p>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
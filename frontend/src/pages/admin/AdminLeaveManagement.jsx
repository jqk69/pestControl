import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs } from '../../components/ui/FloatingElements';

const statusConfig = {
  pending: { color: 'yellow', icon: ClockIcon, label: 'Pending' },
  approved: { color: 'emerald', icon: CheckCircleIcon, label: 'Approved' },
  rejected: { color: 'red', icon: XCircleIcon, label: 'Rejected' },
};

export default function AdminLeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/admin/technician-leaves", {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
      });
      setLeaves(res.data);
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`http://127.0.0.1:5000/admin/technician-leaves/${id}`, { status }, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
      });
      fetchLeaves();
    } catch (err) {
      console.error("Failed to update status:", err);
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
          <p className="text-white text-xl">Loading leave requests...</p>
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
                  <CalendarDaysIcon className="w-10 h-10 text-blue-400" />
                  Leave Management
                </h1>
                <p className="text-gray-300 text-lg">Manage technician leave requests</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Leave Requests */}
        {leaves.length === 0 ? (
          <motion.div variants={itemVariants}>
            <GlassCard className="p-12 text-center">
              <ExclamationTriangleIcon className="w-20 h-20 text-gray-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">No leave requests</h2>
              <p className="text-gray-400 text-lg">No technicians have submitted leave requests yet</p>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="space-y-6">
            <AnimatePresence>
              {leaves.map((leave, index) => {
                const config = statusConfig[leave.status] || statusConfig.pending;
                const StatusIcon = config.icon;
                
                return (
                  <motion.div
                    key={leave.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <NeonCard className="p-6" color={config.color}>
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        {/* Leave Info */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white mb-4">Leave Request #{leave.id}</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-300">
                                  <UserIcon className="w-4 h-4 text-blue-400" />
                                  <span><strong>Technician ID:</strong> {leave.technician_id}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <CalendarDaysIcon className="w-4 h-4 text-blue-400" />
                                  <span><strong>From:</strong> {new Date(leave.start_datetime).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <CalendarDaysIcon className="w-4 h-4 text-blue-400" />
                                  <span><strong>To:</strong> {new Date(leave.end_datetime).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <StatusIcon className={`w-4 h-4 text-${config.color}-400`} />
                                  <span><strong>Status:</strong> {config.label}</span>
                                </div>
                                {leave.reason && (
                                  <div className="flex items-start gap-2 text-gray-300 md:col-span-2">
                                    <DocumentTextIcon className="w-4 h-4 text-blue-400 mt-0.5" />
                                    <span><strong>Reason:</strong> {leave.reason}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        {leave.status === 'pending' && (
                          <div className="flex flex-col gap-3">
                            <AnimatedButton
                              variant="blue"
                              size="sm"
                              onClick={() => updateStatus(leave.id, "approved")}
                              icon={<CheckCircleIcon className="w-4 h-4" />}
                            >
                              Approve
                            </AnimatedButton>
                            <AnimatedButton
                              variant="danger"
                              size="sm"
                              onClick={() => updateStatus(leave.id, "rejected")}
                              icon={<XCircleIcon className="w-4 h-4" />}
                            >
                              Reject
                            </AnimatedButton>
                          </div>
                        )}
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
import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDaysIcon,
  PlusIcon,
  TrashIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs } from '../../components/ui/FloatingElements';

const statusConfig = {
  pending: { color: 'yellow', label: 'Pending' },
  approved: { color: 'emerald', label: 'Approved' },
  rejected: { color: 'red', label: 'Rejected' },
};

export default function TechnicianLeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({ start_datetime: '', end_datetime: '', reason: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/technician/leaves", {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
      });

      const data = res.data;
      if (Array.isArray(data)) {
        setLeaves(data);
      } else if (Array.isArray(data.leaves)) {
        setLeaves(data.leaves);
      } else {
        console.error("Unexpected data:", data);
        setLeaves([]);
      }
    } catch (err) {
      console.error("Error fetching leaves:", err);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const applyLeave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post("http://127.0.0.1:5000/technician/leaves", form, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
      });
      setForm({ start_datetime: '', end_datetime: '', reason: '' });
      fetchLeaves();
    } catch (err) {
      console.error("Error applying for leave:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const cancelLeave = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/technician/leaves/${id}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
      });
      fetchLeaves();
    } catch (err) {
      console.error("Error cancelling leave:", err);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading leave requests...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 relative overflow-hidden">
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
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                  <CalendarDaysIcon className="w-10 h-10 text-orange-400" />
                  Leave Management
                </h1>
                <p className="text-gray-300 text-lg">Apply for and manage your leave requests</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Apply for Leave Form */}
        <motion.div variants={itemVariants}>
          <NeonCard className="p-6" color="orange">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <PlusIcon className="w-6 h-6 text-orange-400" />
              Apply for Leave
            </h2>
            
            <form onSubmit={applyLeave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={form.start_datetime}
                    onChange={(e) => setForm({ ...form, start_datetime: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={form.end_datetime}
                    onChange={(e) => setForm({ ...form, end_datetime: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason for Leave
                </label>
                <textarea
                  rows={4}
                  placeholder="Please provide a reason for your leave request..."
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  required
                />
              </div>
              
              <AnimatedButton
                type="submit"
                variant="neon"
                size="lg"
                loading={submitting}
                disabled={submitting}
                icon={!submitting && <PlusIcon className="w-5 h-5" />}
                className="w-full"
              >
                {submitting ? 'Submitting...' : 'Submit Leave Request'}
              </AnimatedButton>
            </form>
          </NeonCard>
        </motion.div>

        {/* Leave Requests List */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <DocumentTextIcon className="w-6 h-6 text-orange-400" />
              Your Leave Requests
            </h2>

            {leaves.length === 0 ? (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No leave requests</h3>
                <p className="text-gray-400">You haven't submitted any leave requests yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {leaves.map((leave, index) => {
                    const config = statusConfig[leave.status] || statusConfig.pending;
                    
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
                                      <CalendarDaysIcon className="w-4 h-4 text-orange-400" />
                                      <span><strong>From:</strong> {new Date(leave.start_datetime).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-300">
                                      <CalendarDaysIcon className="w-4 h-4 text-orange-400" />
                                      <span><strong>To:</strong> {new Date(leave.end_datetime).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-300">
                                      <ClockIcon className={`w-4 h-4 text-${config.color}-400`} />
                                      <span><strong>Status:</strong> {config.label}</span>
                                    </div>
                                    {leave.reason && (
                                      <div className="flex items-start gap-2 text-gray-300 md:col-span-2">
                                        <DocumentTextIcon className="w-4 h-4 text-orange-400 mt-0.5" />
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
                                  variant="danger"
                                  size="sm"
                                  onClick={() => cancelLeave(leave.id)}
                                  icon={<TrashIcon className="w-4 h-4" />}
                                >
                                  Cancel Request
                                </AnimatedButton>
                              </div>
                            )}
                          </div>
                        </NeonCard>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
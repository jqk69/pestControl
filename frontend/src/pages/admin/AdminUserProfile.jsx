import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  KeyIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  CogIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs } from '../../components/ui/FloatingElements';

export default function AdminUserProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState({});
  const [technician, setTechnician] = useState(null);
  const [roles, setRoles] = useState(['user', 'admin', 'technician']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('token');
        const response = await axios.get(`http://127.0.0.1:5000/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = response.data.user;
        const technicianData = response.data.technician || null;
        setUser(userData);
        setTechnician(technicianData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setUser((prevUser) => ({
      ...prevUser,
      role: newRole
    }));

    if (newRole !== 'technician') {
      setTechnician(null);
    } else if (newRole === 'technician' && !technician) {
      setTechnician({
        skills: '',
        experience_years: '',
        salary: ''
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value
    }));
  };

  const handleTechChange = (e) => {
    const { name, value } = e.target;
    setTechnician((prevTech) => ({
      ...prevTech,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = sessionStorage.getItem('token');
      const payload = {
        ...user,
        ...(user.role === 'technician' && technician && {
          skills: technician.skills,
          experience_years: technician.experience_years,
          salary: technician.salary
        })
      };

      await axios.patch(
        `http://127.0.0.1:5000/admin/users/${user.id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Update error:', err.response?.data || err.message);
      setError('Failed to update user!');
    } finally {
      setSaving(false);
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
          <p className="text-white text-xl">Loading user profile...</p>
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
                  <UserIcon className="w-10 h-10 text-blue-400" />
                  Edit User Profile
                </h1>
                <p className="text-gray-300 text-lg">Manage user information and permissions</p>
              </div>
              <AnimatedButton
                variant="ghost"
                size="lg"
                onClick={() => navigate('/admin/dashboard')}
                icon={<ArrowLeftIcon className="w-5 h-5" />}
              >
                Back to Dashboard
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

        {/* User Profile Card */}
        <motion.div variants={itemVariants}>
          <NeonCard className="p-6" color="blue">
            <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
              {/* User Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                  {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center ${
                  user.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'
                }`}>
                  {user.status === 'active' ? (
                    <CheckIcon className="w-5 h-5 text-white" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>

              {/* User Basic Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h2 className="text-2xl font-bold text-white">{user.name || 'Unnamed User'}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                      : user.role === 'technician' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {user.role || 'user'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {user.status || 'active'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <UserIcon className="w-4 h-4 text-blue-400" />
                    <span><strong>User ID:</strong> {user.id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CalendarDaysIcon className="w-4 h-4 text-blue-400" />
                    <span><strong>Member Since:</strong> {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <ClockIcon className="w-4 h-4 text-blue-400" />
                    <span><strong>Last Login:</strong> {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-blue-400" />
                  Personal Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={user.name || ''}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="username"
                      value={user.username || ''}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={user.email || ''}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={user.phone || ''}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <CogIcon className="w-5 h-5 text-blue-400" />
                  Account Settings
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    User Role
                  </label>
                  <div className="relative">
                    <ShieldCheckIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={user.role || ''}
                      onChange={handleRoleChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role} className="bg-gray-800">
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    Changing roles affects system permissions immediately
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Account Status
                  </label>
                  <div className="relative">
                    <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      name="status"
                      value={user.status || 'active'}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      <option value="active" className="bg-gray-800">Active</option>
                      <option value="inactive" className="bg-gray-800">Inactive</option>
                      <option value="suspended" className="bg-gray-800">Suspended</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Member Since
                  </label>
                  <div className="relative">
                    <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Active
                  </label>
                  <div className="relative">
                    <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={user.last_login ? new Date(user.last_login).toLocaleString() : 'N/A'}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          </NeonCard>
        </motion.div>

        {/* Technician Details */}
        <AnimatePresence>
          {user.role === 'technician' && (
            <motion.div 
              variants={itemVariants}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <NeonCard className="p-6" color="emerald">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <BriefcaseIcon className="w-5 h-5 text-emerald-400" />
                  Technician Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Years of Experience
                    </label>
                    <div className="relative">
                      <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        name="experience_years"
                        min={0}
                        value={technician?.experience_years || ''}
                        onChange={handleTechChange}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Enter years of experience"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Salary
                    </label>
                    <div className="relative">
                      <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        name="salary"
                        min={0}
                        value={technician?.salary || ''}
                        onChange={handleTechChange}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Enter salary amount"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Skills
                  </label>
                  <div className="relative">
                    <CogIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      name="skills"
                      rows={4}
                      value={technician?.skills || ''}
                      onChange={handleTechChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      placeholder="List technician skills..."
                      required
                    />
                  </div>
                </div>
              </NeonCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <motion.div variants={itemVariants}>
          <div className="flex justify-end gap-4">
            <AnimatedButton
              variant="ghost"
              size="lg"
              onClick={() => navigate('/admin/dashboard')}
              disabled={saving}
            >
              Cancel
            </AnimatedButton>
            <AnimatedButton
              variant="neon"
              size="lg"
              onClick={handleSave}
              loading={saving}
              disabled={saving}
              icon={!saving && <CheckIcon className="w-5 h-5" />}
              color="blue"
            >
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </AnimatedButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  KeyIcon,
  PencilIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { GlassCard, NeonCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs } from '../../components/ui/FloatingElements';

export default function AdminProfile() {
  const [profile, setProfile] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    role: 'admin'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading profile data
    setTimeout(() => {
      setProfile({
        name: 'Admin User',
        username: sessionStorage.getItem('username') || 'admin',
        email: 'admin@pestilee.com',
        phone: '+91 9876543210',
        role: 'admin'
      });
      setLoading(false);
    }, 1000);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Simulate saving profile
    setIsEditing(false);
    // Here you would typically make an API call to save the profile
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
          <p className="text-white text-xl">Loading profile...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 relative overflow-hidden">
      <FloatingOrbs />
      
      <motion.div
        className="relative z-10 p-6 max-w-4xl mx-auto space-y-8"
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
                  Admin Profile
                </h1>
                <p className="text-gray-300 text-lg">Manage your account settings</p>
              </div>
              <AnimatedButton
                variant={isEditing ? "blue" : "ghost"}
                size="lg"
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                icon={isEditing ? <CheckCircleIcon className="w-5 h-5" /> : <PencilIcon className="w-5 h-5" />}
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </AnimatedButton>
            </div>
          </GlassCard>
        </motion.div>

        {/* Profile Card */}
        <motion.div variants={itemVariants}>
          <NeonCard className="p-8" color="blue">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
                        value={profile.username}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
                        value={profile.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
                        value={profile.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Role
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium border border-blue-500/30">
                      Administrator
                    </span>
                    <span className="text-gray-400 text-sm">Full system access</span>
                  </div>
                </div>
              </div>
            </div>
          </NeonCard>
        </motion.div>

        {/* Security Section */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <KeyIcon className="w-6 h-6 text-blue-400" />
              Security Settings
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Password</h4>
                    <p className="text-gray-400 text-sm">Last changed 30 days ago</p>
                  </div>
                  <AnimatedButton
                    variant="ghost"
                    size="sm"
                    icon={<KeyIcon className="w-4 h-4" />}
                  >
                    Change Password
                  </AnimatedButton>
                </div>
              </div>
              
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                    <p className="text-gray-400 text-sm">Add an extra layer of security</p>
                  </div>
                  <AnimatedButton
                    variant="ghost"
                    size="sm"
                  >
                    Enable 2FA
                  </AnimatedButton>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* System Info */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <h3 className="text-2xl font-bold text-white mb-6">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">Admin</div>
                <p className="text-gray-400 text-sm">Account Type</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400 mb-1">Active</div>
                <p className="text-gray-400 text-sm">Account Status</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">2024</div>
                <p className="text-gray-400 text-sm">Member Since</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
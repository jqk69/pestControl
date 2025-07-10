import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  UserIcon, 
  LockClosedIcon,
  EnvelopeIcon,
  PhoneIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { GlassCard } from './ui/GlassCard';
import { AnimatedButton } from './ui/AnimatedButton';
import { FloatingOrbs } from './ui/FloatingElements';
import leaf from '../static/leaves.jpeg';

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRedirect = (page) => {
    navigate(page);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (Object.values(formData).some(field => field === "")) {
      setError("All fields are required");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post('http://127.0.0.1:5000/auth/register', formData);
      console.log(response.data);
      setSuccess(true);
      
      // Redirect after showing success message
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Registration failed:', error);
      if (error.response) {
        setError(error.response.data.message);
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
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
        stiffness: 200,
      },
    },
  };

  const inputFields = [
    { name: 'name', label: 'Full Name', type: 'text', icon: UserIcon, placeholder: 'Enter your full name' },
    { name: 'username', label: 'Username', type: 'text', icon: UserIcon, placeholder: 'Choose a username' },
    { name: 'email', label: 'Email', type: 'email', icon: EnvelopeIcon, placeholder: 'Enter your email' },
    { name: 'phone', label: 'Phone', type: 'tel', icon: PhoneIcon, placeholder: 'Enter your phone number' },
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-900 to-teal-900 flex justify-center items-center relative overflow-hidden">
        <FloatingOrbs />
        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <GlassCard className="p-8 max-w-md">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <CheckCircleIcon className="w-20 h-20 text-emerald-400 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-4">Welcome to Pestilee!</h2>
            <p className="text-gray-300 mb-6">Your account has been created successfully. Redirecting to login...</p>
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-900 to-teal-900 flex justify-center items-center relative overflow-hidden py-8">
      <FloatingOrbs />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md mx-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <GlassCard className="p-8 relative overflow-hidden">
          {/* Decorative leaf */}
          <motion.img
            src={leaf}
            alt="Leaf"
            className="absolute -top-6 -left-6 w-16 h-16 opacity-60 rounded-full object-cover"
            initial={{ rotate: -45, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          />

          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <SparklesIcon className="w-12 h-12 text-emerald-400 mr-2" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Join Pestilee
              </h1>
            </div>
            <p className="text-gray-300 text-lg">Create your account for a pest-free future</p>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Fields */}
            {inputFields.map((field, index) => (
              <motion.div key={field.name} variants={itemVariants}>
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-300 mb-2">
                  {field.label}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <field.icon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                    placeholder={field.placeholder}
                    required
                  />
                </div>
              </motion.div>
            ))}

            {/* Password Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  placeholder="Create a secure password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Password must be at least 6 characters long</p>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants}>
              <AnimatedButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
                icon={!loading && <ArrowRightIcon className="w-5 h-5" />}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </AnimatedButton>
            </motion.div>

            {/* Login Link */}
            <motion.div variants={itemVariants} className="text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleRedirect('/login')}
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  Sign in here
                </button>
              </p>
            </motion.div>
          </form>

          {/* Decorative Elements */}
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-emerald-500/10 to-transparent rounded-full -mr-16 -mb-16" />
          <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-teal-500/10 to-transparent rounded-full -ml-12 -mt-12" />
        </GlassCard>

        {/* Footer */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-gray-400 text-sm">
            Join thousands of satisfied customers • Secure • Professional
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
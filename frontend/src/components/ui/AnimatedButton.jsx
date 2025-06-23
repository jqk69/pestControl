import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon,
  loading = false,
  ...props 
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25',
    secondary: 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg shadow-gray-500/25',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg shadow-red-500/25',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-lg shadow-yellow-500/25',
    ghost: 'bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm',
    neon: 'bg-transparent border-2 border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-gray-900 shadow-lg shadow-emerald-400/25 hover:shadow-emerald-400/50',
    blue: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25',
    purple: 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white shadow-lg shadow-purple-500/25',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative overflow-hidden rounded-xl font-semibold
        transition-all duration-300 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
      )}
      {icon && !loading && icon}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};
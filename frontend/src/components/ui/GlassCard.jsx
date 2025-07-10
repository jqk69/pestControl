import React from 'react';

export const GlassCard = ({ children, className = '', hover = true, ...props }) => {
  return (
    <div
      className={`
        backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl
        shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
        ${hover ? 'hover:bg-white/20 hover:shadow-[0_12px_40px_0_rgba(31,38,135,0.5)] hover:scale-[1.02] transition-all duration-300' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const NeonCard = ({ children, className = '', color = 'emerald', ...props }) => {
  const colorClasses = {
    emerald: 'shadow-emerald-500/25 border-emerald-500/30 hover:shadow-emerald-500/40',
    blue: 'shadow-blue-500/25 border-blue-500/30 hover:shadow-blue-500/40',
    purple: 'shadow-purple-500/25 border-purple-500/30 hover:shadow-purple-500/40',
    pink: 'shadow-pink-500/25 border-pink-500/30 hover:shadow-pink-500/40',
    orange: 'shadow-orange-500/25 border-orange-500/30 hover:shadow-orange-500/40',
    red: 'shadow-red-500/25 border-red-500/30 hover:shadow-red-500/40',
  };

  return (
    <div
      className={`
        backdrop-blur-xl bg-gray-900/80 border rounded-2xl
        shadow-2xl hover:scale-[1.02] transition-all duration-300
        ${colorClasses[color]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { DocumentTextIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { FloatingOrbs } from '../../components/ui/FloatingElements';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

export default function AdminBlog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState(null);
  const [responseStatus, setResponseStatus] = useState(null);
  const navigate = useNavigate();

  // Fetch blog list
  const fetchBlogs = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setResponseMessage('No authentication token found. Please log in.');
        setResponseStatus('error');
        navigate('/login');
        return;
      }
      const response = await axios.get('http://127.0.0.1:5000/admin/blogs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlogs(response.data.blogs || []);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error fetching blogs';
      setResponseMessage(errorMsg);
      setResponseStatus('error');
      console.error('Error fetching blogs:', errorMsg);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchBlogs();
  }, [navigate]);

  // Handle blog generation
  const handleGenerateBlog = async () => {
    setLoading(true);
    setResponseMessage(null);
    setResponseStatus(null);
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setResponseMessage('No authentication token found. Please log in.');
        setResponseStatus('error');
        navigate('/login');
        return;
      }
      const response = await axios.post(
        'http://127.0.0.1:5000/admin/run-weekly-blog',
        {},
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      if (response.data.status === 'success') {
        setResponseMessage(response.data.message);
        setResponseStatus('success');
        await fetchBlogs(); // Refresh blog list
      } else {
        setResponseMessage(response.data.message || 'Failed to generate blog');
        setResponseStatus('error');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error generating blog';
      setResponseMessage(errorMsg);
      setResponseStatus('error');
      console.error('Error generating blog:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-emerald-900 relative overflow-hidden">
      <FloatingOrbs />
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <GlassCard className="p-8 opacity-100 bg-white/5 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent flex items-center gap-4">
                <DocumentTextIcon className="w-10 h-10 text-emerald-400" />
                All Blog Posts
              </h1>
              <AnimatedButton
                variant="primary"
                size="lg"
                onClick={handleGenerateBlog}
                disabled={loading}
                className="hover:bg-emerald-600 transition-colors"
              >
                {loading ? 'Generating...' : 'Generate Weekly Blog'}
              </AnimatedButton>
            </div>
          </GlassCard>
        </motion.div>

        {responseMessage && (
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <GlassCard className="p-6 opacity-100 mb-8">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className={`w-6 h-6 ${responseStatus === 'success' ? 'text-emerald-400' : 'text-red-400'}`} />
                <p className={`text-lg ${responseStatus === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {responseMessage}
                </p>
              </div>
            </GlassCard>
          </motion.div>
        )}

        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.length === 0 ? (
              <p className="text-gray-400 text-center col-span-full">No blogs available.</p>
            ) : (
              blogs.map(blog => (
                <Link key={blog.id} to={`/admin/blogs/${blog.id}`}>
                  <motion.div
                    className="bg-white/5 border border-white/10 p-6 rounded-xl hover:bg-white/10 transition-all"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <h2 className="text-xl font-semibold text-white mb-2">{blog.title}</h2>
                    <p className="text-sm text-gray-400">{new Date(blog.date).toLocaleString()}</p>
                  </motion.div>
                </Link>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
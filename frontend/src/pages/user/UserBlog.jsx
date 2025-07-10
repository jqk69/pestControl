import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { ExclamationTriangleIcon, BookOpenIcon } from '@heroicons/react/24/outline';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-gray-400">{this.state.error?.message || 'An unexpected error occurred'}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function UserBlog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          console.error('No token found in sessionStorage');
          setError('Please log in to view blogs.');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://127.0.0.1:5000/user/blogs', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Normalize blog data
        const blogData = Array.isArray(response.data?.blogs)
          ? response.data.blogs.map(blog => ({
              id: blog.id || `temp-${Math.random()}`,
              title: blog.title || 'Untitled Blog',
              date: blog.date || new Date().toISOString().split('T')[0],
              excerpt: blog.excerpt || 'No description available',
            }))
          : [];

        setBlogs(blogData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError('Failed to load blogs. Please try again later.');
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-300 text-lg">Loading blogs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={() => navigate('/user/login')}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto py-8 px-4 bg-gray-900 min-h-screen">
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
          <BookOpenIcon className="w-8 h-8 text-teal-400" />
          Pest Control Blogs
        </h1>
        <div className="space-y-4">
          {blogs.length === 0 ? (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No blogs available at the moment.</p>
              <button
                onClick={() => navigate('/user/services')}
                className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition"
              >
                Explore Services
              </button>
            </div>
          ) : (
            blogs.map((blog) => (
              <Link
                to={`/user/blogs/${blog.id}`}
                key={blog.id}
                className="block bg-gray-800 hover:bg-gray-700 p-6 rounded-lg shadow-lg transition duration-200"
              >
                <h2 className="text-xl font-semibold text-teal-400 mb-2">{blog.title}</h2>
                <p className="text-sm text-gray-400 mb-2">{new Date(blog.date).toLocaleDateString()}</p>
                <p className="text-gray-300 text-sm line-clamp-2">{blog.excerpt}</p>
              </Link>
            ))
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
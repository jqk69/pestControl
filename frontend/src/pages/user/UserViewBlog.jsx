import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function UserViewBlog() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`http://127.0.0.1:5000/user/blogs/${id}`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`
      }
    })
      .then(res => {
        setBlog(res.data.blog);
        setLoading(false);
      })
      .catch(() => {
        setError('Blog not found or failed to load.');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/2 mb-4" />
        <div className="h-4 bg-gray-600 rounded w-1/4 mb-2" />
        <div className="h-64 bg-gray-800 rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 text-red-500">{error}</div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto py-8 px-4"
    >
      <Link to="/user/blogs" className="text-teal-400 hover:underline text-sm">&larr; Back to Blogs</Link>
      <h1 className="text-3xl font-bold text-white mt-4 mb-2">{blog.title}</h1>
      <p className="text-sm text-gray-400 mb-4">
        {new Date(blog.date).toLocaleString()}
      </p>
      <div
        className="prose prose-invert max-w-none text-gray-200 overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
    </motion.div>
  );
}

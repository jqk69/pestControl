import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function AdminViewBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`http://127.0.0.1:5000/admin/blogs/${id}`, {
      headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
    })
      .then(res => setBlog(res.data.blog))
      .catch(() => setError('Failed to load blog.'));
  }, [id]);

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      axios.delete(`http://127.0.0.1:5000/admin/blogs/${id}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      }).then(() => navigate('/admin/blogs'));
    }
  };

  if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;
  if (!blog) return <div className="text-gray-400 p-4 text-center">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto py-6 px-4">
      <Link to="/admin/blogs" className="text-teal-400 hover:underline">&larr; Back to All Blogs</Link>
      <h1 className="text-3xl font-bold text-white mt-4 mb-2">{blog.title}</h1>
      <p className="text-sm text-gray-400 mb-4">{new Date(blog.date).toLocaleString()}</p>
      <div className="prose prose-invert text-gray-100 max-w-none mb-6" dangerouslySetInnerHTML={{ __html: blog.content }} />
      <button
        onClick={handleDelete}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
      >
        Delete Blog
      </button>
    </motion.div>
  );
}

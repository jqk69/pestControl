import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function AdminBlog() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/admin/blogs', {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`
      }
    }).then(res => setBlogs(res.data.blogs));
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-4">All Blog Posts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {blogs.map(blog => (
          <Link key={blog.id} to={`/admin/blogs/${blog.id}`}>
            <div className="bg-gray-800 p-4 rounded hover:bg-gray-700 transition">
              <h2 className="text-xl font-semibold text-white">{blog.title}</h2>
              <p className="text-sm text-gray-400">{new Date(blog.date).toLocaleString()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

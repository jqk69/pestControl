import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminAddProduct() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    inventory_amount: '',
    image_path: ''
    ,category: ''
  });
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      // Temporary URL for preview
      const newImageURL = URL.createObjectURL(file);
      setProduct((prev) => ({ ...prev, image_path: newImageURL }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token')
      
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('description', product.description);
      formData.append('price', product.price);
      formData.append('inventory_amount', product.inventory_amount);
      formData.append('category', product.category);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await axios.post(`http://127.0.0.1:5000/admin/store/add_product`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Product added successfully!');
      navigate('/admin/store');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product');
    }
  };

  return (
    <div className="flex flex-col w-full h-full p-10 bg-white shadow rounded-lg">
      <h1 className="text-3xl font-bold mb-8 border-b pb-2">Add Product</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-8 w-full">
  {/* Product Info Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="flex flex-col space-y-4">
      {/* Product Name */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Product Name</label>
        <input
          type="text"
          name="name"
          value={product.name}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter product name"
          required
        />
      </div>

      {/* Price */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Price</label>
        <input
          type="number"
          name="price"
          value={product.price}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter price"
          required
        />
      </div>

      {/* Inventory Amount */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Inventory Amount</label>
        <input
          type="number"
          name="inventory_amount"
          value={product.inventory_amount}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter inventory amount"
        />
      </div>

      {/* Category */}
      <div>
  <label className="block mb-1 text-sm font-medium text-gray-700">Category</label>
  <select
    name="category"
    value={product.category}
    onChange={handleChange}
    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
    required
  >
    <option value="">Select category</option>
    <option value="Normal">Normal</option>
    <option value="Sustainable">Sustainable</option>
  </select>
</div>
    </div>

    {/* Image Upload & Preview */}
    <div className="flex flex-col space-y-4">
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Product Image</label>
        {product.image_path ? (
          <img
            src={product.image_path}
            alt="Product Preview"
            className="w-full h-64 object-contain border rounded-md shadow-sm mb-3"
          />
        ) : (
          <div className="w-full h-64 flex items-center justify-center border rounded-md text-gray-400 bg-gray-50">
            No Image Selected
          </div>
        )}
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  </div>

  {/* Description Full Width */}
  <div>
    <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
    <textarea
      name="description"
      value={product.description}
      onChange={handleChange}
      rows="4"
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
      placeholder="Enter product description"
      required
    ></textarea>
  </div>

  {/* Submit Button */}
  <div>
    <button
      type="submit"
      className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition">
      Add Product
    </button>
  </div>
</form>

    </div>
  );
}

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function AdminEditProduct() {
  const { productId } = useParams();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    inventory_amount: '',
    image_path: ''
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await axios.get(`http://127.0.0.1:5000/admin/store/edit_product/${productId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data?.product) {
          setProduct(response.data.product);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch product');
      }
    };
    fetchProduct();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      // Create a temporary URL for the image preview
      const newImageURL = URL.createObjectURL(file);
      setProduct((prev) => ({ ...prev, image_path: newImageURL }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('description', product.description);
      formData.append('price', product.price);
      formData.append('inventory_amount', product.inventory_amount);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await axios.patch(`http://127.0.0.1:5000/admin/store/edit_product/${productId}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Product updated successfully!');
      navigate('/admin/store');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
    }
  };

  return (
    <div className="flex flex-col w-full h-full p-10 bg-white shadow rounded-lg">
      <h1 className="text-3xl font-bold mb-8 border-b pb-2">Edit Product</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Left side form fields */}
        <div className="flex flex-col space-y-6">
          {/* Product Name */}
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              name="name"
              value={product.name || ''}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter product name"
              required
            />
          </div>

          {/* Price */}
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">Price</label>
            <input
              type="number"
              name="price"
              value={product.price || ''}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter price"
              required
            />
          </div>

          {/* Inventory Amount */}
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">Inventory Amount</label>
            <input
              type="number"
              name="inventory_amount"
              value={product.inventory_amount || ''}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter inventory amount"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={product.description || ''}
              onChange={handleChange}
              rows="4"
              className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter product description"
              required
            ></textarea>
          </div>
        </div>

        {/* Right side: Image and File Input */}
        <div className="flex flex-col justify-between">
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">Product Image
            </label>
            {product.image_path && (
              <img
                src={`http://127.0.0.1:5000/static/products/${product.image_path}`}
                alt="Product"
                className="max-w-xs h-auto mb-4 border rounded-md shadow-sm"
              />
            )}
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">Choose File</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="md:col-span-2 mt-4">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

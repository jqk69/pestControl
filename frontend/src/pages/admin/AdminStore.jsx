import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminStore() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('normal');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/admin/store`, {
        params: { category: activeTab }
      });
      const fetchedProducts = response.data?.items || [];
       console.log(fetchedProducts); 
      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const filterProducts = () => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeTab]);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, products]);

  const handleEdit = (productId) => {
    navigate(`edit_product/${productId}`);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border rounded-lg shadow-sm"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          <button onClick={() => setActiveTab('normal')} className={`px-4 py-2 rounded-lg ${activeTab === 'normal' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>Normal Store</button>
          <button onClick={() => setActiveTab('sustainable')} className={`px-4 py-2 rounded-lg ${activeTab === 'sustainable' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>Sustainable Solutions</button>
        </div>
        <button onClick={() => navigate('add-product')} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">+ Add Item</button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-3 flex flex-col items-center">
            <img
              src={`http://127.0.0.1:5000/static/products/${product.image_path}`}
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg mb-3"
            />
            <div className="w-full text-center space-y-2">
              <h3 className="text-lg font-semibold truncate">{product.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
              <p className="text-lg font-bold text-indigo-600">₹{product.price}</p>
              <p className="text-sm text-gray-600">Inventory: {product.inventory_amount}</p>
              <button
                onClick={() => handleEdit(product.id)}
                className="mt-2 w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-500 transition"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No Products Found */}
      {filteredProducts.length === 0 && (
        <div className="text-center mt-6 text-gray-500">No products found.</div>
      )}
    </div>
  );
}

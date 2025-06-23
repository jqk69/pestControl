import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const getEmoji = (pest_type) => {
  switch ((pest_type || '').toLowerCase()) {
    case 'rodent':
      return '🐀';
    case 'worm':
      return '🪱';
    case 'insect':
      return '🐜';
    case 'fungus':
      return '🍄';
    default:
      return '❓';
  }
};

const UserService = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serviceType, setServiceType] = useState('Home Service');
  const [category, setCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/user/services', {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
        });
        if (response.data.success) {
          setServices(response.data.services);
        } else {
          setError('Failed to load services');
        }
      } catch {
        setError('Error fetching services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    let filtered = services;
    if (serviceType) filtered = filtered.filter((service) => service.service_type === serviceType);
    if (category) filtered = filtered.filter((service) => service.category === category);
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(lowerSearch) ||
          service.description.toLowerCase().includes(lowerSearch)
      );
    }
    setFilteredServices(filtered);
  }, [services, serviceType, category, searchTerm]);

  const handleBookNow = (id) => navigate(`/user/service/${id}`);

  const serviceTypes = [...new Set(services.map((s) => s.service_type))];
  const categories = [...new Set(services.map((s) => s.category))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin h-12 w-12 border-t-4 border-green-500 rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-gray-900 text-red-400">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition duration-300"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen px-4 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header & Filters */}
        <div className="bg-gradient-to-r from-green-600 to-teal-500 py-16 text-white text-center rounded-lg mb-8">
          <h1 className="text-4xl font-bold text-gray-100">🛡️ Pest Control Services</h1>
          <p className="text-xl text-gray-300 mt-2">
            Eliminate pests with expert solutions tailored for your needs
          </p>
        </div>

        <div className="bg-gray-800 shadow-lg rounded-xl p-6 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300">Service Type</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-700 bg-gray-900 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Types</option>
                {serviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-700 bg-gray-900 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <label className="text-sm font-medium text-gray-300">Search</label>
              <div className="relative mt-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 p-2 border border-gray-700 bg-gray-900 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Search by name or description"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cards */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            No matching services found
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.service_id}
                className="bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border border-gray-700 overflow-hidden transition duration-300"
              >
                <div className="h-48 flex justify-center items-center text-7xl bg-gray-700">
                  {getEmoji(service.pest_type)}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold text-gray-100">{service.name}</h2>
                    <span className="text-xs px-2 py-1 bg-gray-600 text-gray-300 rounded-full">
                      {service.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-4">{service.description}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-400">
                        Technicians: {service.technicians_needed}
                      </p>
                      <p className="text-lg font-bold text-green-400">₹{service.price}</p>
                    </div>
                    <button
                      onClick={() => handleBookNow(service.service_id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition duration-300"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserService;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserService = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serviceType, setServiceType] = useState('Home Service'); // default
  const [category, setCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate=useNavigate()

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://127.0.0.1:5000/user/services', {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        });

        if (response.data.success) {
          setServices(response.data.services);
        } else {
          setError('Failed to load services');
        }
      } catch (err) {
        setError('Error fetching services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    let filtered = services;

    if (serviceType) {
      filtered = filtered.filter(service => service.service_type === serviceType);
    }

    if (category) {
      filtered = filtered.filter(service => service.category === category);
    }

    if (searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(lowerSearch) ||
        service.description.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredServices(filtered);
  }, [services, serviceType, category, searchTerm]);

  const serviceTypes = [...new Set(services.map(service => service.service_type))];
  const categories = [...new Set(services.map(service => service.category))];

  if (loading) return <div className="text-center mt-20">Loading services...</div>;
  if (error) return <div className="text-center mt-20 text-red-600">{error}</div>;

  const handleBookNow = (id) => {
    navigate(`${id}`);
  };

  return (
    <div className="bg-white min-h-screen py-12 px-4 md:px-16 text-black">
        <div className="flex justify-between items-center mb-8 flex-col sm:flex-row gap-4">
  <h2 className="text-3xl font-bold text-center sm:text-left">Our Pest Control Services</h2>
  <button
    onClick={() => setShowModal(true)}
    className="bg-gray-500 text-white px-5 py-2 rounded-md shadow hover:bg-gray-600 transition"
  >
    + Create Custom Request
  </button>
</div>

      <h2 className="text-3xl font-bold mb-10 text-center">Our Pest Control Services</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Service Type Dropdown */}
        <div>
          <label className="block font-semibold mb-2">Service Type</label>
          <select
            className="w-full px-4 py-2 border rounded-md"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
          >
            <option value="">All</option>
            {serviceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block font-semibold mb-2">Category</label>
          <select
            className="w-full px-4 py-2 border rounded-md"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div>
          <label className="block font-semibold mb-2">Search</label>
          <input
            type="text"
            placeholder="Search by name or description"
            className="w-full px-4 py-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredServices.map((service) => (
          <div
            key={service.service_id}
            className="bg-gray-100 rounded-2xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden"
          >
            <img
              src={service.image_url || '/images/default-service.jpg'}
              alt={service.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-5">
              <h3 className="text-xl font-semibold">{service.name}</h3>
              <p className="text-gray-600 mt-2">{service.description}</p>
              <p className="mt-2 font-semibold">Price: ₹{service.price}</p>
              <p className="text-sm text-gray-500">Technicians needed: {service.technicians_needed}</p>
              <button className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"onClick={() => handleBookNow(service.service_id)} >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserService;

import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const serviceTypeOptions = ["Home Service", "Industrial Service", "Custom"];
const categoryOptions = ["General", "Pest Control", "Custom"];

export default function AdminEditService({ onCancel }) {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [serviceType, setServiceType] = useState("");
  const [customServiceType, setCustomServiceType] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [name, setName] = useState("");
  const [techniciansNeeded, setTechniciansNeeded] = useState(1);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [pestType, setPestType] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);

  useEffect(() => {
    const fetchService = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated. Please login.");
        navigate("/login");
        return;
      }

      try {
        setLoading(true);

        const response = await axios.get(
          `http://127.0.0.1:5000/admin/services/edit_service/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        if (response.data?.data) {
          const service = response.data.data;
          setName(service.name);
          setDescription(service.description);
          setPrice(service.price);
          setTechniciansNeeded(service.technicians_needed);
          setPestType(service.pest_type || "");
          setDurationMinutes(service.duration_minutes || 30);

          if (serviceTypeOptions.includes(service.service_type)) {
            setServiceType(service.service_type);
            setCustomServiceType("");
          } else {
            setServiceType("Custom");
            setCustomServiceType(service.service_type);
          }

          if (categoryOptions.includes(service.category)) {
            setCategory(service.category);
            setCustomCategory("");
          } else {
            setCategory("Custom");
            setCustomCategory(service.category);
          }
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load service");
        navigate("/admin/services");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("Not authenticated. Please login.");
      return;
    }

    try {
      setLoading(true);
      const finalServiceType = serviceType === "Custom" ? customServiceType : serviceType;
      const finalCategory = category === "Custom" ? customCategory : category;

      await axios.patch(
        `http://127.0.0.1:5000/admin/services/edit_service/${id}`,
        {
          name,
          description,
          price,
          technicians_needed: techniciansNeeded,
          service_type: finalServiceType,
          category: finalCategory,
          pest_type: pestType,
          duration_minutes: durationMinutes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      toast.success("Service updated successfully!");
      navigate("/admin/services");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto bg-white p-10 rounded-xl shadow-lg"
      >
        <h2 className="text-3xl font-semibold text-indigo-700 mb-8 text-center">
          Edit Service
        </h2>

        {/* Service Type & Category Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Service Type</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={loading}
            >
              <option value="" disabled>Select service type</option>
              {serviceTypeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {(serviceType === "Custom" || (customServiceType && !serviceTypeOptions.includes(serviceType))) && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">Custom Service Type</label>
              <input
                type="text"
                value={customServiceType}
                onChange={(e) => setCustomServiceType(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required={serviceType === "Custom"}
                disabled={loading}
                placeholder="Enter custom service type"
              />
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-medium mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={loading}
            >
              <option value="" disabled>Select category</option>
              {categoryOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {(category === "Custom" || (customCategory && !categoryOptions.includes(category))) && (
            <div className="md:col-span-3 mt-2">
              <label className="block text-gray-700 font-medium mb-2">Custom Category</label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required={category === "Custom"}
                disabled={loading}
                placeholder="Enter custom category"
              />
            </div>
          )}
        </div>

        {/* Pest Type, Service Name, Price, Technicians, Duration Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Pest Type</label>
            <select
              value={pestType}
              onChange={(e) => setPestType(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={loading}
            >
              <option value="" disabled>Select pest type</option>
              <option value="Rodent">Rodent</option>
              <option value="Insect">Insect</option>
              <option value="Worms">Worms</option>
              <option value="Fungus">Fungus</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-2">Service Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={loading}
              placeholder="Enter service name"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Price (₹)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={loading}
              placeholder="Price in INR"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Technicians Needed</label>
            <input
              type="number"
              min={1}
              value={techniciansNeeded}
              onChange={(e) => setTechniciansNeeded(Number(e.target.value))}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={loading}
              placeholder="Number of technicians"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Duration (minutes)</label>
            <input
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={loading}
              placeholder="Duration in minutes"
            />
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <label className="block text-gray-700 font-medium mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full border rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
            disabled={loading}
            placeholder="Describe the service in detail"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-lg bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400 transition disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Service"}
          </button>
        </div>
      </form>
    </>
  );
}

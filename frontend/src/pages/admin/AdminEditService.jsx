import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Constants for service options
const serviceTypeOptions = ["Home Service", "Industrial Service", "Custom"];
const categoryOptions = ["General", "Pest Control", "Custom"];

export default function AdminEditService({ onCancel }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Form state
  const [serviceType, setServiceType] = useState("");
  const [customServiceType, setCustomServiceType] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [name, setName] = useState("");
  const [techniciansNeeded, setTechniciansNeeded] = useState(1);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch service data
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
        console.log(id);
        
        const response = await axios.get(
          `http://127.0.0.1:5000/admin/services/edit_service/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        if (response.data?.data) {
          const service = response.data.data;
          setName(service.name);
          setDescription(service.description);
          setPrice(service.price);
          setTechniciansNeeded(service.technicians_needed);
          
          // Handle service type
          if (serviceTypeOptions.includes(service.service_type)) {
            setServiceType(service.service_type);
          } else {
            setServiceType("Custom");
            setCustomServiceType(service.service_type);
          }

          // Handle category
          if (categoryOptions.includes(service.category)) {
            setCategory(service.category);
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

      const response = await axios.patch(
        `http://127.0.0.1:5000/admin/services/edit_service/${id}`,
        {
          name,
          description,
          price,
          technicians_needed: techniciansNeeded,
          service_type: finalServiceType,
          category: finalCategory
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
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
        className="w-full max-w-9xl max-h-max m-5 p-8 bg-white rounded shadow-md flex flex-col mr-2"
        style={{ minHeight: "600px" }}
      >
        <h2 className="text-3xl font-bold mb-8">Edit Service</h2>

        {/* Row 1: Service Type and Category */}
        <div className="grid grid-cols-3 gap-6 mb-6 flex-grow-0">
          <div>
            <label className="block font-semibold mb-2">Service Type</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
              disabled={loading}
            >
              <option value="" disabled>Select service type</option>
              {serviceTypeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {(serviceType === "Custom" || 
            (customServiceType && !serviceTypeOptions.includes(serviceType))) && (
            <div>
              <label className="block font-semibold mb-2">Custom Service Type</label>
              <input
                type="text"
                value={customServiceType}
                onChange={(e) => setCustomServiceType(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required={serviceType === "Custom"}
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label className="block font-semibold mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
              disabled={loading}
            >
              <option value="" disabled>Select category</option>
              {categoryOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Service Details */}
        <div className="flex gap-6 flex-grow mb-6" style={{ minHeight: "300px" }}>
          <div className="flex flex-col gap-6 w-1/2">
            <div>
              <label className="block font-semibold mb-2">Service Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">Technicians Needed</label>
              <input
                type="number"
                min={1}
                value={techniciansNeeded}
                onChange={(e) => setTechniciansNeeded(Number(e.target.value))}
                className="w-full border rounded px-3 py-2"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">Price (₹)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="w-1/2 flex flex-col">
            <label className="block font-semibold mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded px-3 py-2 flex-grow resize-none"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Row 3: Buttons */}
        <div className="flex justify-end space-x-6 flex-grow-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3 rounded bg-gray-300 hover:bg-gray-400 transition"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-3 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Service"}
          </button>
        </div>
      </form>
    </>
  );
}
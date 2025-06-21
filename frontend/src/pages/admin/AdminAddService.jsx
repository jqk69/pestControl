import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminAddService({ onCancel }) {
  const [serviceType, setServiceType] = useState("");
  const [customServiceType, setCustomServiceType] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [pestType, setPestType] = useState("");
  const [customPestType, setCustomPestType] = useState("");
  const [name, setName] = useState("");
  const [techniciansNeeded, setTechniciansNeeded] = useState(1);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState("");

  const navigate = useNavigate();

  const serviceTypeOptions = ["Home Service", "Industrial Service", "Custom"];
  const categoryOptions = ["General", "Pest Control", "Custom"];
  const pestTypeOptions = ["General", "Rodent", "Insect", "Mosquito", "Other"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");

    if (!token) {
      toast.error("Not authenticated. Please login.");
      return;
    }

    try {
      setLoading(true);
      const finalServiceType =
        serviceType === "Custom" ? customServiceType.trim() : serviceType;
      const finalCategory =
        category === "Custom" ? customCategory.trim() : category;
      const finalPestType =
        pestType === "Custom" ? customPestType.trim() : pestType;

      const formData = new FormData();
      formData.append("service_type", finalServiceType);
      formData.append("category", finalCategory);
      formData.append("pest_type", finalPestType);
      formData.append("name", name.trim());
      formData.append("technicians_needed", techniciansNeeded);
      formData.append("price", price);
      formData.append("description", description.trim());
      formData.append("duration_minutes", durationMinutes);

      const response = await axios.post(
        "http://127.0.0.1:5000/admin/services/add_service",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      toast.success("Service added successfully!");
      navigate("/admin/services");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg space-y-8"
        style={{ minHeight: "600px" }}
      >
        <h2 className="text-3xl font-extrabold text-indigo-700 mb-6">
          Add New Service
        </h2>

        {/* Service Type & Category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Service Type
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={loading}
            >
              <option value="" disabled>
                Select service type
              </option>
              {serviceTypeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {serviceType === "Custom" && (
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Custom Service Type
              </label>
              <input
                type="text"
                value={customServiceType}
                onChange={(e) => setCustomServiceType(e.target.value)}
                placeholder="Enter custom service type"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={loading}
            >
              <option value="" disabled>
                Select category
              </option>
              {categoryOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Duration, Technicians, Price */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Duration (minutes)
            </label>
            <input
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              placeholder="Duration in minutes"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Technicians Needed
            </label>
            <input
              type="number"
              min={1}
              value={techniciansNeeded}
              onChange={(e) => setTechniciansNeeded(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Price (₹)
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Pest Type */}
        <div className="max-w-sm">
          <label className="block mb-2 font-semibold text-gray-700">Pest Type</label>
          <select
            value={pestType}
            onChange={(e) => setPestType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
            disabled={loading}
          >
            <option value="" disabled>
              Select pest type
            </option>
            {pestTypeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Service Name & Description */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label className="block mb-2 font-semibold text-gray-700">Service Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Service name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={loading}
            />
          </div>

          <div className="flex-1 flex flex-col">
            <label className="block mb-2 font-semibold text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description"
              className="w-full h-32 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-lg bg-gray-300 hover:bg-gray-400 transition font-semibold"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition font-semibold"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Service"}
          </button>
        </div>
      </form>
    </>
  );
}

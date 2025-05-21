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
  const [name, setName] = useState("");
  const [techniciansNeeded, setTechniciansNeeded] = useState(1);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const serviceTypeOptions = ["Home Service", "Industrial Service", "Custom"];
  const categoryOptions = ["General", "Pest Control", "Custom"];

const handleSubmit = async (e) => {
  e.preventDefault();
  const token = sessionStorage.getItem("token");
    console.log(token);
    
  if (!token) {
    toast.error("Not authenticated. Please login.");
    return;
  }

  try {
    const finalServiceType = serviceType === "Custom" ? customServiceType.trim() : serviceType;
    const finalCategory = category === "Custom" ? customCategory.trim() : category;

    // Create FormData instead of JSON payload
    const formData = new FormData();
    formData.append("service_type", finalServiceType);
    formData.append("category", finalCategory);
    formData.append("name", name.trim());
    formData.append("technicians_needed", techniciansNeeded);
    formData.append("price", price);
    formData.append("description", description.trim());

    const response = await axios.post("http://127.0.0.1:5000/admin/services/add_service", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        // Notice: No need to manually set Content-Type for FormData
      },
      withCredentials: true
    });

    toast.success("Service added successfully!");
    navigate("/admin/services");

  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to add service");
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
        <h2 className="text-3xl font-bold mb-8">Add New Service</h2>

        {/* Row 1: 3 inputs side-by-side */}
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
              <label className="block font-semibold mb-2">Custom Service Type</label>
              <input
                type="text"
                value={customServiceType}
                onChange={(e) => setCustomServiceType(e.target.value)}
                placeholder="Enter custom service type"
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

        {/* Row 2: Left side stacked 3 inputs, right side textarea (fills height) */}
        <div className="flex gap-6 flex-grow mb-6" style={{ minHeight: "300px" }}>
          {/* Left side: stacked three inputs */}
          <div className="flex flex-col gap-6 w-1/2">
            <div>
              <label className="block font-semibold mb-2">Service Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Service name"
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
                onChange={(e) => setTechniciansNeeded(e.target.value)}
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
                placeholder="Price"
                className="w-full border rounded px-3 py-2"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Right side: textarea */}
          <div className="w-1/2 flex flex-col">
            <label className="block font-semibold mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description"
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
            {loading ? "Saving..." : "Save Service"}
          </button>
        </div>
      </form>
    </>
  );
}

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function UserServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`http://127.0.0.1:5000/user/service/${id}`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });

        if (response.data.success) {
          setService(response.data.service);
        } else {
          setError("Service not found.");
        }
      } catch (err) {
        setError("Failed to fetch service details.");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  if (loading)
    return (
      <div className="text-center mt-20 text-gray-600">Loading service details...</div>
    );

  if (error)
    return (
      <div className="text-center mt-20 text-red-600 font-semibold">{error}</div>
    );

  // Destructure for cleaner JSX below
  const {
    name,
    category,
    service_type,
    technicians_needed,
    price,
    description,
  } = service;

  return (
    <main className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8 my-12">
  {/* Header */}
  <header className="mb-8 border-b border-gray-300 pb-4">
    <h1 className="text-4xl font-extrabold text-gray-900">{name}</h1>
    <p className="text-gray-600 mt-2">
      <span className="font-semibold">Category:</span> {category} &nbsp;|&nbsp;{" "}
      <span className="font-semibold">Type:</span> {service_type}
    </p>
  </header>

  {/* Details Section */}
  <section className="mb-8 grid grid-cols-2 gap-x-10 text-gray-800">
    <div>
      <h2 className="font-semibold text-lg mb-1">Technicians Needed</h2>
      <p>{technicians_needed}</p>
    </div>
    <div>
      <h2 className="font-semibold text-lg mb-1">Price</h2>
      <p>₹{price}</p>
    </div>
  </section>

  {/* Description */}
  <section className="mb-8">
    <h2 className="font-semibold text-lg mb-2">Description</h2>
    <p className="text-gray-700 leading-relaxed">{description}</p>
  </section>

  {/* Action Button */}
  <footer>
    <button
      onClick={() => alert("Booking functionality coming soon!")}
      className="w-full md:w-auto bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition font-semibold"
      type="button"
    >
      Book This Service
    </button>
  </footer>
</main>

  );
}

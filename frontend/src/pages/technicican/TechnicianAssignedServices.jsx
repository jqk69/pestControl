import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

export default function TechnicianAssignedServices() {
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    axios
      .get("http://127.0.0.1:5000/technician/assigned-services", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAssigned(res.data.assigned_services || []);
      })
      .catch((err) => {
        console.error("Error fetching assigned services", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const formatDate = (dt) => new Date(dt).toLocaleString();

  const goToDetails = (bookingId) => {
    navigate(`/technician/service/${bookingId}`);
  };

  return (
    <div className="p-6 bg-white min-h-screen font-sans">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Assigned Services</h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : assigned.length === 0 ? (
        <p className="text-gray-500 italic">No assigned services yet.</p>
      ) : (
        <ul className="space-y-4">
          {assigned.map((item) => (
            <li
              key={item.booking_id}
              className="p-5 rounded-lg shadow-md border bg-gray-50 flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-700">
                  {item.service_name}
                </h3>
                <p className="text-gray-600">
                  Date & Time: <span className="font-medium">{formatDate(item.booking_date)}</span>
                </p>
                <p className="text-gray-600">
                  Status: <span className="capitalize text-blue-600 font-medium">{item.status}</span>
                </p>
                {item.location_lat && item.location_lng && (
                  <p className="text-gray-600 text-sm">
                    Location: {item.location_lat}, {item.location_lng}
                  </p>
                )}
              </div>
              <button
                onClick={() => goToDetails(item.booking_id)}
                className="ml-4 p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                title="View Details"
              >
                <FaArrowRight />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

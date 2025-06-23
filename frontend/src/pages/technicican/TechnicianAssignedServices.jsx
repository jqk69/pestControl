import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

export default function TechnicianAssignedServices() {
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("confirmed");
  const [technicianLocation, setTechnicianLocation] = useState(null);
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

    // Get technician's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTechnicianLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.warn("Geolocation error:", err);
          setTechnicianLocation(null);
        }
      );
    }
  }, []);

  const formatDate = (dt) => new Date(dt).toLocaleString();

  const goToDetails = (bookingId) => {
    navigate(`/technician/service/${bookingId}`);
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const filteredAndSorted = assigned
    .filter((item) => item.status === filter)
    .sort((a, b) => {
      if (!technicianLocation || !a.location_lat || !b.location_lat) return 0;
      const distA = calculateDistance(
        technicianLocation.lat,
        technicianLocation.lng,
        a.location_lat,
        a.location_lng
      );
      const distB = calculateDistance(
        technicianLocation.lat,
        technicianLocation.lng,
        b.location_lat,
        b.location_lng
      );
      return distA - distB;
    });

  return (
    <div className="p-6 bg-white min-h-screen font-sans">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Assigned Services
      </h2>

      <div className="mb-4 flex gap-4">
        <button
          onClick={() => setFilter("confirmed")}
          className={`px-4 py-2 rounded ${
            filter === "confirmed"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Confirmed
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded ${
            filter === "pending"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Pending
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : filteredAndSorted.length === 0 ? (
        <p className="text-gray-500 italic">
          No {filter} services assigned yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {filteredAndSorted.map((item) => (
            <li
              key={item.booking_id}
              className="p-5 rounded-lg shadow-md border bg-gray-50 flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-700">
                  {item.service_name}
                </h3>
                <p className="text-gray-600">
                  Date & Time:{" "}
                  <span className="font-medium">
                    {formatDate(item.booking_date)}
                  </span>
                </p>
                <p className="text-gray-600">
                  Status:{" "}
                  <span className="capitalize text-blue-600 font-medium">
                    {item.status}
                  </span>
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

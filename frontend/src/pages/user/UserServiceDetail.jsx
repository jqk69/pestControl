import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";
import { toast } from 'react-toastify';

export default function UserServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [requirements, setRequirements] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    async function fetchService() {
      setLoading(true);
      try {
        const response = await axios.get(`http://127.0.0.1:5000/user/service/${id}`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        });
        if (response.data.success) {
          setService(response.data.service);
        } else {
          setError(response.data.message || "Service not found.");
        }
      } catch (err) {
        if (err.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          navigate("/login");
        } else {
          setError(err.response?.data?.message || "Failed to fetch service details.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchService();
  }, [id, navigate]);

  useEffect(() => {
    if (!mapRef.current && !loading && !error) {
      const map = L.map("map", { scrollWheelZoom: true }).setView([20.5937, 78.9629], 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      L.Control.geocoder({ defaultMarkGeocode: false })
        .on("markgeocode", (e) => {
          map.setView(e.geocode.center, 14);
          if (markerRef.current) {
            markerRef.current.setLatLng(e.geocode.center).openPopup();
          } else {
            markerRef.current = L.marker(e.geocode.center)
              .addTo(map)
              .bindPopup("Selected Location")
              .openPopup();
          }
        })
        .addTo(map);

      map.on("click", (e) => {
        if (markerRef.current) {
          markerRef.current.setLatLng(e.latlng).openPopup();
        } else {
          markerRef.current = L.marker(e.latlng)
            .addTo(map)
            .bindPopup("Selected Location")
            .openPopup();
        }
      });

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [loading, error]);

  const removeMarker = () => {
    if (markerRef.current && mapRef.current) {
      mapRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!markerRef.current) {
      toast.error("Please select a location on the map");
      return;
    }
    
    if (!selectedDate) {
      toast.error("Please select a booking date");
      return;
    }
    
    if (!selectedTime) {
      toast.error("Please select a booking time");
      return;
    }

   const bookingDate = new Date(`${selectedDate}T${selectedTime}:00`);

const pad = (num) => num.toString().padStart(2, '0');

const bookingDateTime =
  `${bookingDate.getFullYear()}-${pad(bookingDate.getMonth() + 1)}-${pad(bookingDate.getDate())} ` +
  `${pad(bookingDate.getHours())}:${pad(bookingDate.getMinutes())}:${pad(bookingDate.getSeconds())}`;

    const now = new Date();
    
    if (bookingDate < now) {
      toast.error("Booking date and time must be in the future");
      return;
    }

    const { lat, lng } = markerRef.current.getLatLng();

    try {
      setIsBooking(true);
      const res = await axios.post(
        `http://127.0.0.1:5000/user/service/${id}/book`,
        {
          lat,
          lng,
          booking_date: bookingDateTime,
          requirements,
        },
        { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } }
      );
      
      if (res.data.success) {
        toast.success(res.data.message || "Booking created successfully!");
        navigate(`/user/service/payment/${res.data.booking_id}`);
      } else {
        toast.error(res.data.message || "Failed to create booking");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      } else {
        toast.error(err.response?.data?.message || "Failed to save booking details");
      }
    } finally {
      setIsBooking(false);
    }
  };

  const minDate = new Date().toISOString().split("T")[0];
  const timeSlots = [];
  for (let hour = 9; hour <= 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 18) timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-600 text-lg">
        Loading service details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-600 font-semibold">
        {error}
      </div>
    );
  }

  const { name, category, service_type, technicians_needed, price, description } = service;

  return (
    <section className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg px-4 py-2 my-12">
      <header className="mb-2 border-b border-gray-300 pb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{name}</h1>
        <p className="mt-2 text-gray-600 text-lg">
          <span className="font-semibold">Category:</span> {category} |{" "}
          <span className="font-semibold">Service Type:</span> {service_type}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-6 text-gray-800">
            <div className="bg-gray-50 rounded-md p-6 shadow-inner flex flex-col justify-center">
              <h3 className="font-semibold text-lg mb-2">Technicians Needed</h3>
              <p className="text-2xl font-medium">{technicians_needed}</p>
            </div>
            <div className="bg-gray-50 rounded-md p-6 shadow-inner flex flex-col justify-center">
              <h3 className="font-semibold text-lg mb-2">Price</h3>
              <p className="text-2xl font-medium">₹{price}</p>
            </div>
            <div className="bg-gray-50 rounded-md p-6 shadow-inner">
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{description}</p>
            </div>
          </div>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              Select Service Location
            </h2>
            <div
              id="map"
              className="w-full h-[420px] rounded-lg border border-gray-300 shadow-sm"
              aria-label="Map to select service location"
            />
            <button
              type="button"
              onClick={removeMarker}
              className="mt-4 inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg transition"
            >
              Remove Marker
            </button>
          </section>
        </div>

        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Booking Details</h2>
          <div className="flex flex-col gap-6">
            <div>
              <label
                htmlFor="bookingDate"
                className="block text-lg font-medium text-gray-700 mb-2"
              >
                Booking Date
              </label>
              <input
                id="bookingDate"
                type="date"
                min={minDate}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="block w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="bookingTime"
                className="block text-lg font-medium text-gray-700 mb-2"
              >
                Booking Time
              </label>
              <select
                id="bookingTime"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="block w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="requirements"
                className="block text-lg font-medium text-gray-700 mb-3 mt-12"
              >
                Special Requirements / Requests
              </label>
              <textarea
                id="requirements"
                rows={6}
                placeholder="Enter any special instructions or requests..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="block w-full rounded-md border border-gray-300 shadow-sm px-4 py-3 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={isBooking}
              className={`inline-block ${
                isBooking ? 'bg-gray-500' : 'bg-black hover:bg-gray-700'
              } text-white font-extrabold px-8 py-4 rounded-lg shadow-lg transition mt-5`}
              aria-label={`Book the ${name} service for ₹${price}`}
            >
              {isBooking ? 'Processing...' : `Book This Service for ₹${price}`}
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}
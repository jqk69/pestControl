import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchServices = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:5000/admin/services", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setServices(response.data.services || []);
      
    } catch (error) {
      console.error("Failed to fetch services:", error);
      toast.error(error.response?.data?.message || "Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEdit = (serviceId) => {
    navigate(`edit_service/${serviceId}`);
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    
    setIsDeleting(true);
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(
        `http://127.0.0.1:5000/admin/services/delete_service/${serviceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true
        }
      );
      toast.success("Service deleted successfully");
      setServices(prev => prev.filter(service => service.service_id !== serviceId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete service");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAdd = () => {
    navigate('add_service');
  };

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.service_type]) acc[service.service_type] = {};
    if (!acc[service.service_type][service.category]) {
      acc[service.service_type][service.category] = [];
    }
    acc[service.service_type][service.category].push(service);
    return acc;
  }, {});

  return (
    <main className="flex-1 bg-white text-gray-900 min-h-screen p-8 font-sans">
      <div className="max-w-9xl mx-auto bg-gray-100 rounded-lg shadow-md p-8">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10">
          <h1 className="text-4xl font-extrabold leading-tight text-black">
            Pest Service Management
          </h1>
          <button
            onClick={handleAdd}
            className="mt-4 md:mt-0 bg-black hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-md shadow transition-colors"
          >
            + Add New Service
          </button>
        </header>

        {loading ? (
          <p className="text-gray-600">Loading services...</p>
        ) : (
          <section className="space-y-12">
            {Object.entries(groupedServices).map(([serviceType, categories]) => (
              <div key={serviceType}>
                <h2 className="text-3xl font-bold mb-6 border-b-4 border-gray-700 pb-2 text-gray-900">
                  {serviceType}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {Object.entries(categories).map(([category, servicesList]) => (
                    <div
                      key={category}
                      className="bg-white rounded-lg shadow-sm p-6 border border-gray-300"
                    >
                      <h3 className="text-2xl font-semibold mb-5 border-b border-gray-400 pb-1 text-gray-900">
                        {category}
                      </h3>

                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-900 text-white">
                            <th className="py-3 px-4 rounded-tl-md">Service Name</th>
                            <th className="py-3 px-4">Pest Type</th>
                            <th className="py-3 px-4 rounded-tr-md">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {servicesList.map((service, idx) => (
                            <tr
                              key={service.service_id}
                              className={`border-b border-gray-300 ${
                                idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                              } hover:bg-gray-200 transition-colors`}
                            >
                              <td className="py-3 px-4 font-medium text-gray-900">
                                {service.name}
                              </td>
                              <td className="py-3 px-4 text-gray-800 capitalize">
                                {service.pest_type || "N/A"}
                              </td>
                              <td className="py-3 px-4 space-x-5">
                                <button
                                  onClick={() => handleEdit(service.service_id)}
                                  className="text-gray-800 hover:text-gray-600 font-semibold transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(service.service_id)}
                                  className="text-red-600 hover:text-red-400 font-semibold transition-colors"
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? "Deleting..." : "Delete"}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>

                      </table>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
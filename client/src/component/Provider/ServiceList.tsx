import { useEffect, useState } from "react";
import axios from "../../api/axios";

interface Category {
  _id: string;
  name: string;
}

interface ServiceListItem {
  _id: string;
  name: string;
  category: Category; // category is now an object with name
  description?: string;
  price: number;
  isActive: boolean;
}

const ServiceList: React.FC = () => {
  const [services, setServices] = useState<ServiceListItem[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchServices = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get<ServiceListItem[]>("/services/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(res.data);
      setFilteredServices(res.data);
    } catch (err: any) {
      setError("Failed to load services");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredServices(
      services.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.category.name.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, services]);

  const handleToggleActive = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `/services/${id}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchServices();
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices((prev) => prev.filter((s) => s._id !== id));
      setFilteredServices((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  return (
    <section className="p-6 bg-white rounded-md shadow-md max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-orange-700">
        My Services
      </h2>

      <input
        type="text"
        placeholder="Search by name or category..."
        className="mb-4 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading && <p>Loading services...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {!loading && filteredServices.length === 0 && (
        <p className="text-gray-600">No services found.</p>
      )}

      {filteredServices.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-orange-100 text-orange-900">
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Name
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Description
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Category
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Price (ETB)
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Status
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => (
                <tr
                  key={service._id}
                  className="hover:bg-orange-50 transition-colors"
                >
                  <td className="border border-gray-300 px-4 py-2">
                    {service.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {service.description || "-"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {service.category?.name || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {service.price.toFixed(2)} ETB
                  </td>
                  <td
                    className={`border border-gray-300 px-4 py-2 font-semibold ${
                      service.isActive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {service.isActive ? "Active" : "Inactive"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 flex justify-center gap-2">
                    <button
                      onClick={() => handleToggleActive(service._id)}
                      className={`px-3 py-1 rounded text-white ${
                        service.isActive
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {service.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDelete(service._id)}
                      className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default ServiceList;

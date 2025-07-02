import { useEffect, useState } from "react";
import axios from "../../api/axios";

type Provider = {
  _id: string;
  name: string;
};

type Service = {
  _id: string;
  name: string;
  description: string;
  price: number;
  provider: Provider; // provider is an object now
  createdAt: string;
};

const AdminServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get<Service[]>("/services", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setServices(res.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch services");
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) return <p className="p-6">Loading services...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">All Services</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {services.length === 0 ? (
        <p>No services found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border bg-white shadow-md">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Description</th>
                <th className="py-3 px-4 text-left">Price</th>
                <th className="py-3 px-4 text-left">Provider</th>
                <th className="py-3 px-4 text-left">Created At</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service._id} className="border-t hover:bg-gray-100">
                  <td className="py-2 px-4">{service.name}</td>
                  <td className="py-2 px-4">{service.description}</td>
                  <td className="py-2 px-4">${service.price}</td>
                  <td className="py-2 px-4">{service.provider.name}</td>
                  <td className="py-2 px-4">
                    {new Date(service.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminServices;

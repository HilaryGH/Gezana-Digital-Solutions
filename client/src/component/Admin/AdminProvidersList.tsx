import { useEffect, useState } from "react";
import axios from "../../api/axios";

const AdminProvidersList = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  interface Provider {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    credentials?: string[];
  }

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get<Provider[]>("/admin/providers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProviders(res.data);
      } catch (err: any) {
        setError("Failed to fetch providers");
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">All Providers</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Credentials</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((provider) => (
              <tr key={provider._id} className="border-t">
                <td className="px-4 py-2">{provider.name}</td>
                <td className="px-4 py-2">{provider.email}</td>
                <td className="px-4 py-2">{provider.phone || "N/A"}</td>
                <td className="px-4 py-2 space-y-1">
                  {provider.credentials && provider.credentials.length > 0 ? (
                    provider.credentials.map((file, index) => (
                      <a
                        key={index}
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline block"
                      >
                        View {index + 1}
                      </a>
                    ))
                  ) : (
                    <span className="text-gray-500">No credentials</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProvidersList;

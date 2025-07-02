import { useEffect, useState } from "react";
import axios from "../api/axios";

interface Service {
  _id: string;
  name: string;
  price: number;
  description?: string;
  category: { name: string };
  type: { name: string };
  provider?: { name: string };
}

const HomeServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const res = await axios.get<Service[]>("/services");
        setServices(res.data);
      } catch (err) {
        console.error("Failed to load services", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <section className="py-12 px-4 bg-gray-50">
      <h2 className="text-2xl font-bold text-center mb-6 text-orange-600">
        Available Services
      </h2>

      {loading ? (
        <p className="text-center">Loading services...</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((s) => (
            <div
              key={s._id}
              className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold text-orange-700 mb-1">
                {s.name}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                Category: {s.category?.name || "-"}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                Type: {s.type?.name || "-"}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                Price: ${s.price.toFixed(2)}
              </p>
              {s.provider && (
                <p className="text-xs text-gray-500">
                  Provider: {s.provider.name}
                </p>
              )}
              {s.description && (
                <p className="mt-2 text-gray-700 text-sm">
                  {s.description.slice(0, 80)}...
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default HomeServices;

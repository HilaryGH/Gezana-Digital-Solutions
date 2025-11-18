import { useEffect, useState } from "react";
import axios from "../api/axios";
import type { Service } from "../api/services";
import ServiceCard from "./ServiceCard";


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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-7xl mx-auto">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-4 animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-7xl mx-auto">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              variant="default"
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HomeServices;

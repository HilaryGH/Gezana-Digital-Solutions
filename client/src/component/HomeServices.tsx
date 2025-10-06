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
        <p className="text-center">Loading services...</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
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

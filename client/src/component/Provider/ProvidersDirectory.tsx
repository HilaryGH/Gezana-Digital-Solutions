import { useEffect, useState } from "react";
import axios from "../../api/axios";

interface GroupedServices {
  [category: string]: {
    providerName: string;
    serviceName: string;
    serviceId: string;
  }[];
}

const ProvidersDirectory = () => {
  const [data, setData] = useState<GroupedServices>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/services/grouped");
        console.log("Fetched grouped services:", res.data);
        setData(res.data as GroupedServices);
      } catch (err: any) {
        console.error(
          "Failed to load providers",
          err.response?.data || err.message || err
        );
        setError("Failed to load providers");
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  const toggleCategory = (category: string) => {
    setExpandedCategory((prev) => (prev === category ? null : category));
  };

  return (
    <section className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center text-orange">
        Service Providers by Category
      </h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {Object.entries(data).map(([category, providers]) => (
        <div key={category} className="mb-6">
          <button
            onClick={() => toggleCategory(category)}
            className="flex justify-between items-center w-full text-left font-semibold text-lg text-orange border-b pb-1 mb-2"
          >
            {category}
            <span>{expandedCategory === category ? "▲" : "▼"}</span>
          </button>

          {expandedCategory === category && (
            <ul className="pl-4 space-y-2">
              {providers.map((provider, index) => (
                <li key={index} className="text-gray-700">
                  • {provider.providerName} –{" "}
                  <span className="italic">{provider.serviceName}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </section>
  );
};

export default ProvidersDirectory;

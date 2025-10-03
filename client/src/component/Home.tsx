import { useState, useEffect } from "react";
import About from "./About";
import { ShieldCheck, ShoppingCart, Users } from "lucide-react";

const heroImages = [
  "/home-cleaning.jpg",
  "/repair.jpg",
  "/baby-sitting.jpg",
  "/movers.jpg",
];

const serviceCategories = [
  {
    name: "Home Maintenance",
    services: ["Plumbing", "Electrical Work", "Painting", "Carpentry"],
  },
  {
    name: "Cleaning Services",
    services: ["House Cleaning", "Office Cleaning", "Carpet Cleaning", "Window Cleaning"],
  },
  {
    name: "Appliance Repair",
    services: ["Refrigerator Repair", "Washing Machine Repair", "AC Repair", "Oven Repair"],
  },
  {
    name: "Personal Care",
    services: ["Babysitting", "Nanny Services", "Elderly Care", "Pet Care"],
  },
  {
    name: "Household & Home Services",
    services: ["Gardening", "Laundry", "Home Organization", "Pest Control"],
  },
];

const Home = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [nextImage, setNextImage] = useState(1);
  const [fade, setFade] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentImage(nextImage);
        setNextImage((nextImage + 1) % heroImages.length);
        setFade(true);
      }, 1000);
    }, 5000);
    return () => clearInterval(interval);
  }, [nextImage]);

  return (
    <>
      {/* Hero Section - Full Width */}
      <section className="w-full flex flex-col">
        <div className="relative w-full h-screen overflow-hidden">
          <div
            className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ${
              fade ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${heroImages[nextImage]})` }}
          />
          <div
            className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ${
              fade ? "opacity-0" : "opacity-100"
            }`}
            style={{ backgroundImage: `url(${heroImages[currentImage]})` }}
          />

          <div className="absolute inset-0 flex justify-center items-center px-6 bg-black bg-opacity-50">
            <div className="text-center text-white max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-orange-500">
                Your Home, Our Priority
              </h1>
              <p className="mb-6 text-lg md:text-xl">
                Find your next perfect service with ease and confidence.
              </p>
              <button className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-full font-medium transition">
                Get Started
              </button>
            </div>
          </div>
        </div>

        {/* Service Categories */}
        <div className="w-full bg-gray-50 p-6">
          <h2 className="text-3xl font-bold text-orange-500 mb-6 text-center">
            Explore Our Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceCategories.map((cat) => (
              <div
                key={cat.name}
                className="bg-white rounded-xl shadow-lg p-4 cursor-pointer hover:shadow-xl transition"
                onClick={() =>
                  setExpandedCategory(
                    expandedCategory === cat.name ? null : cat.name
                  )
                }
              >
                <h3 className="font-semibold text-lg text-orange-600 mb-2">
                  {cat.name}
                </h3>
                {expandedCategory === cat.name && (
                  <ul className="text-gray-700 mt-2 list-disc list-inside space-y-1">
                    {cat.services.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Gezana Section */}
      <section className="py-16 bg-gray-50 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-orange-500 mb-4">
            Why Choose Gezana?
          </h2>
          <p className="text-gray-700 max-w-3xl mx-auto mb-10 text-lg">
            Gezana Digital Solutions isn’t just a platform — it's your trusted
            gateway to reliable, high-quality services tailored to your daily
            needs. We make booking easy, secure, and personalized, all in one
            seamless experience.
          </p>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2 w-full">
              <img
                src="logo 3.png"
                alt="Why Choose Us"
                className="rounded-xl shadow-lg w-full h-auto object-cover"
              />
            </div>
            <div className="md:w-1/2 w-full grid gap-6">
              <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition flex flex-col items-start">
                <ShoppingCart className="text-orange-600 w-10 h-10 mb-4" />
                <h3 className="text-xl font-semibold text-orange-600 mb-2">
                  One-Stop Service Hub
                </h3>
                <p className="text-gray-600">
                  Access a wide range of services — from home repairs to
                  professional help — all in one platform.
                </p>
              </div>
              <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition flex flex-col items-start">
                <ShieldCheck className="text-orange-600 w-10 h-10 mb-4" />
                <h3 className="text-xl font-semibold text-orange-600 mb-2">
                  Secure & Seamless Booking
                </h3>
                <p className="text-gray-600">
                  Enjoy hassle-free booking with real-time availability and
                  secure online payments.
                </p>
              </div>
              <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition flex flex-col items-start">
                <Users className="text-orange-600 w-10 h-10 mb-4" />
                <h3 className="text-xl font-semibold text-orange-600 mb-2">
                  Trusted Service Providers
                </h3>
                <p className="text-gray-600">
                  We partner only with verified and skilled service
                  professionals you can rely on.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <About />
      </section>
    </>
  );
};

export default Home;


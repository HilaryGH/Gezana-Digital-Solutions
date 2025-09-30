import { useState, useEffect } from "react";
import About from "./About";
import { ShieldCheck, ShoppingCart, Users } from "lucide-react";

const heroImages = [
  "/home-cleaning.jpg",
  "/repair.jpg",
  "/baby-sitting.jpg",
  "/movers.jpg",
];

const Home = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [nextImage, setNextImage] = useState(1);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // fade out current
      setTimeout(() => {
        setCurrentImage(nextImage);
        setNextImage((nextImage + 1) % heroImages.length);
        setFade(true); // fade in new image
      }, 1000); // match CSS transition duration
    }, 4000);

    return () => clearInterval(interval);
  }, [nextImage]);

  return (
    <>
      <section className="relative h-screen w-full overflow-hidden mt-16">
        {/* Crossfade images */}
        <div
          className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ${
            fade ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${heroImages[nextImage]})` }}
        ></div>

        <div
          className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ${
            fade ? "opacity-0" : "opacity-100"
          }`}
          style={{ backgroundImage: `url(${heroImages[currentImage]})` }}
        ></div>

        {/* Polygon overlay with content */}
        <div className="absolute inset-0 flex px-4 w-full">
          <div
            className="animate-horizontalFlip w-full md:w-1/2 h-1/2 mt-30 flex justify-center items-center"
            style={{
              clipPath:
                "polygon(50% 0%, 100% 50%, 100% 100%, 0% 100%, 0% 50%)",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
            }}
          >
            <div className="text-center text-white max-w-md px-4">
              <h1 className="text-2xl md:text-3xl mt-20 font-bold text-orange mb-3">
                Your Home, Our Priority
              </h1>
              <p className="text-base sm:text-lg mb-4">
                Find your next perfect place to live.
              </p>
              <button className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-full font-medium transition">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Gezana Section */}
      <section className="py-16 bg-gray-50 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-orange mb-4">
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

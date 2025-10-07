import React from "react";
import { Link } from "react-router-dom";
import { 
  FaWrench, 
  FaBroom, 
  FaTruck, 
  FaBaby, 
  FaTools, 
  FaHome,
  FaStar,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle
} from "react-icons/fa";

const services = [
  {
    id: 1,
    name: "Home Maintenance",
    description: "Professional repair and maintenance services for your home. From plumbing to electrical work, carpentry, and general repairs.",
    image: "photo 6.jpg",
    icon: FaWrench,
    features: ["Plumbing", "Electrical", "Carpentry", "General Repairs"],
    price: "From $50/hour",
    rating: 4.9,
    reviews: 234,
    category: "Home Maintenance"
  },
  {
    id: 2,
    name: "Cleaning Services",
    description: "Deep cleaning and regular maintenance services to keep your home spotless and healthy. Residential, commercial, and specialized cleaning.",
    image: "photo 1.jpg",
    icon: FaBroom,
    features: ["Residential Cleaning", "Deep Cleaning", "Move-in/Move-out", "Window Cleaning"],
    price: "From $30/hour",
    rating: 4.8,
    reviews: 189,
    category: "Cleaning Services"
  },
  {
    id: 3,
    name: "Appliance Repair",
    description: "Expert repair services for all your home appliances. Fast, reliable, and cost-effective solutions for all major brands.",
    image: "photo 2.jpg",
    icon: FaTools,
    features: ["Refrigerator Repair", "AC Repair", "Washing Machine", "Oven Repair"],
    price: "From $60/hour",
    rating: 4.6,
    reviews: 167,
    category: "Appliance Repair"
  },
  {
    id: 4,
    name: "Personal Care",
    description: "Professional beauty and wellness services. From haircuts and styling to spa treatments and massage therapy.",
    image: "photo 3.jpg",
    icon: FaBaby,
    features: ["Haircut & Styling", "Facial & Spa", "Manicure & Pedicure", "Massage Therapy"],
    price: "From $25/hour",
    rating: 4.9,
    reviews: 298,
    category: "Personal Care"
  },
  {
    id: 5,
    name: "Housemaid Services",
    description: "Comprehensive household assistance including daily housekeeping, cooking, laundry, and personal care services.",
    image: "photo 4.jpg",
    icon: FaHome,
    features: ["Daily Housekeeping", "Cooking Services", "Laundry & Ironing", "Child Care"],
    price: "From $20/hour",
    rating: 4.8,
    reviews: 203,
    category: "Housemaid Services"
  },
  {
    id: 6,
    name: "Hotel/Lounge Services",
    description: "Professional hospitality services including room service, concierge, event planning, and guest services.",
    image: "photo 5.jpg",
    icon: FaTruck,
    features: ["Room Service", "Concierge", "Event Planning", "Guest Services"],
    price: "From $35/hour",
    rating: 4.7,
    reviews: 156,
    category: "Hotel/Lounge Services"
  }
];

const ServicesPage: React.FC = () => {
  const handleServiceClick = (serviceId: number) => {
    // Navigate to home page to show more services in that category
    window.location.href = `/?category=${serviceId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pt-20">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Our <span className="text-orange-600">Services</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our six main service categories. Each category offers a comprehensive range of specialized services designed to meet all your needs.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={service.id}
                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden border border-gray-100"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Service Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5">
                      <IconComponent className="w-4 h-4 text-orange-600" />
                      <span className="text-xs font-semibold text-gray-700">{service.category}</span>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                      <FaStar className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs font-semibold text-gray-700">{service.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Service Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                    {service.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {service.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-1 bg-orange-50 text-orange-700 px-2 py-1 rounded-full text-xs font-medium"
                        >
                          <FaCheckCircle className="w-3 h-3" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rating and Reviews */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <FaStar className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-semibold text-gray-700">{service.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">({service.reviews} reviews)</span>
                    </div>
                    <div className="text-lg font-bold text-orange-600">
                      {service.price}
                    </div>
                  </div>

                  {/* Discover More Button */}
                  <button
                    onClick={() => handleServiceClick(service.id)}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
                  >
                    <FaCheckCircle className="w-4 h-4" />
                    <span>Discover More</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action Section */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Book a Service?
            </h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Explore our complete range of services or start booking from any of our six main categories.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white hover:bg-orange-50 text-orange-600 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Browse All Services
              </button>
              <Link
                to="/"
                className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Why Choose Our Services */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our <span className="text-orange-600">Services?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to delivering exceptional service quality and customer satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaCheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Verified Professionals</h3>
              <p className="text-gray-600 leading-relaxed">
                All our service providers are thoroughly vetted, background-checked, and quality-assured.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaClock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">24/7 Availability</h3>
              <p className="text-gray-600 leading-relaxed">
                Get help when you need it most. Our emergency services are available around the clock.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaStar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quality Guaranteed</h3>
              <p className="text-gray-600 leading-relaxed">
                We stand behind our work with satisfaction guarantees and quality assurance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;

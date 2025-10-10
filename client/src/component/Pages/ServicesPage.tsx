import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaWrench, 
  FaBroom, 
  FaTruck, 
  FaBaby, 
  FaTools, 
  FaHome,
  FaStar,
  FaClock,
  FaCheckCircle,
  FaArrowRight
} from "react-icons/fa";

// Six main service categories
const serviceCategories = [
  {
    id: '1',
    name: 'Home Maintenance',
    icon: FaWrench,
    image: '/photo 6.jpg',
    description: 'Professional home repair and maintenance services including plumbing, electrical, carpentry, and general repairs.',
    services: ['Plumbing', 'Electrical', 'Carpentry', 'General Repairs', 'Door & Window Repair', 'Furniture Assembly', 'TV Mounting', 'Roofing', 'Flooring', 'HVAC Services'],
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  {
    id: '2',
    name: 'Cleaning Services',
    icon: FaBroom,
    image: '/photo 1.jpg',
    description: 'Comprehensive cleaning solutions for residential and commercial spaces, from deep cleaning to regular maintenance.',
    services: ['Residential Cleaning', 'Carpet Washing', 'Pest Control', 'Deep Cleaning', 'Move-in/Move-out Cleaning', 'Post-Construction Cleaning', 'Window Cleaning', 'Office Cleaning', 'Upholstery Cleaning', 'Regular Maintenance'],
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700'
  },
  {
    id: '3',
    name: 'Appliance Repair',
    icon: FaTools,
    image: '/photo 2.jpg',
    description: 'Expert repair and maintenance for all types of household appliances including refrigerators, ACs, and more.',
    services: ['Refrigerator Repair', 'AC Repair', 'Washing Machine Repair', 'Dryer Repair', 'Dishwasher Repair', 'Oven Repair', 'Microwave Repair', 'Water Heater Repair', 'Appliance Installation', 'Emergency Repair'],
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700'
  },
  {
    id: '4',
    name: 'Personal Care',
    icon: FaBaby,
    image: '/photo 3.jpg',
    description: 'Professional beauty and personal care services including hair, makeup, spa treatments, and wellness services.',
    services: ['Haircut', 'Hairstyle', 'Facial', 'Manicure & Pedicure', 'Makeup Services', 'Eyebrow Shaping', 'Hair Coloring', 'Spa Treatments', 'Massage Therapy', 'Beauty Consultation'],
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700'
  },
  {
    id: '5',
    name: 'Housemaid Services',
    icon: FaHome,
    image: '/photo 4.jpg',
    description: 'Professional housekeeping and domestic services including cooking, laundry, child care, and elderly care.',
    services: ['Daily Housekeeping', 'Cooking Services', 'Laundry Services', 'Ironing Services', 'Grocery Shopping', 'Child Care Assistance', 'Elderly Care', 'Pet Care', 'Meal Preparation', 'Home Organization'],
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700'
  },
  {
    id: '6',
    name: 'Hotel/Lounge Services',
    icon: FaTruck,
    image: '/photo 5.jpg',
    description: 'Professional hospitality services for hotels, lounges, and events including catering, event planning, and guest services.',
    services: ['Room Service', 'Concierge', 'Housekeeping', 'Event Planning', 'Catering', 'Spa Services', 'Front Desk', 'Guest Services', 'Bartending', 'VIP Services'],
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700'
  }
];

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName: string) => {
    // Navigate to home page with category filter
    navigate(`/?search=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pt-20">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Section */}
          <div>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
              <FaTools className="text-orange-600 text-2xl" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Our <span className="text-orange-600">Services</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Discover our six main service categories. Each category offers a comprehensive range of specialized services designed to meet all your needs.
            </p>
            <div className="flex gap-4">
              <button className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Get Started
              </button>
              <Link
                to="/"
                className="border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
          
          {/* Right Section */}
          <div className="relative">
            <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-3xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Professional Services at Your <span className="text-orange-600">Fingertips</span>
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                    <FaCheckCircle className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">Verified Experts</h3>
                    <p className="text-gray-600">All professionals are thoroughly vetted and certified</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                    <FaClock className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">Quick Response</h3>
                    <p className="text-gray-600">Get service providers matched within minutes</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                    <FaStar className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">Quality Guaranteed</h3>
                    <p className="text-gray-600">100% satisfaction or your money back</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {serviceCategories.map((category, index) => (
                <div
                key={category.id}
                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden border border-gray-100 cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleCategoryClick(category.name)}
              >
                {/* Category Header */}
                <div className="relative h-64 overflow-hidden">
                  {/* Background Image */}
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent`}></div>
                  
                  {/* Category Title */}
                  <div className="absolute bottom-4 left-0 right-0 z-10 text-center px-4">
                    <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-2xl">
                      {category.name}
                    </h3>
                  </div>
                </div>

                {/* Category Content */}
                  <div className="p-6">
                  <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                    {category.description}
                  </p>

                  {/* Services List */}
                    <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Popular Services:</h4>
                      <div className="flex flex-wrap gap-2">
                      {category.services.slice(0, 6).map((service, idx) => (
                        <span key={idx} className={`${category.bgColor} ${category.textColor} px-2 py-1 rounded-full text-xs font-medium`}>
                          {service}
                        </span>
                      ))}
                      {category.services.length > 6 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                          +{category.services.length - 6} more
                        </span>
                        )}
                      </div>
                    </div>

                  {/* Explore Button */}
                    <button
                    className={`w-full bg-gradient-to-r ${category.color} text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform group-hover:scale-105 flex items-center justify-center space-x-2`}
                    >
                    <span>Explore Services</span>
                    <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
          ))}
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

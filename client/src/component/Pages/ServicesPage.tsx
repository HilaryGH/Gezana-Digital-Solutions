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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-orange-50/30 pt-20 relative overflow-hidden">
      {/* Decorative Background Elements with Brand Colors */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-float" style={{
          background: 'radial-gradient(circle, rgba(247, 147, 30, 0.3), rgba(247, 147, 30, 0.1))'
        }}></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-float" style={{
          animationDelay: '2s',
          background: 'radial-gradient(circle, rgba(46, 61, 211, 0.3), rgba(46, 61, 211, 0.1))'
        }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{
          animationDelay: '4s',
          background: 'radial-gradient(circle, rgba(0, 174, 239, 0.3), rgba(0, 174, 239, 0.1))'
        }}></div>
        {/* Brand pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 50px, rgba(247, 147, 30, 0.1) 50px, rgba(247, 147, 30, 0.1) 100px, transparent 100px, transparent 150px, rgba(46, 61, 211, 0.1) 150px, rgba(46, 61, 211, 0.1) 200px)'
        }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Right Section (swapped from left) */}
          <div className="relative order-2 lg:order-1">
            <div className="bg-gradient-to-br from-white via-orange-50/50 to-blue-50/50 rounded-3xl p-8 shadow-2xl border-2 border-gray-100 relative overflow-hidden group">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-200/30 to-blue-200/30 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-200/30 to-orange-200/30 rounded-full -ml-24 -mb-24 group-hover:scale-125 transition-transform duration-1000" style={{ transitionDelay: '0.2s' }}></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                  Professional Services at Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-blue-600">Fingertips</span>
                </h2>
                <div className="space-y-6">
                  {[
                    { icon: FaCheckCircle, title: "Verified Experts", description: "All professionals are thoroughly vetted and certified", gradient: "from-orange-500 to-orange-600" },
                    { icon: FaClock, title: "Quick Response", description: "Get service providers matched within minutes", gradient: "from-blue-500 to-blue-600" },
                    { icon: FaStar, title: "Quality Guaranteed", description: "100% satisfaction or your money back", gradient: "from-orange-500 via-orange-600 to-blue-600" }
                  ].map((feature, index) => {
                    const IconComponent = feature.icon;
                    return (
                      <div key={index} className="flex items-start gap-4 group/item">
                        <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover/item:scale-110 group-hover/item:rotate-6 transition-all duration-300 relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover/item:translate-x-[100%] transition-transform duration-700"></div>
                          <IconComponent className="text-white text-xl relative z-10" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover/item:text-transparent group-hover/item:bg-clip-text group-hover/item:bg-gradient-to-r group-hover/item:from-orange-600 group-hover/item:to-blue-600 transition-all duration-300">
                            {feature.title}
                          </h3>
                          <p className="text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          {/* Left Section (swapped from right) */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 via-orange-600 to-blue-600 rounded-3xl mb-6 shadow-2xl transform hover:scale-110 hover:rotate-6 transition-all duration-300">
              <FaTools className="text-white text-3xl" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-500 to-blue-600">Services</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Discover our six main service categories. Each category offers a comprehensive range of specialized services designed to meet all your needs.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-gradient-to-r from-orange-500 via-orange-600 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group">
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                <span className="relative z-10">Get Started</span>
              </button>
              <Link
                to="/"
                className="border-2 border-orange-600 text-orange-600 hover:bg-gradient-to-r hover:from-orange-600 hover:to-blue-600 hover:text-white hover:border-transparent px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center relative overflow-hidden group"
              >
                <span className="relative z-10">Back to Home</span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
              </Link>
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
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Brand gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-orange-600/30 group-hover:via-blue-600/20 group-hover:to-transparent transition-all duration-500"></div>
                  
                  {/* Animated border on hover */}
                  <div className="absolute inset-0 border-4 border-transparent group-hover:border-orange-500/50 transition-all duration-500 rounded-t-3xl"></div>
                  
                  {/* Category Title */}
                  <div className="absolute bottom-4 left-0 right-0 z-10 text-center px-4">
                    <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-2xl group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-200 group-hover:to-blue-200 transition-all duration-300">
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
                    className={`w-full bg-gradient-to-r ${category.color} text-white py-3 px-6 rounded-2xl font-semibold hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 flex items-center justify-center space-x-2 relative overflow-hidden`}
                    >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                    <span className="relative z-10">Explore Services</span>
                    <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
                    </button>
                  </div>
                </div>
          ))}
          </div>

        {/* Call to Action Section */}
        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-blue-600 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden group">
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full -ml-40 -mb-40 group-hover:scale-125 transition-transform duration-1000" style={{ transitionDelay: '0.2s' }}></div>
          
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
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Explore our complete range of services or start booking from any of our six main categories.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white hover:bg-gray-50 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-blue-600 px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group/btn">
                <span className="absolute inset-0 bg-gradient-to-r from-orange-600 to-blue-600 rounded-full opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10 text-white group-hover/btn:text-white">Browse All Services</span>
              </button>
              <Link
                to="/"
                className="border-2 border-white text-white hover:bg-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-orange-600 hover:to-blue-600 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
              >
                <span className="relative z-10">Back to Home</span>
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
            {[
              { icon: FaCheckCircle, title: "Verified Professionals", description: "All our service providers are thoroughly vetted, background-checked, and quality-assured.", gradient: "from-orange-500 to-orange-600" },
              { icon: FaClock, title: "24/7 Availability", description: "Get help when you need it most. Our emergency services are available around the clock.", gradient: "from-blue-500 to-blue-600" },
              { icon: FaStar, title: "Quality Guaranteed", description: "We stand behind our work with satisfaction guarantees and quality assurance.", gradient: "from-orange-500 via-orange-600 to-blue-600" }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center group bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 hover:shadow-2xl hover:border-transparent transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden">
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`}></div>
                  
                  <div className="relative z-10">
                    <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      <IconComponent className="w-10 h-10 text-white relative z-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-blue-600 transition-all duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;

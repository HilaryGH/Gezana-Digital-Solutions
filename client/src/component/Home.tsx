import { useState } from "react";
import About from "./About";
import { ShieldCheck, ShoppingCart, Users, ChevronDown, ChevronUp } from "lucide-react";

const serviceCategories = [
  {
    name: "Home Maintenance",
    icon: "🔧",
    services: ["Plumbing", "Electrical Work", "Painting", "Carpentry"],
  },
  {
    name: "Cleaning Services",
    icon: "🧹",
    services: ["House Cleaning", "Office Cleaning", "Carpet Cleaning", "Window Cleaning"],
  },
  {
    name: "Appliance Repair",
    icon: "⚙️",
    services: ["Refrigerator Repair", "Washing Machine Repair", "AC Repair", "Oven Repair"],
  },
  {
    name: "Personal Care",
    icon: "👶",
    services: ["Babysitting", "Nanny Services", "Elderly Care", "Pet Care"],
  },
  {
    name: "Household & Home Services",
    icon: "🏠",
    services: ["Gardening", "Laundry", "Home Organization", "Pest Control"],
  },
  {
    name: "Hotel/Lounge Services",
    icon: "🏨",
    services: ["Room Service", "Concierge", "Housekeeping", "Event Planning", "Catering", "Spa Services"],
  },
];

const Home = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  return (
    <>
      <section className="w-full flex flex-col bg-gradient-to-br from-orange-50 via-white to-orange-100 pt-20">
        {/* Hero Section - Split Left and Right */}
        <div className="relative w-full h-screen flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left Side - Home Structure */}
          <div className="relative w-full lg:w-1/2 h-1/2 lg:h-full bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center overflow-hidden">
            
            {/* Decorative Background */}
            <div className="absolute inset-0">
            <div className="absolute top-16 left-8 w-16 h-16 bg-orange-500/10 rounded-full blur-xl animate-float"></div>
              <div
                className="absolute top-32 right-16 w-24 h-24 bg-orange-400/10 rounded-full blur-xl animate-float"
                style={{ animationDelay: "2s" }}
              ></div>
              <div
                className="absolute bottom-32 left-16 w-20 h-20 bg-orange-600/10 rounded-full blur-xl animate-float"
                style={{ animationDelay: "4s" }}
              ></div>
          </div>
          
             {/* House Container */}
             <div className="relative mx-auto w-[350px] sm:w-[450px] md:w-[550px] lg:w-[650px] h-[200px] sm:h-[240px] md:h-[280px] lg:h-[320px] flex flex-col items-center justify-end">

               {/* Roof */}
               <div className="relative w-0 h-0 border-l-[175px] sm:border-l-[225px] md:border-l-[275px] lg:border-l-[325px] border-r-[175px] sm:border-r-[225px] md:border-r-[275px] lg:border-r-[325px] border-b-[50px] sm:border-b-[65px] md:border-b-[80px] lg:border-b-[95px] border-l-transparent border-r-transparent border-b-orange-700 drop-shadow-2xl"></div>
                  
               {/* Roof Overhang */}
               <div className="w-full h-[5px] sm:h-[7px] md:h-[9px] lg:h-[11px] bg-gradient-to-b from-orange-800 to-orange-700 shadow-lg"></div>

               {/* Walls Section - Narrower than roof */}
               <div className="relative w-[280px] sm:w-[360px] md:w-[440px] lg:w-[520px] h-[120px] sm:h-[150px] md:h-[180px] lg:h-[210px] flex mx-auto">

                 {/* Left Wall */}
                 <div className="flex-1 bg-gradient-to-t from-orange-500 to-orange-400 shadow-xl rounded-l-lg"></div>

                 {/* Center Wall */}
                 <div className="flex-[1.5] bg-gradient-to-t from-orange-500 to-orange-400 shadow-xl"></div>

                 {/* Right Wall */}
                 <div className="flex-1 bg-gradient-to-t from-orange-500 to-orange-400 shadow-xl rounded-r-lg"></div>
                </div>
                
               {/* Heading centered in walls */}
               <div className="absolute top-[105px] sm:top-[130px] md:top-[155px] lg:top-[180px] left-1/2 transform -translate-x-1/2 w-[280px] sm:w-[360px] md:w-[440px] lg:w-[520px] text-center px-4">
                 <h1 className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold drop-shadow-lg animate-text-glow">
                    Your Home, Our Priority
                  </h1>
               </div>

               {/* Beautiful Buttons inside walls */}
               <div className="absolute top-[155px] sm:top-[185px] md:top-[215px] lg:top-[245px] left-1/2 transform -translate-x-1/2 w-[280px] sm:w-[360px] md:w-[440px] lg:w-[520px] px-4">
                 <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 w-full">
                   {/* Find Services Button */}
                   <div className="flex-1 flex justify-center">
                     <button className="group relative bg-gradient-to-r from-white to-orange-50 text-orange-600 hover:from-orange-50 hover:to-white px-3 sm:px-4 md:px-6 lg:px-8 py-1.5 sm:py-2 md:py-3 lg:py-4 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm md:text-base lg:text-lg shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 sm:hover:scale-110 hover:-translate-y-1 sm:hover:-translate-y-2 animate-button-bounce overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                       <span className="relative z-10 flex items-center justify-center">
                      Find Services
                       </span>
                       <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-lg sm:rounded-xl"></div>
                    </button>
                   </div>

                   {/* Become a Provider Button */}
                   <div className="flex-1 flex justify-center">
                     <button className="group relative bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800 px-3 sm:px-4 md:px-6 lg:px-8 py-1.5 sm:py-2 md:py-3 lg:py-4 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm md:text-base lg:text-lg shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 sm:hover:scale-110 hover:-translate-y-1 sm:hover:-translate-y-2 animate-button-bounce overflow-hidden border-2 border-orange-500">
                       <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                       <span className="relative z-10 flex items-center justify-center">
                      Become a Provider
                       </span>
                       <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-lg sm:rounded-xl"></div>
                    </button>
                  </div>
                 </div>
               </div>

               {/* Foundation */}
               <div className="w-full h-[6px] sm:h-[8px] md:h-[10px] lg:h-[12px] bg-gradient-to-t from-orange-800 to-orange-700 shadow-lg"></div>
             </div>
          </div>

          {/* Right Side - Services */}
          <div className="relative w-full lg:w-1/2 h-1/2 lg:h-full bg-gradient-to-br from-orange-100 via-white to-orange-50 flex items-center justify-center overflow-hidden">
            
            {/* Beautiful Background Elements */}
            <div className="absolute inset-0">
              <div className="absolute top-10 right-10 w-24 h-24 bg-orange-200/20 rounded-full blur-2xl animate-float"></div>
              <div className="absolute bottom-10 left-10 w-32 h-32 bg-orange-300/20 rounded-full blur-2xl animate-float" style={{animationDelay: '3s'}}></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-orange-100/30 rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>
            </div>

            {/* Services Content */}
            <div className="relative z-10 w-full max-w-4xl mx-auto px-4 lg:px-8 text-center">
              {/* Section Header */}
              <div className="mb-6 lg:mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full mb-3 lg:mb-4 shadow-lg">
                  <span className="text-xl lg:text-2xl">🏠</span>
                </div>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
                  Discover our comprehensive range of professional services designed to make your life easier.
                </p>
              </div>
              
              {/* Service Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 lg:gap-4">
                {serviceCategories.map((category, index) => (
                  <div
                    key={category.name}
                    className="group relative"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Service Card */}
                    <div
                      className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-gray-100 hover:border-orange-200 overflow-hidden ${
                        expandedCategory === category.name ? 'ring-4 ring-orange-200 shadow-2xl scale-105' : ''
                      }`}
                      onClick={() =>
                        setExpandedCategory(
                          expandedCategory === category.name ? null : category.name
                        )
                      }
                    >
                      {/* Card Header */}
                      <div className="p-3 lg:p-4 text-center relative">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Icon */}
                        <div className="relative z-10 mb-2 lg:mb-3">
                          <div className="inline-flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg lg:rounded-xl group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-500">
                            <span className="text-lg lg:text-xl group-hover:scale-110 transition-transform duration-300">{category.icon}</span>
                          </div>
                        </div>
                        
                        {/* Title */}
                        <h3 className="relative z-10 text-sm lg:text-base font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300">
                          {category.name}
                        </h3>
                        
                        {/* Expand Button */}
                        <div className="relative z-10 flex items-center justify-center">
                          {expandedCategory === category.name ? (
                            <div className="flex items-center space-x-1 text-orange-600">
                              <span className="text-xs font-medium">View Less</span>
                              <ChevronUp className="w-3 h-3 animate-pulse" />
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-gray-500 group-hover:text-orange-500 transition-colors">
                              <span className="text-xs font-medium">View Services</span>
                              <ChevronDown className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Expanded Services */}
                      <div className={`overflow-hidden transition-all duration-500 ${
                        expandedCategory === category.name ? 'max-h-60 lg:max-h-80 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        <div className="px-3 lg:px-4 pb-3 lg:pb-4">
                          <div className="border-t border-gray-100 pt-2 lg:pt-3">
                            <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Available Services</h4>
                            <div className="grid grid-cols-1 gap-1">
                              {category.services.map((service, serviceIndex) => (
                                <div
                                  key={service}
                                  className="flex items-center space-x-2 p-1.5 lg:p-2 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer group/service"
                                  style={{ animationDelay: `${serviceIndex * 0.05}s` }}
                                >
                                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full group-hover/service:bg-orange-600 transition-colors"></div>
                                  <span className="text-xs text-gray-600 group-hover/service:text-orange-600 transition-colors font-medium">
                                    {service}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Service Categories Section */}
        <div className="relative w-full bg-gradient-to-b from-white via-orange-50/30 to-white py-20">
          <div className="max-w-7xl mx-auto px-6">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
                <span className="text-2xl">🏠</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Our <span className="text-orange-600">Services</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Discover our comprehensive range of professional services designed to make your life easier and your home more comfortable.
              </p>
            </div>
            
            {/* Service Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {serviceCategories.map((category, index) => (
                <div
                  key={category.name}
                  className="group relative"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Service Card */}
                  <div
                    className={`bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 cursor-pointer border border-gray-100 hover:border-orange-200 overflow-hidden ${
                      expandedCategory === category.name ? 'ring-4 ring-orange-200 shadow-2xl scale-105' : ''
                    }`}
                    onClick={() =>
                      setExpandedCategory(
                        expandedCategory === category.name ? null : category.name
                      )
                    }
                  >
                    {/* Card Header */}
                    <div className="p-8 text-center relative">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Icon */}
                      <div className="relative z-10 mb-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-500">
                          <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{category.icon}</span>
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h3 className="relative z-10 text-xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors duration-300">
                        {category.name}
                      </h3>
                      
                      {/* Expand Button */}
                      <div className="relative z-10 flex items-center justify-center">
                        {expandedCategory === category.name ? (
                          <div className="flex items-center space-x-2 text-orange-600">
                            <span className="text-sm font-medium">View Less</span>
                            <ChevronUp className="w-5 h-5 animate-pulse" />
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-gray-500 group-hover:text-orange-500 transition-colors">
                            <span className="text-sm font-medium">View Services</span>
                            <ChevronDown className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Expanded Services */}
                    <div className={`overflow-hidden transition-all duration-500 ${
                      expandedCategory === category.name ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="px-8 pb-8">
                        <div className="border-t border-gray-100 pt-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Available Services</h4>
                          <div className="grid grid-cols-1 gap-2">
                            {category.services.map((service, serviceIndex) => (
                              <div
                                key={service}
                                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-orange-50 transition-colors cursor-pointer group/service"
                                style={{ animationDelay: `${serviceIndex * 0.05}s` }}
                              >
                                <div className="w-2 h-2 bg-orange-400 rounded-full group-hover/service:bg-orange-600 transition-colors"></div>
                                <span className="text-sm text-gray-600 group-hover/service:text-orange-600 transition-colors font-medium">
                                  {service}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Gezana Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-orange-50/30 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-32 h-32 bg-orange-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-orange-300/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
              <span className="text-2xl">⭐</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-orange-600">Gezana?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Gezana Digital Solutions isn't just a platform — it's your trusted gateway to reliable, high-quality services tailored to your daily needs. We make booking easy, secure, and personalized, all in one seamless experience.
            </p>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Image */}
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-orange-300 rounded-3xl transform rotate-3"></div>
                <img
                  src="logo 3.png"
                  alt="Why Choose Gezana"
                  className="relative rounded-3xl shadow-2xl w-full h-auto object-cover transform -rotate-1 hover:rotate-0 transition-transform duration-500"
                />
              </div>
            </div>
            
            {/* Right Side - Features */}
            <div className="order-1 lg:order-2 space-y-8">
              <div className="group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300">
                        <ShoppingCart className="w-7 h-7 text-orange-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                        One-Stop Service Hub
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        Access a comprehensive range of services — from home repairs to professional help — all in one convenient platform. No more juggling multiple apps or websites.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300">
                        <ShieldCheck className="w-7 h-7 text-orange-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                        Secure & Seamless Booking
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        Enjoy hassle-free booking with real-time availability, secure online payments, and instant confirmations. Your peace of mind is our priority.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300">
                        <Users className="w-7 h-7 text-orange-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                        Trusted Service Providers
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        We partner only with verified, skilled, and experienced service professionals you can rely on. Every provider is background-checked and quality-assured.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-orange-100 max-w-3xl mx-auto">
              Join our growing community of satisfied customers and service providers
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">10K+</div>
              <div className="text-orange-100 font-medium">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">500+</div>
              <div className="text-orange-100 font-medium">Service Providers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">50+</div>
              <div className="text-orange-100 font-medium">Service Categories</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">99%</div>
              <div className="text-orange-100 font-medium">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
              <span className="text-2xl">💬</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What Our <span className="text-orange-600">Customers</span> Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it. Here's what real customers have to say about their Gezana experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="flex text-orange-400">
                  {'★'.repeat(5)}
                </div>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "Gezana made finding a reliable plumber so easy! The booking process was seamless and the service was excellent. Highly recommended!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mr-4">
                  <span className="text-orange-600 font-bold">SM</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah M.</div>
                  <div className="text-sm text-gray-500">Homeowner</div>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="flex text-orange-400">
                  {'★'.repeat(5)}
                </div>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "As a service provider, Gezana has helped me grow my business significantly. The platform is user-friendly and the support is outstanding."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mr-4">
                  <span className="text-orange-600 font-bold">MJ</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Mike Johnson</div>
                  <div className="text-sm text-gray-500">Electrician</div>
                </div>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="flex text-orange-400">
                  {'★'.repeat(5)}
                </div>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "The cleaning service I booked through Gezana exceeded my expectations. Professional, punctual, and thorough. Will definitely use again!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mr-4">
                  <span className="text-orange-600 font-bold">AL</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Alex Lee</div>
                  <div className="text-sm text-gray-500">Business Owner</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 via-white to-orange-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 bg-orange-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-orange-300/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Join thousands of satisfied customers and experience the convenience of professional services at your fingertips.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              Book a Service Now
            </button>
            <button className="border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105">
              Become a Provider
            </button>
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






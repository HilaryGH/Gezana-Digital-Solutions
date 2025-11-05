import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ServiceSearch from "./ServiceSearch";
import { ShieldCheck, ShoppingCart, Users, ChevronDown, X } from "lucide-react";
import { FaWrench, FaBroom, FaTools, FaBaby, FaHome, FaHotel } from "react-icons/fa";

const serviceCategories = [
  {
    name: "Home Maintenance",
    icon: FaWrench,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    hoverBg: "hover:bg-blue-100",
    services: ["Plumbing", "Electrical", "Carpentry", "General Repairs", "Door & Window Repair", "Furniture Assembly", "TV Mounting", "Roofing", "Flooring", "HVAC Services", "Handyman Services", "Lock Installation", "Shelf Installation", "Cabinet Installation", "Light Fixture Installation"],
    gradient: "from-blue-600 to-blue-700",
    shadow: "shadow-blue-500/50"
  },
  {
    name: "Cleaning Services",
    icon: FaBroom,
    iconColor: "text-green-600",
    bgColor: "bg-green-50",
    hoverBg: "hover:bg-green-100",
    services: ["Residential Cleaning", "Carpet Washing", "Pest Control", "Deep Cleaning", "Move-in/Move-out Cleaning", "Post-Construction Cleaning", "Window Cleaning", "Office Cleaning", "Upholstery Cleaning", "Appliance Cleaning", "Gutter Cleaning", "Pressure Washing", "Green Cleaning", "Sanitization Services", "Event Cleanup", "Regular Maintenance"],
    gradient: "from-green-600 to-green-700",
    shadow: "shadow-green-500/50"
  },
  {
    name: "Appliance Repair",
    icon: FaTools,
    iconColor: "text-purple-600",
    bgColor: "bg-purple-50",
    hoverBg: "hover:bg-purple-100",
    services: ["Refrigerator Repair", "AC Repair", "Washing Machine Repair", "Dryer Repair", "Dishwasher Repair", "Oven Repair", "Microwave Repair", "Water Heater Repair", "Garbage Disposal Repair", "Ice Maker Repair", "Stove Repair", "Freezer Repair", "Appliance Installation", "Appliance Maintenance", "Emergency Repair", "Warranty Service"],
    gradient: "from-purple-600 to-purple-700",
    shadow: "shadow-purple-500/50"
  },
  {
    name: "Personal Care",
    icon: FaBaby,
    iconColor: "text-pink-600",
    bgColor: "bg-pink-50",
    hoverBg: "hover:bg-pink-100",
    services: ["Babysitting", "Nanny Services", "Elderly Care", "Pet Care", "Personal Assistant", "Companion Care", "Special Needs Care", "Overnight Care", "Tutoring Services", "After School Care", "Weekend Care", "Holiday Care", "Travel Companion", "Medical Appointment Assistance", "Meal Preparation", "Medication Reminders"],
    gradient: "from-pink-600 to-pink-700",
    shadow: "shadow-pink-500/50"
  },
  {
    name: "Housemaid Services",
    icon: FaHome,
    iconColor: "text-orange-600",
    bgColor: "bg-orange-50",
    hoverBg: "hover:bg-orange-100",
    services: ["Regular Housekeeping", "Deep Cleaning", "Laundry Services", "Cooking Services", "Meal Preparation", "Grocery Shopping", "Organizing Services", "Window Cleaning", "Ironing Services", "Dishwashing", "Vacuuming", "Mopping", "Dusting", "Bathroom Cleaning", "Kitchen Cleaning", "Daily Maintenance"],
    gradient: "from-orange-600 to-orange-700",
    shadow: "shadow-orange-500/50"
  },
  {
    name: "Hotel/Lounge Services",
    icon: FaHotel,
    iconColor: "text-indigo-600",
    bgColor: "bg-indigo-50",
    hoverBg: "hover:bg-indigo-100",
    services: ["Room Service", "Concierge", "Housekeeping", "Event Planning", "Catering", "Spa Services", "Front Desk", "Guest Services", "Bartending", "Waitressing", "VIP Services", "Reception Services", "Security Services", "Valet Services", "Bell Services", "Guest Relations"],
    gradient: "from-indigo-600 to-indigo-700",
    shadow: "shadow-indigo-500/50"
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState<number | null>(null);
  const [showServicesModal, setShowServicesModal] = useState(false);

  // Handle search query from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, []);

  const handleCategoryClick = (index: number) => {
    setCurrentCategoryIndex(index);
    setShowServicesModal(true);
  };

  const handleViewServices = (categoryName: string) => {
    navigate(`/services?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <>
      <section className="w-full flex flex-col bg-gradient-to-br from-orange-50 via-white to-orange-100 pt-20">
        {/* Hero Section - Split Left and Right */}
        <div className="relative w-full min-h-screen flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left Side - Home Structure */}
          <div className="relative w-full lg:w-[58.33%] min-h-[65vh] md:min-h-[70vh] lg:h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center overflow-hidden py-8 md:py-10 lg:py-0">
            
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
             <div className="relative mx-auto w-[280px] sm:w-[340px] md:w-[400px] lg:w-[560px] h-[160px] sm:h-[190px] md:h-[220px] lg:h-[280px] flex flex-col items-center justify-end">

               {/* Roof - Outer orange border frame */}
               <div className="relative w-0 h-0 border-l-[140px] sm:border-l-[170px] md:border-l-[200px] lg:border-l-[280px] border-r-[140px] sm:border-r-[170px] md:border-r-[200px] lg:border-r-[280px] border-b-[45px] sm:border-b-[52px] md:border-b-[60px] lg:border-b-[80px] border-l-transparent border-r-transparent border-b-orange-600 drop-shadow-2xl">
                 {/* Roof - Inner white/transparent center */}
                 <div className="absolute top-[2px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[130px] sm:border-l-[158px] md:border-l-[186px] lg:border-l-[266px] border-r-[130px] sm:border-r-[158px] md:border-r-[186px] lg:border-r-[266px] border-b-[39px] sm:border-b-[46px] md:border-b-[54px] lg:border-b-[72px] border-l-transparent border-r-transparent border-b-white/95"></div>
               </div>
                  
               {/* Roof Overhang - White center with orange borders */}
               <div className="w-full h-[6px] sm:h-[7px] md:h-[8px] lg:h-[12px] bg-white/95 backdrop-blur-sm border-t-2 border-orange-600 border-b-2 border-orange-700 shadow-lg"></div>

              {/* Walls Section - Narrower than roof */}
              <div className="relative w-[220px] sm:w-[268px] md:w-[315px] lg:w-[440px] h-[90px] sm:h-[110px] md:h-[130px] lg:h-[170px] flex mx-auto">

                {/* Walls Frame - Single unified frame without partitions */}
                <div className="w-full bg-white/90 backdrop-blur-sm border-4 border-orange-600 shadow-xl rounded-lg"></div>
               </div>
                
               {/* Heading centered in walls */}
               <div className="absolute top-[70px] sm:top-[85px] md:top-[100px] lg:top-[130px] left-1/2 transform -translate-x-1/2 w-[220px] sm:w-[268px] md:w-[315px] lg:w-[440px] text-center px-3">
                 <h1 className="text-orange-700 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold drop-shadow-lg animate-text-glow leading-tight">
                    Your Home, Our Priority
                  </h1>
               </div>

               {/* Beautiful Buttons inside walls */}
               <div className="absolute top-[120px] sm:top-[145px] md:top-[170px] lg:top-[220px] left-1/2 transform -translate-x-1/2 w-[200px] sm:w-[245px] md:w-[290px] lg:w-[405px] px-2">
                 <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-3 w-full">
                   {/* Find Services Button */}
                   <div className="flex-1 flex justify-center">
                     <button className="group relative bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 px-3 sm:px-4 md:px-4 lg:px-5 py-1.5 sm:py-2 md:py-2.5 lg:py-3 rounded-full font-bold text-xs sm:text-sm md:text-sm lg:text-base shadow-md hover:shadow-lg transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 animate-button-bounce overflow-hidden w-full">
                       <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                       <span className="relative z-10 flex items-center justify-center whitespace-nowrap">
                      Find Services
                       </span>
                       <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-full"></div>
                    </button>
                   </div>

                   {/* Become a Provider Button */}
                   <div className="flex-1 flex justify-center">
                     <button className="group relative bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800 px-3 sm:px-4 md:px-4 lg:px-5 py-1.5 sm:py-2 md:py-2.5 lg:py-3 rounded-full font-bold text-xs sm:text-sm md:text-sm lg:text-base shadow-md hover:shadow-lg transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 animate-button-bounce overflow-hidden border-2 border-orange-500 w-full">
                       <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                       <span className="relative z-10 flex items-center justify-center whitespace-nowrap">
                      Become Provider
                       </span>
                       <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-full"></div>
                    </button>
                  </div>
                 </div>
               </div>

               {/* Foundation */}
               <div className="w-full h-[6px] sm:h-[7px] md:h-[9px] lg:h-[12px] bg-gradient-to-t from-orange-800 to-orange-700 shadow-lg"></div>
             </div>
          </div>

          {/* Right Side - Services Navigation */}
          <div className="relative w-full lg:w-[41.67%] min-h-[75vh] md:min-h-[80vh] lg:h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-white flex items-center justify-center overflow-hidden py-12 md:py-16 lg:py-0">
            
            {/* Animated Grid Background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: `linear-gradient(rgba(249, 115, 22, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.1) 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
              }}></div>
            </div>

            {/* Floating Orbs */}
            <div className="absolute inset-0">
              <div className="absolute top-20 right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl animate-float"></div>
              <div className="absolute bottom-20 left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
              <div className="absolute top-1/2 left-1/4 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
            </div>

            {/* Services Menu */}
            <div className="relative z-10 w-full h-full flex flex-col justify-center px-6 lg:px-8">
              {/* Header */}
              <div className="mb-5 text-center lg:text-left">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                  Our Services
                </h2>
                <p className="text-gray-600 text-xs lg:text-sm">
                  Choose a category to explore
                </p>
              </div>
              
              {/* Category Grid */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-6">
                {serviceCategories.map((category, index) => {
                  const IconComponent = category.icon;
                  return (
                    <div
                      key={category.name}
                      onClick={() => handleCategoryClick(index)}
                      className="group relative cursor-pointer transition-all duration-300 transform hover:scale-105"
                    >
                      {/* Category Card */}
                      <div className={`relative overflow-hidden rounded-lg p-3 sm:p-4 transition-all duration-300 border-2 border-gray-200 hover:border-blue-500 ${category.bgColor} ${category.hoverBg} shadow-md hover:shadow-xl`}>
                        {/* Icon */}
                        <div className="flex flex-col items-center justify-center text-center space-y-1.5">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center transition-all duration-300 ${category.bgColor} group-hover:scale-110`}>
                            <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${category.iconColor}`} />
                          </div>
                          <h3 className="font-bold text-[10px] sm:text-xs text-gray-800 group-hover:text-gray-900 transition-colors leading-tight">
                            {category.name}
                          </h3>
                          <p className="text-[9px] sm:text-[10px] text-gray-500">
                            {category.services.length} services
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* View All Services Button */}
              <div className="mt-3">
                <button
                  onClick={() => navigate('/services')}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2.5 px-5 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2 group text-sm"
                >
                  <span>View All Services</span>
                  <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Services Modal */}
        {showServicesModal && currentCategoryIndex !== null && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => {
            setShowServicesModal(false);
            setCurrentCategoryIndex(null);
          }}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className={`bg-gradient-to-r ${serviceCategories[currentCategoryIndex].gradient} p-6 flex items-center justify-between`}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    {(() => {
                      const IconComponent = serviceCategories[currentCategoryIndex].icon;
                      return <IconComponent className="w-6 h-6 text-white" />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{serviceCategories[currentCategoryIndex].name}</h2>
                    <p className="text-white/80 text-sm">{serviceCategories[currentCategoryIndex].services.length} services available</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowServicesModal(false);
                    setCurrentCategoryIndex(null);
                  }}
                  className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Services Grid */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {serviceCategories[currentCategoryIndex].services.map((service, index) => (
                    <div
                      key={index}
                      onClick={() => handleViewServices(service)}
                      className="p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 bg-gray-50 hover:bg-blue-50 cursor-pointer transition-all duration-300 transform hover:scale-105 group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                          <ChevronDown className="w-4 h-4 text-blue-600 rotate-[-90deg]" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
                          {service}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => handleViewServices(serviceCategories[currentCategoryIndex].name)}
                  className={`w-full bg-gradient-to-r ${serviceCategories[currentCategoryIndex].gradient} text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl`}
                >
                  View All {serviceCategories[currentCategoryIndex].name} Services
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Featured Services Section */}
        <div className="relative w-full bg-gradient-to-b from-white via-orange-50/30 to-white py-20">
          <div className="max-w-7xl mx-auto px-6">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
                <span className="text-2xl">⭐</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Featured <span className="text-orange-600">Services</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Discover top-rated services from verified providers in your area
              </p>
            </div>

            {/* Services Search and Display */}
            <ServiceSearch
              initialQuery={searchQuery}
              onServiceSelect={(service) => {
                console.log('Service selected:', service);
                // Navigate to service details page
                navigate(`/service/${service.id}`);
              }}
              showFilters={true}
              layout="grid"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-orange-50/30 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
              <span className="text-2xl">⚡</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              How It <span className="text-orange-600">Works</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get the services you need in just three simple steps. Our streamlined process makes booking professional services effortless.
            </p>
          </div>
          
          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-300">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">🔍</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Browse & Search</h3>
              <p className="text-gray-600 leading-relaxed">
                Explore our comprehensive range of services or use our smart search to find exactly what you need in your area.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-300">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">📅</span>
                        </div>
                      </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Book & Schedule</h3>
              <p className="text-gray-600 leading-relaxed">
                Choose your preferred provider, select a convenient time slot, and book instantly with secure online payment.
              </p>
                    </div>
                    
            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-300">
                  <span className="text-3xl font-bold text-white">3</span>
                              </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">✨</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Enjoy Service</h3>
              <p className="text-gray-600 leading-relaxed">
                Sit back and relax while our verified professionals deliver exceptional service right to your doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose HomeHub Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
              <span className="text-2xl">⭐</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-orange-600">HomeHub?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience the difference with our commitment to quality, convenience, and customer satisfaction.
            </p>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group text-center">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Verified Providers</h3>
                <p className="text-gray-600 leading-relaxed">
                  All our service providers are thoroughly vetted, background-checked, and quality-assured for your peace of mind.
                </p>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="group text-center">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShoppingCart className="w-8 h-8 text-white" />
                      </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Easy Booking</h3>
                      <p className="text-gray-600 leading-relaxed">
                  Book services in minutes with our intuitive platform. Real-time availability and instant confirmations.
                      </p>
                </div>
              </div>
              
            {/* Feature 3 */}
            <div className="group text-center">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">24/7 Support</h3>
                      <p className="text-gray-600 leading-relaxed">
                  Our dedicated support team is available around the clock to assist you with any questions or concerns.
                      </p>
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
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
              <span className="text-2xl">💬</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What Our <span className="text-orange-600">Customers</span> Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied customers who trust HomeHub for their service needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="group">
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                <div className="flex items-center mb-6">
                <div className="flex text-orange-400">
                  {'★'.repeat(5)}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">5.0</span>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                "HomeHub made finding a reliable plumber so easy! The booking process was seamless and the service was excellent. Highly recommended!"
              </p>
              <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mr-4">
                    <span className="text-orange-600 font-bold text-lg">SM</span>
                </div>
                <div>
                    <div className="font-semibold text-gray-900 text-lg">Sarah M.</div>
                  <div className="text-sm text-gray-500">Homeowner</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="group">
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                <div className="flex items-center mb-6">
                <div className="flex text-orange-400">
                  {'★'.repeat(5)}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">5.0</span>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                "As a service provider, HomeHub has helped me grow my business significantly. The platform is user-friendly and the support is outstanding."
              </p>
              <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mr-4">
                    <span className="text-orange-600 font-bold text-lg">MJ</span>
                </div>
                <div>
                    <div className="font-semibold text-gray-900 text-lg">Mike Johnson</div>
                  <div className="text-sm text-gray-500">Electrician</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="group">
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                <div className="flex items-center mb-6">
                <div className="flex text-orange-400">
                  {'★'.repeat(5)}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">5.0</span>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                "The cleaning service I booked through HomeHub exceeded my expectations. Professional, punctual, and thorough. Will definitely use again!"
              </p>
              <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mr-4">
                    <span className="text-orange-600 font-bold text-lg">AL</span>
                </div>
                <div>
                    <div className="font-semibold text-gray-900 text-lg">Alex Lee</div>
                  <div className="text-sm text-gray-500">Business Owner</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Experience the Difference?
          </h2>
          <p className="text-xl text-orange-100 mb-10 leading-relaxed">
            Join thousands of satisfied customers and service providers who trust HomeHub for their daily service needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="bg-white hover:bg-orange-50 text-orange-600 px-10 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              Book a Service Now
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-10 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105">
              Become a Provider
            </button>
          </div>
        </div>
      </section>

    </>
  );
};

export default Home;






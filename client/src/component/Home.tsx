import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ServiceSearch from "./ServiceSearch";
import { ShieldCheck, ShoppingCart, Users, ChevronDown } from "lucide-react";

const serviceCategories = [
  {
    name: "Home Maintenance",
    icon: "🔧",
    services: ["Plumbing", "Electrical", "Carpentry", "General Repairs", "Door & Window Repair", "Furniture Assembly", "TV Mounting", "Roofing", "Flooring", "HVAC Services", "Handyman Services", "Lock Installation", "Shelf Installation", "Cabinet Installation", "Light Fixture Installation"],
    gradient: "from-gray-600 via-gray-500 to-gray-400",
    shadow: "shadow-gray-500/50"
  },
  {
    name: "Cleaning Services",
    icon: "🧹",
    services: ["Residential Cleaning", "Carpet Washing", "Pest Control", "Deep Cleaning", "Move-in/Move-out Cleaning", "Post-Construction Cleaning", "Window Cleaning", "Office Cleaning", "Upholstery Cleaning", "Appliance Cleaning", "Gutter Cleaning", "Pressure Washing", "Green Cleaning", "Sanitization Services", "Event Cleanup", "Regular Maintenance"],
    gradient: "from-slate-600 via-slate-500 to-gray-500",
    shadow: "shadow-slate-500/50"
  },
  {
    name: "Appliance Repair",
    icon: "⚙️",
    services: ["Refrigerator Repair", "AC Repair", "Washing Machine Repair", "Dryer Repair", "Dishwasher Repair", "Oven Repair", "Microwave Repair", "Water Heater Repair", "Garbage Disposal Repair", "Ice Maker Repair", "Stove Repair", "Freezer Repair", "Appliance Installation", "Appliance Maintenance", "Emergency Repair", "Warranty Service"],
    gradient: "from-zinc-600 via-zinc-500 to-gray-500",
    shadow: "shadow-zinc-500/50"
  },
  {
    name: "Personal Care",
    icon: "💄",
    services: ["Haircut", "Hairstyle", "Facial", "Manicure & Pedicure", "Makeup Services", "Eyebrow Shaping", "Hair Coloring", "Spa Treatments", "Massage Therapy", "Beauty Consultation", "Hair Styling", "Nail Art", "Bridal Makeup", "Skincare Treatment", "Hair Treatment", "Beauty Therapy"],
    gradient: "from-gray-500 via-gray-400 to-gray-300",
    shadow: "shadow-gray-400/50"
  },
  {
    name: "Housemaid Services",
    icon: "👩‍💼",
    services: ["Daily Housekeeping", "Cooking Services", "Laundry Services", "Ironing Services", "Grocery Shopping", "Child Care Assistance", "Elderly Care", "Pet Care", "Meal Preparation", "Home Organization", "Personal Assistant", "Companion Care", "Special Needs Care", "Overnight Care", "Tutoring Services", "After School Care"],
    gradient: "from-slate-500 via-gray-400 to-zinc-400",
    shadow: "shadow-slate-400/50"
  },
  {
    name: "Hotel/Lounge Services",
    icon: "🏨",
    services: ["Room Service", "Concierge", "Housekeeping", "Event Planning", "Catering", "Spa Services", "Front Desk", "Guest Services", "Bartending", "Waitressing", "VIP Services", "Reception Services", "Security Services", "Valet Services", "Bell Services", "Guest Relations"],
    gradient: "from-zinc-500 via-slate-400 to-gray-400",
    shadow: "shadow-zinc-400/50"
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

  // Handle search query from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, []);

  // Auto-rotate service categories
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCategoryIndex((prev) => (prev + 1) % serviceCategories.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const handleCategoryChange = (index: number) => {
    setCurrentCategoryIndex(index);
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

          {/* Rain Effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Rain drops */}
            {[...Array(25)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 bg-gradient-to-b from-blue-300/40 via-blue-400/30 to-transparent"
                style={{
                  left: `${Math.random() * 100}%`,
                  height: `${20 + Math.random() * 30}px`,
                  animation: `rainFall ${2 + Math.random() * 3}s linear infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                  opacity: 0.6,
                }}
              ></div>
            ))}
          </div>
          
             {/* House Container */}
             <div className="relative mx-auto w-[380px] sm:w-[460px] md:w-[560px] lg:w-[800px] h-[220px] sm:h-[260px] md:h-[300px] lg:h-[400px] flex flex-col items-center justify-end">

               {/* Roof */}
               <div className="relative w-0 h-0 border-l-[190px] sm:border-l-[230px] md:border-l-[280px] lg:border-l-[400px] border-r-[190px] sm:border-r-[230px] md:border-r-[280px] lg:border-r-[400px] border-b-[60px] sm:border-b-[70px] md:border-b-[85px] lg:border-b-[115px] border-l-transparent border-r-transparent border-b-orange-700 drop-shadow-2xl"></div>
                  
               {/* Roof Overhang */}
               <div className="w-full h-[8px] sm:h-[9px] md:h-[12px] lg:h-[17px] bg-gradient-to-b from-orange-800 to-orange-700 shadow-lg"></div>

               {/* Walls Section - Narrower than roof */}
               <div className="relative w-[300px] sm:w-[365px] md:w-[435px] lg:w-[620px] h-[125px] sm:h-[150px] md:h-[175px] lg:h-[235px] flex mx-auto">

                 {/* Left Wall */}
                 <div className="flex-1 bg-gradient-to-t from-orange-500 to-orange-400 shadow-xl rounded-l-lg"></div>

                 {/* Center Wall */}
                 <div className="flex-[1.5] bg-gradient-to-t from-orange-500 to-orange-400 shadow-xl"></div>

                 {/* Right Wall */}
                 <div className="flex-1 bg-gradient-to-t from-orange-500 to-orange-400 shadow-xl rounded-r-lg"></div>
                </div>
                
               {/* Heading centered in walls */}
               <div className="absolute top-[100px] sm:top-[125px] md:top-[150px] lg:top-[220px] left-1/2 transform -translate-x-1/2 w-[300px] sm:w-[365px] md:w-[435px] lg:w-[620px] text-center px-3">
                 <h1 className="text-white text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold drop-shadow-lg animate-text-glow leading-tight">
                    Your Home, Our Priority
                  </h1>
               </div>

               {/* Beautiful Buttons inside walls */}
               <div className="absolute top-[175px] sm:top-[210px] md:top-[245px] lg:top-[330px] left-1/2 transform -translate-x-1/2 w-[275px] sm:w-[335px] md:w-[400px] lg:w-[565px] px-2">
                 <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-3 w-full">
                   {/* Find Services Button */}
                   <div className="flex-1 flex justify-center">
                     <button className="group relative bg-gradient-to-r from-white to-orange-50 text-orange-600 hover:from-orange-50 hover:to-white px-4 sm:px-5 md:px-5 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-3 rounded-full font-bold text-sm sm:text-base md:text-base lg:text-lg shadow-md hover:shadow-lg transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 animate-button-bounce overflow-hidden w-full">
                       <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                       <span className="relative z-10 flex items-center justify-center whitespace-nowrap">
                      Find Services
                       </span>
                       <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-full"></div>
                    </button>
                   </div>

                   {/* Become a Provider Button */}
                   <div className="flex-1 flex justify-center">
                     <button className="group relative bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800 px-4 sm:px-5 md:px-5 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-3 rounded-full font-bold text-sm sm:text-base md:text-base lg:text-lg shadow-md hover:shadow-lg transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 animate-button-bounce overflow-hidden border-2 border-orange-500 w-full">
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
               <div className="w-full h-[8px] sm:h-[10px] md:h-[13px] lg:h-[16px] bg-gradient-to-t from-orange-800 to-orange-700 shadow-lg"></div>
             </div>
          </div>

          {/* Right Side - Services Navigation */}
          <div className="relative w-full lg:w-[41.67%] min-h-[75vh] md:min-h-[80vh] lg:h-screen bg-black flex items-center justify-center overflow-hidden py-12 md:py-16 lg:py-0">
            
            {/* Animated Grid Background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
              }}></div>
            </div>

            {/* Floating Orbs */}
            <div className="absolute inset-0">
              <div className="absolute top-20 right-10 w-32 h-32 bg-gray-500/20 rounded-full blur-3xl animate-float"></div>
              <div className="absolute bottom-20 left-10 w-40 h-40 bg-slate-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
              <div className="absolute top-1/2 left-1/4 w-36 h-36 bg-zinc-500/15 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
            </div>

            {/* Services Menu */}
            <div className="relative z-10 w-full h-full flex flex-col justify-center px-6 lg:px-8">
              {/* Header */}
              <div className="mb-8 text-center lg:text-left">
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight">
                  Our Services
                </h2>
                <p className="text-zinc-400 text-sm lg:text-base">
                  Choose a category to explore
                </p>
              </div>
              
              {/* Category List */}
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar-dark">
                {serviceCategories.map((category, index) => (
                  <div
                    key={category.name}
                    onClick={() => handleCategoryChange(index)}
                    className={`group relative cursor-pointer transition-all duration-500 ${
                      currentCategoryIndex === index
                        ? 'scale-105'
                        : 'hover:scale-102'
                    }`}
                  >
                    {/* Category Card */}
                    <div className={`relative overflow-hidden rounded-xl transition-all duration-500 ${
                      currentCategoryIndex === index
                        ? `bg-gradient-to-r ${category.gradient} shadow-2xl ${category.shadow}`
                        : 'bg-zinc-900/80 hover:bg-zinc-800/80 backdrop-blur-sm border border-zinc-800 hover:border-zinc-700'
                    }`}>
                      {/* Shine Effect on Active */}
                      {currentCategoryIndex === index && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-slide"></div>
                      )}

                      <div className="relative p-4 flex items-center gap-4">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 ${
                          currentCategoryIndex === index
                            ? 'bg-white/20 backdrop-blur-sm'
                            : 'bg-zinc-800 group-hover:bg-zinc-700'
                        }`}>
                          <span className="text-2xl">{category.icon}</span>
                        </div>
                        
                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold text-sm lg:text-base transition-colors ${
                            currentCategoryIndex === index
                              ? 'text-white'
                              : 'text-zinc-300 group-hover:text-white'
                          }`}>
                          {category.name}
                        </h3>
                          <p className={`text-xs mt-0.5 transition-colors ${
                            currentCategoryIndex === index
                              ? 'text-white/80'
                              : 'text-zinc-500 group-hover:text-zinc-400'
                          }`}>
                            {category.services.length} services
                          </p>
                        </div>

                        {/* Arrow */}
                        <div className={`flex-shrink-0 transition-all duration-300 ${
                          currentCategoryIndex === index
                            ? 'text-white translate-x-1'
                            : 'text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-1'
                        }`}>
                          <ChevronDown className={`w-5 h-5 transition-transform ${
                            currentCategoryIndex === index ? '-rotate-90' : ''
                          }`} />
                        </div>
                      </div>
                      
                      {/* Expanded Services Preview */}
                      <div className={`overflow-hidden transition-all duration-500 ${
                        currentCategoryIndex === index ? 'max-h-48' : 'max-h-0'
                      }`}>
                        <div className="px-4 pb-4 pt-2 border-t border-white/10">
                            <div className="grid grid-cols-1 gap-1.5">
                            {category.services.slice(0, 5).map((service, i) => (
                                <div
                                  key={service}
                                className="text-xs text-white/90 py-1.5 px-2 bg-white/10 rounded hover:bg-white/20 transition-colors"
                                style={{
                                  animation: currentCategoryIndex === index ? `fadeInUp 0.4s ease-out ${i * 0.05}s both` : 'none'
                                }}
                              >
                                • {service}
                                </div>
                              ))}
                            {category.services.length > 5 && (
                              <div className="text-xs text-white/70 py-1 px-2">
                                +{category.services.length - 5} more services
                            </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Services Button */}
              <div className="mt-8">
                <button
                  onClick={() => navigate('/services')}
                  className="w-full bg-white hover:bg-gray-100 text-black font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-gray-500/30 flex items-center justify-center gap-2 group"
                >
                  <span>View All Services</span>
                  <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

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

      {/* Why Choose Gezana Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
              <span className="text-2xl">⭐</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-orange-600">Gezana?</span>
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
              Join thousands of satisfied customers who trust Gezana for their service needs.
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
                "Gezana made finding a reliable plumber so easy! The booking process was seamless and the service was excellent. Highly recommended!"
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
                "As a service provider, Gezana has helped me grow my business significantly. The platform is user-friendly and the support is outstanding."
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
                "The cleaning service I booked through Gezana exceeded my expectations. Professional, punctual, and thorough. Will definitely use again!"
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
            Join thousands of satisfied customers and service providers who trust Gezana for their daily service needs.
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






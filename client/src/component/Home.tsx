import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ServiceSearch from "./ServiceSearch";
import ServiceCard from "./ServiceCard";
import { ChevronDown, X, Star } from "lucide-react";
import { FaWrench, FaBroom, FaTools, FaBaby, FaHome, FaHotel } from "react-icons/fa";
import { getRecentServices, getMostBookedServices, getServices, type Service } from "../api/services";
import { getPromotionalBanners, type PromotionalBanner } from "../api/promotionalBanners";

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
  const [recentServices, setRecentServices] = useState<Service[]>([]);
  const [mostBookedServices, setMostBookedServices] = useState<Service[]>([]);
  const [promotionalBanners, setPromotionalBanners] = useState<PromotionalBanner[]>([]);
  const [categoryServices, setCategoryServices] = useState<Service[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [loadingMostBooked, setLoadingMostBooked] = useState(false);
  const [loadingBanners, setLoadingBanners] = useState(false);
  const [loadingCategoryServices, setLoadingCategoryServices] = useState(false);

  // Handle search query from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, []);

  // Fetch recently added services
  useEffect(() => {
    const fetchRecentServices = async () => {
      setLoadingRecent(true);
      try {
        const services = await getRecentServices(8);
        setRecentServices(services);
      } catch (error) {
        console.error('Error fetching recent services:', error);
      } finally {
        setLoadingRecent(false);
      }
    };
    fetchRecentServices();
  }, []);

  // Fetch most booked services
  useEffect(() => {
    const fetchMostBookedServices = async () => {
      setLoadingMostBooked(true);
      try {
        const services = await getMostBookedServices(8);
        console.log('Most booked services fetched:', services);
        setMostBookedServices(services || []);
      } catch (error: any) {
        console.error('Error fetching most booked services:', error);
        console.error('Error details:', error.response?.data || error.message);
        setMostBookedServices([]);
      } finally {
        setLoadingMostBooked(false);
      }
    };
    fetchMostBookedServices();
  }, []);

  // Fetch promotional banners
  useEffect(() => {
    const fetchPromotionalBanners = async () => {
      setLoadingBanners(true);
      try {
        const banners = await getPromotionalBanners();
        setPromotionalBanners(banners);
      } catch (error) {
        console.error('Error fetching promotional banners:', error);
      } finally {
        setLoadingBanners(false);
      }
    };
    fetchPromotionalBanners();
  }, []);

  const handleCategoryClick = async (index: number) => {
    setCurrentCategoryIndex(index);
    setShowServicesModal(true);
    
    // Fetch services for the selected category
    const categoryName = serviceCategories[index].name;
    setLoadingCategoryServices(true);
    try {
      const response = await getServices({ category: categoryName, limit: 50 });
      setCategoryServices(response.services || []);
    } catch (error) {
      console.error('Error fetching category services:', error);
      setCategoryServices([]);
    } finally {
      setLoadingCategoryServices(false);
    }
  };

  const handleViewServices = (categoryName: string) => {
    navigate(`/services?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <>
      <section className="w-full flex flex-col bg-gradient-to-b from-sky-500 via-sky-400 to-sky-300 pt-20 relative overflow-hidden">
        {/* Sky Clouds at the Top - Positioned below navbar */}
        <div className="absolute top-0 left-0 w-full h-96 z-0 pointer-events-none" style={{ overflow: 'visible' }}>
          {/* Cloud 1 - Left Side */}
          <div className="absolute animate-float" style={{ top: '100px', left: '40px', animationDelay: '0s', zIndex: 1 }}>
            <div className="relative" style={{ width: '140px', height: '80px' }}>
              <div className="absolute rounded-full bg-white" style={{ width: '50px', height: '50px', top: '0px', left: '0px', opacity: 0.85 }}></div>
              <div className="absolute rounded-full bg-white" style={{ width: '60px', height: '60px', top: '10px', left: '30px', opacity: 0.9 }}></div>
              <div className="absolute rounded-full bg-white" style={{ width: '45px', height: '45px', top: '15px', left: '70px', opacity: 0.87 }}></div>
            </div>
          </div>
          
          {/* Cloud 2 - Center Left */}
          <div className="absolute animate-float" style={{ top: '120px', left: '25%', animationDelay: '1s', zIndex: 1 }}>
            <div className="relative" style={{ width: '160px', height: '90px' }}>
              <div className="absolute rounded-full bg-white" style={{ width: '55px', height: '55px', top: '0px', left: '0px', opacity: 0.88 }}></div>
              <div className="absolute rounded-full bg-white" style={{ width: '70px', height: '70px', top: '15px', left: '35px', opacity: 0.92 }}></div>
              <div className="absolute rounded-full bg-white" style={{ width: '50px', height: '50px', top: '20px', left: '85px', opacity: 0.86 }}></div>
            </div>
          </div>
          
          {/* Cloud 5 - Right Side */}
          <div className="absolute animate-float" style={{ top: '115px', right: '40px', animationDelay: '2.5s', zIndex: 1 }}>
            <div className="relative" style={{ width: '155px', height: '88px' }}>
              <div className="absolute rounded-full bg-white" style={{ width: '54px', height: '54px', top: '0px', left: '0px', opacity: 0.88 }}></div>
              <div className="absolute rounded-full bg-white" style={{ width: '68px', height: '68px', top: '13px', left: '33px', opacity: 0.92 }}></div>
              <div className="absolute rounded-full bg-white" style={{ width: '49px', height: '49px', top: '19px', left: '82px', opacity: 0.86 }}></div>
            </div>
          </div>
          
          {/* Cloud 6 - Far Left */}
          <div className="absolute animate-float" style={{ top: '140px', left: '8%', animationDelay: '3s', zIndex: 1 }}>
            <div className="relative" style={{ width: '130px', height: '75px' }}>
              <div className="absolute rounded-full bg-white" style={{ width: '45px', height: '45px', top: '0px', left: '0px', opacity: 0.85 }}></div>
              <div className="absolute rounded-full bg-white" style={{ width: '58px', height: '58px', top: '8px', left: '28px', opacity: 0.89 }}></div>
              <div className="absolute rounded-full bg-white" style={{ width: '42px', height: '42px', top: '14px', left: '70px', opacity: 0.83 }}></div>
            </div>
          </div>
          
          {/* Cloud 7 - Far Right */}
          <div className="absolute animate-float" style={{ top: '125px', right: '8%', animationDelay: '0.5s', zIndex: 1 }}>
            <div className="relative" style={{ width: '135px', height: '78px' }}>
              <div className="absolute rounded-full bg-white" style={{ width: '47px', height: '47px', top: '0px', left: '0px', opacity: 0.87 }}></div>
              <div className="absolute rounded-full bg-white" style={{ width: '60px', height: '60px', top: '9px', left: '29px', opacity: 0.91 }}></div>
              <div className="absolute rounded-full bg-white" style={{ width: '44px', height: '44px', top: '15px', left: '72px', opacity: 0.85 }}></div>
            </div>
          </div>
        </div>
        
        {/* Hero Section - Split Left and Right */}
        <div className="relative w-full min-h-screen flex flex-col lg:flex-row overflow-hidden z-10">
          
          {/* Right Side - Home Structure (swapped from left) */}
          <div className="relative w-full lg:w-[58.33%] min-h-[45vh] md:min-h-[55vh] lg:h-screen bg-transparent flex items-center justify-center overflow-hidden pt-4 md:pt-5 lg:pt-0 pb-1 md:pb-2 lg:pb-0">
            
            {/* Decorative Background with Brand Colors */}
            <div className="absolute inset-0">
              <div className="absolute top-16 left-8 w-16 h-16 rounded-full blur-xl animate-float" style={{
                background: 'radial-gradient(circle, rgba(247, 147, 30, 0.15), rgba(247, 147, 30, 0.05))'
              }}></div>
              <div
                className="absolute top-32 right-16 w-24 h-24 rounded-full blur-xl animate-float"
                style={{ 
                  animationDelay: "2s",
                  background: 'radial-gradient(circle, rgba(46, 61, 211, 0.15), rgba(46, 61, 211, 0.05))'
                }}
              ></div>
              <div
                className="absolute bottom-32 left-16 w-20 h-20 rounded-full blur-xl animate-float"
                style={{ 
                  animationDelay: "4s",
                  background: 'radial-gradient(circle, rgba(0, 174, 239, 0.15), rgba(0, 174, 239, 0.05))'
                }}
              ></div>
              {/* Additional brand color accents */}
              <div
                className="absolute top-48 right-8 w-12 h-12 rounded-full blur-lg animate-float"
                style={{ 
                  animationDelay: "1s",
                  background: 'radial-gradient(circle, rgba(247, 147, 30, 0.12), transparent)'
                }}
              ></div>
              <div
                className="absolute bottom-48 right-32 w-14 h-14 rounded-full blur-lg animate-float"
                style={{ 
                  animationDelay: "3s",
                  background: 'radial-gradient(circle, rgba(46, 61, 211, 0.12), transparent)'
                }}
              ></div>
          </div>

             {/* House Container */}
             <div className="relative mx-auto w-[420px] sm:w-[480px] md:w-[520px] lg:w-[680px] h-[240px] sm:h-[260px] md:h-[280px] lg:h-[340px] flex flex-col items-center justify-end perspective-[1200px]">

               {/* Roof - Brand color gradient */}
              <div className="relative w-0 h-0 border-l-[240px] sm:border-l-[275px] md:border-l-[300px] lg:border-l-[380px] border-r-[240px] sm:border-r-[275px] md:border-r-[300px] lg:border-r-[380px] border-b-[80px] sm:border-b-[85px] md:border-b-[90px] lg:border-b-[110px] border-l-transparent border-r-transparent" style={{
                borderBottomColor: 'rgba(247, 147, 30, 0.85)'
              }}>
                {/* Brand color gradient overlay */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 pointer-events-none" style={{
                  width: '480px',
                  height: '80px',
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  background: 'linear-gradient(to bottom, rgba(247, 147, 30, 0.75) 0%, rgba(255, 180, 120, 0.7) 25%, rgba(255, 220, 180, 0.65) 40%, rgba(200, 220, 255, 0.7) 60%, rgba(46, 61, 211, 0.75) 75%, rgba(0, 174, 239, 0.7) 100%)',
                  transform: 'translateX(-50%)'
                }}></div>
              </div>
                  
               {/* Roof Overhang - Nude center with darker nude borders */}
               <div className="w-full h-[8px] sm:h-[9px] md:h-[10px] lg:h-[14px] bg-stone-100/95 backdrop-blur-sm border-t-2 border-stone-700 border-b-2 border-stone-700"></div>

              {/* Walls Section - Narrower than roof */}
              <div className="relative w-[320px] sm:w-[360px] md:w-[400px] lg:w-[520px] h-[150px] sm:h-[170px] md:h-[190px] lg:h-[240px] flex mx-auto">

                {/* Walls Frame - Single unified frame with brand colors */}
                <div className="w-full backdrop-blur-sm border-l-[6px] border-r-[6px] shadow-[0_30px_60px_rgba(46,61,211,0.25)] rounded-xl relative overflow-hidden" style={{
                  background: 'linear-gradient(to bottom, rgba(255, 245, 235, 0.95), rgba(255, 235, 220, 0.9), rgba(230, 240, 255, 0.95))',
                  borderLeftColor: 'rgba(46, 61, 211, 0.6)',
                  borderRightColor: 'rgba(247, 147, 30, 0.6)'
                }}>
                  <div className="absolute inset-0" style={{
                    background: 'linear-gradient(135deg, rgba(247, 147, 30, 0.15) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(46, 61, 211, 0.15) 100%)'
                  }}></div>
                  {/* Subtle brand color pattern overlay */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(247, 147, 30, 0.05) 10px, rgba(247, 147, 30, 0.05) 20px, transparent 20px, transparent 30px, rgba(46, 61, 211, 0.05) 30px, rgba(46, 61, 211, 0.05) 40px)'
                  }}></div>
                </div>
                <div className="absolute top-2 -right-14 w-14 h-[86%] border-l rounded-r-xl transform skew-y-6 origin-top shadow-[18px_22px_45px_rgba(46,61,211,0.3)]" style={{
                  background: 'linear-gradient(to bottom, rgba(247, 147, 30, 0.7), rgba(255, 200, 150, 0.8), rgba(46, 61, 211, 0.7))',
                  borderLeftColor: 'rgba(46, 61, 211, 0.4)'
                }}></div>
                <div className="absolute top-[16%] -right-24 w-16 h-[72%] border-l rounded-r-lg transform skew-y-6 origin-top blur-[1px] opacity-75" style={{
                  background: 'linear-gradient(to bottom, rgba(247, 147, 30, 0.5), rgba(255, 230, 200, 0.6), rgba(46, 61, 211, 0.5))',
                  borderLeftColor: 'rgba(46, 61, 211, 0.25)'
                }}></div>
               </div>
                
               {/* Heading centered in walls */}
               <div className="absolute top-[110px] sm:top-[118px] md:top-[130px] lg:top-[170px] left-1/2 transform -translate-x-1/2 w-[320px] sm:w-[360px] md:w-[400px] lg:w-[520px] text-center px-3">
                 <h1 className="text-blue-700 text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold drop-shadow-[0_12px_20px_rgba(0,0,0,0.25)] animate-text-glow leading-tight">
                    Home Services, Redefined & Delivered
                  </h1>
               </div>

              {/* Call-to-Action Button */}
               <div className="absolute top-[190px] sm:top-[205px] md:top-[220px] lg:top-[285px] left-1/2 transform -translate-x-1/2 w-[320px] sm:w-[360px] md:w-[400px] lg:w-[520px] px-4">
                <div className="flex justify-center">
                  <button 
                    onClick={() => navigate('/signup')}
                    className="group relative bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 px-3 sm:px-4 md:px-4 lg:px-5 py-1.5 sm:py-2 md:py-2.5 lg:py-3 rounded-full font-bold text-xs sm:text-sm md:text-sm lg:text-base shadow-md hover:shadow-lg transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 animate-button-bounce overflow-hidden border-2 border-blue-500 w-full max-w-[260px]">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                    <span className="relative z-10 flex items-center justify-center whitespace-nowrap">
                      Become a Provider
                    </span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-full"></div>
                  </button>
                </div>
               </div>

             </div>
          </div>

          {/* Left Side - Services Navigation (swapped from right) */}
          <div className="relative w-full lg:w-[41.67%] min-h-[45vh] md:min-h-[55vh] lg:h-screen bg-transparent flex items-center justify-center overflow-hidden pt-1 md:pt-2 lg:pt-0 pb-4 md:pb-5 lg:pb-0">
            
            {/* Animated Grid Background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: `linear-gradient(rgba(14, 165, 233, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.1) 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
              }}></div>
            </div>

            {/* Floating Orbs */}
            <div className="absolute inset-0">
              <div className="absolute top-20 right-10 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl animate-float"></div>
              <div className="absolute bottom-20 left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
              <div className="absolute top-1/2 left-1/4 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
            </div>

            {/* Services Menu */}
            <div className="relative z-10 w-full h-full flex flex-col items-center lg:items-start justify-center px-4 sm:px-5 lg:px-6">
              {/* Header */}
              <div className="mb-3 sm:mb-4 lg:mb-5 w-full text-center lg:text-left">
                <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-1.5 tracking-tight">
                  Our Services
                </h2>
                <p className="text-gray-600 text-[10px] sm:text-xs lg:text-sm">
                  Choose a category to explore
                </p>
              </div>
              
              {/* Category Grid */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 lg:gap-2.5 w-full max-w-full">
                {serviceCategories.map((category, index) => {
                  const IconComponent = category.icon;
                  return (
                    <div
                      key={category.name}
                      onClick={() => handleCategoryClick(index)}
                      className="group relative cursor-pointer transition-all duration-300 transform hover:scale-105"
                    >
                      {/* Category Card */}
                      <div className={`relative overflow-hidden rounded-lg p-1.5 sm:p-2 lg:p-2.5 xl:p-3 transition-all duration-300 border-2 border-gray-200 hover:border-blue-500 ${category.bgColor} ${category.hoverBg} shadow-md hover:shadow-xl h-full flex flex-col`}>
                        {/* Icon */}
                        <div className="flex flex-col items-center justify-center text-center space-y-1 sm:space-y-1.5 flex-1">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 xl:w-12 xl:h-12 rounded-lg flex items-center justify-center transition-all duration-300 ${category.bgColor} group-hover:scale-110`}>
                            <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-5 lg:h-5 xl:w-6 xl:h-6 ${category.iconColor}`} />
                          </div>
                          <h3 className="font-bold text-[7px] sm:text-[9px] lg:text-[10px] xl:text-xs text-gray-800 group-hover:text-gray-900 transition-colors leading-tight">
                            {category.name}
                          </h3>
                          <p className="text-[6px] sm:text-[7.5px] lg:text-[8px] xl:text-[9px] text-gray-500">
                            {category.services.length} services
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>

        {/* Services Modal */}
        {showServicesModal && currentCategoryIndex !== null && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => {
            setShowServicesModal(false);
            setCurrentCategoryIndex(null);
            setCategoryServices([]);
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
                    <p className="text-white/80 text-sm">
                      {loadingCategoryServices 
                        ? 'Loading...' 
                        : categoryServices.length > 0 
                          ? `${categoryServices.length} services available` 
                          : `${serviceCategories[currentCategoryIndex].services.length} service types available`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowServicesModal(false);
                    setCurrentCategoryIndex(null);
                    setCategoryServices([]);
                  }}
                  className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Services Grid */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {loadingCategoryServices ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, index) => (
                      <div key={index} className="p-4 rounded-xl border-2 border-gray-200 bg-gray-50 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : categoryServices.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {categoryServices.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => navigate(`/service/${service.id}`)}
                        className="p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 bg-gray-50 hover:bg-blue-50 cursor-pointer transition-all duration-300 transform hover:scale-105 group"
                      >
                        <div className="flex flex-col space-y-2">
                          <h4 className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                            {service.title}
                          </h4>
                          {service.subcategory && (
                            <p className="text-xs text-gray-600">{service.subcategory}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-blue-600">${service.price}</span>
                            {service.ratingCount && service.ratingCount > 0 && (
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-gray-600">
                                  {service.serviceRating?.toFixed(1) || service.providerRating.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
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
                )}
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

        {/* Recently Added Services Section */}
        <section className="relative w-full py-12 bg-gradient-to-br from-white via-orange-50/30 to-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            {/* Section Header */}
            <div className="text-left mb-8">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Recently Added <span className="text-orange-600">Services</span>
              </h2>
              <p className="text-sm md:text-base text-gray-600">
                Discover the latest services added to our platform
              </p>
            </div>

            {/* Services Grid - Custom styled cards with wider images */}
            {loadingRecent ? (
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="flex-shrink-0 w-[350px] bg-white rounded-2xl shadow-lg p-4 animate-pulse">
                    <div className="w-full h-64 bg-gray-200 rounded-xl mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentServices.length > 0 ? (
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {recentServices.map((service) => (
                  <div key={service.id} className="flex-shrink-0 w-[350px]">
                    <div 
                      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden group cursor-pointer w-full h-full flex flex-col"
                    >
                      {/* Image Section - Wider with overlays */}
                      {service.photos && service.photos.length > 0 ? (
                        <div className="relative w-full h-64 overflow-hidden">
                          <img
                            src={service.photos[0]}
                            alt={service.title || (service as any).name || 'Service'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                          
                          {/* New Badge */}
                          <div className="absolute top-3 left-3 z-20">
                            <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                              New
                            </span>
                          </div>

                          {/* Discover More Button Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/service/${service.id}`);
                              }}
                              className="bg-white/95 backdrop-blur-sm text-orange-600 px-6 py-3 rounded-full font-bold text-base shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 transform"
                            >
                              Discover More
                            </button>
                          </div>

                          {/* Title and Price Overlay at Bottom */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                            <h3 className="text-white font-bold text-lg mb-1 drop-shadow-lg line-clamp-2">
                              {service.title || (service as any).name}
                            </h3>
                            <div className="flex items-center justify-between">
                              <span className="text-white text-sm font-semibold drop-shadow-lg">
                                {service.category || 'Service'}
                              </span>
                              <span className="text-white font-bold text-lg drop-shadow-lg">
                                {service.price ? `${service.price} ETB` : 'Contact for price'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-64 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center relative">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-orange-300 rounded-full flex items-center justify-center mx-auto mb-2">
                              <span className="text-xl">🔧</span>
                            </div>
                            <p className="text-gray-600 text-xs">No image</p>
                          </div>
                          {/* New Badge */}
                          <div className="absolute top-3 left-3">
                            <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                              New
                            </span>
                          </div>
                          {/* Discover More Button */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/service/${service.id}`);
                              }}
                              className="bg-white/95 backdrop-blur-sm text-orange-600 px-6 py-3 rounded-full font-bold text-base shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 transform"
                            >
                              Discover More
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Content Section Below Image */}
                      <div className="p-4 space-y-2">
                        {/* Rating */}
                        {service.serviceRating !== null && service.serviceRating !== undefined && (
                          <div className="flex items-center space-x-1">
                            <Star size={14} className="text-yellow-400 fill-current" />
                            <span className="text-sm font-semibold text-gray-700">
                              {service.serviceRating.toFixed(1)}
                            </span>
                            {service.ratingCount !== undefined && service.ratingCount > 0 && (
                              <span className="text-xs text-gray-500">
                                ({service.ratingCount} {service.ratingCount === 1 ? 'rating' : 'ratings'})
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Location if available */}
                        {service.location && (
                          <div className="flex items-center space-x-1 text-gray-600 text-sm">
                            <span>📍</span>
                            <span className="truncate">{service.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-left py-8">
                <p className="text-gray-500 text-sm">No recent services available</p>
              </div>
            )}
          </div>
        </section>

        {/* Most Booked Services Section */}
        <section className="relative w-full py-12 bg-gradient-to-br from-orange-50/30 via-white to-blue-50/30 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            {/* Section Header */}
            <div className="text-left mb-8">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Most Booked <span className="text-blue-600">Services</span>
              </h2>
              <p className="text-sm md:text-base text-gray-600">
                Popular choices trusted by our community
              </p>
            </div>

            {/* Services Grid - 4 columns, horizontally scrollable */}
            {loadingMostBooked ? (
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="flex-shrink-0 w-[280px] bg-white rounded-2xl shadow-lg p-4 animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : mostBookedServices.length > 0 ? (
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {mostBookedServices.map((service) => (
                  <div key={service.id} className="flex-shrink-0 w-[280px]">
                    <ServiceCard
                      service={service}
                      onViewDetails={() => navigate(`/service/${service.id}`)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-left py-8">
                <p className="text-gray-500 text-sm">No booked services available. Services will appear here once bookings are made.</p>
              </div>
            )}
          </div>
        </section>

        {/* Seasonal / Promotional Banners Section */}
        <section className="relative w-full py-12 bg-gradient-to-br from-white via-orange-50/50 to-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            {/* Section Header */}
            <div className="text-left mb-8">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Special <span className="text-orange-600">Offers</span>
              </h2>
              <p className="text-sm md:text-base text-gray-600">
                Limited-time promotions and seasonal discounts
              </p>
            </div>

            {/* Promotional Banners Grid */}
            {loadingBanners ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="bg-gray-200 rounded-3xl h-64 animate-pulse"></div>
                ))}
              </div>
            ) : promotionalBanners.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {promotionalBanners.map((banner) => {
                  // Parse gradient classes from backgroundColor
                  const gradientClasses = banner.backgroundColor || "from-blue-500 via-blue-600 to-blue-700";
                  const textColorClass = banner.textColor || "text-white";
                  
                  return (
                    <div
                      key={banner.id}
                      onClick={() => navigate(banner.buttonLink || "/services")}
                      className="relative overflow-hidden rounded-3xl shadow-2xl group cursor-pointer transform transition-all duration-300 hover:scale-105"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClasses}`}></div>
                      <div className={`relative p-8 md:p-12 ${textColorClass}`}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-2xl">{banner.icon || "✨"}</span>
                          </div>
                          <h3 className="text-3xl md:text-4xl font-bold">{banner.title}</h3>
                        </div>
                        {banner.subtitle && (
                          <p className={`text-xl md:text-2xl mb-6 ${textColorClass} opacity-90`}>
                            {banner.subtitle}
                          </p>
                        )}
                        {banner.description && (
                          <p className={`text-base md:text-lg mb-6 ${textColorClass} opacity-80`}>
                            {banner.description}
                          </p>
                        )}
                        <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full font-semibold text-lg group-hover:bg-white/30 transition-all">
                          {banner.buttonText || "Learn More"} →
                        </div>
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-left py-8">
                <p className="text-gray-500 text-sm">No promotional offers available at the moment</p>
              </div>
            )}
          </div>
        </section>

        {/* Featured Services Section */}
        <div className="relative w-full bg-gradient-to-b from-white via-orange-50/30 to-white py-12">
          <div className="max-w-7xl mx-auto px-6">
            {/* Section Header */}
            <div className="text-left mb-8">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Featured <span className="text-orange-600">Services</span>
              </h2>
              <p className="text-sm md:text-base text-gray-600">
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






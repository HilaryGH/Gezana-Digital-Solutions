import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, DollarSign, Clock, Calendar, 
  Phone, Mail, Shield, Award, CheckCircle, 
  ArrowLeft, Heart, Share2, AlertCircle
} from 'lucide-react';
import { getServiceById, type Service } from '../api/services';
import BookingModal from './BookingModal';

const ServiceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getServiceById(id);
        setService(data);
        setError('');
      } catch (err: any) {
        console.error('Error fetching service details:', err);
        setError(err.response?.data?.message || 'Failed to load service details');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [id]);

  const formatPrice = (price: number, priceType: string) => {
    const formattedPrice = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);

    switch (priceType) {
      case 'hourly':
        return `${formattedPrice} ETB/hour`;
      case 'per_sqft':
        return `${formattedPrice} ETB/sq ft`;
      case 'custom':
        return `From ${formattedPrice} ETB`;
      default:
        return `${formattedPrice} ETB`;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-yellow-600';
    if (rating >= 3.0) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The service you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/services')}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Browse All Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Services</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {service.photos && service.photos.length > 0 ? (
                <div>
                  {/* Main Image */}
                  <div className="relative aspect-video">
                    <img
                      src={service.photos[selectedImage]}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Image Navigation */}
                    {service.photos.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImage((prev) => (prev === 0 ? service.photos!.length - 1 : prev - 1))}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                        >
                          ‹
                        </button>
                        <button
                          onClick={() => setSelectedImage((prev) => (prev === service.photos!.length - 1 ? 0 : prev + 1))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                        >
                          ›
                        </button>
                      </>
                    )}

                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button
                        onClick={() => setIsFavorite(!isFavorite)}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                      >
                        <Heart size={20} className={isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'} />
                      </button>
                      <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                        <Share2 size={20} className="text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Gallery */}
                  {service.photos.length > 1 && (
                    <div className="p-4 flex space-x-2 overflow-x-auto">
                      {service.photos.map((photo, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImage === index ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          <img src={photo} alt={`${service.title} - ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-orange-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl">🔧</span>
                    </div>
                    <p className="text-gray-600">No images available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Service Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
              {/* Title and Category */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                    {service.category}
                  </span>
                  {service.subcategory && (
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {service.subcategory}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {service.title}
                </h1>
                
                {/* Location and Availability */}
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin size={16} />
                    <span>{service.location || 'Location not specified'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${service.isAvailable !== false ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={`text-sm font-medium ${service.isAvailable !== false ? 'text-green-600' : 'text-red-600'}`}>
                      {service.isAvailable !== false ? 'Available Now' : 'Currently Unavailable'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">About This Service</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {service.description || 'No description available for this service.'}
                </p>
              </div>

              {/* Service Features */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">What's Included</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start space-x-2">
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Professional Service</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Quality Guaranteed</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Verified Provider</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Customer Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Pricing Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <div>
                  <div className="flex items-baseline space-x-2 mb-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(service.price, service.priceType)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {service.priceType === 'hourly' ? 'Per hour rate' : 
                     service.priceType === 'per_sqft' ? 'Per square foot' : 
                     service.priceType === 'custom' ? 'Starting price' : 
                     'Fixed price'}
                  </p>
                </div>

                <button
                  onClick={() => setShowBookingModal(true)}
                  disabled={service.isAvailable === false}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  <Calendar size={20} />
                  <span>{service.isAvailable === false ? 'Currently Unavailable' : 'Book This Service'}</span>
                </button>

                {/* Trust Badges */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Shield className="text-green-500" size={20} />
                    <span className="text-sm">Verified & Trusted Provider</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Award className="text-orange-500" size={20} />
                    <span className="text-sm">Quality Guaranteed</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <CheckCircle className="text-blue-500" size={20} />
                    <span className="text-sm">Secure Booking</span>
                  </div>
                </div>
              </div>

              {/* Provider Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Service Provider</h3>
                
                <div className="flex items-start space-x-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-2xl font-bold">
                      {(service.providerName || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{service.providerName}</h4>
                    <div className="flex items-center space-x-1 mt-1">
                      <Star size={16} className={`${getRatingColor(service.providerRating)} fill-current`} />
                      <span className={`text-sm font-semibold ${getRatingColor(service.providerRating)}`}>
                        {service.providerRating.toFixed(1)}
                      </span>
                      <span className="text-gray-500 text-sm">(Verified)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone size={16} />
                    <span className="text-sm">Contact on booking</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail size={16} />
                    <span className="text-sm">Email support available</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock size={16} />
                    <span className="text-sm">Joined {service.createdAt ? new Date(service.createdAt).toLocaleDateString() : 'Recently'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        service={service}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onBookingSuccess={(booking) => {
          console.log('Booking successful:', booking);
          setShowBookingModal(false);
        }}
      />
    </div>
  );
};

export default ServiceDetails;


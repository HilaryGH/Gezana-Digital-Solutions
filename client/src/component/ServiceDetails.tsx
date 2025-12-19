import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Star, MapPin, DollarSign, Clock, Calendar, 
  Phone, Mail, Shield, Award, CheckCircle, 
  ArrowLeft, Heart, Share2, AlertCircle, Tag, FileText, ExternalLink
} from 'lucide-react';
import { getServiceById, type Service } from '../api/services';
import BookingModal from './BookingModal';
import Reviews from './Reviews';
import { normalizeImageUrl, handleImageError } from '../utils/imageHelper';
import axios from '../api/axios';

interface SpecialOffer {
  _id: string;
  title: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const ServiceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [specialOffer, setSpecialOffer] = useState<SpecialOffer | null>(null);
  const [isProviderOnDuty, setIsProviderOnDuty] = useState<boolean | null>(null);
  const [providerInfo, setProviderInfo] = useState<{ email: string | null; phone: string | null } | null>(null);
  const [providerRating, setProviderRating] = useState<number | null>(null);
  const [isPremiumIndividualSeeker, setIsPremiumIndividualSeeker] = useState<boolean>(false);

  useEffect(() => {
    // Check if special offer data was passed via navigation state
    if (location.state?.specialOffer) {
      setSpecialOffer(location.state.specialOffer);
    }
  }, [location.state]);

  useEffect(() => {
    // Check if user is premium individual seeker
    const checkPremiumStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Get current user info
        const userResponse = await axios.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = userResponse.data;
        const isIndividualSeeker = user.role === "seeker" && user.seekerType === "individual";

        if (isIndividualSeeker) {
          // Check for premium membership
          try {
            const premiumResponse = await axios.get("/premium-memberships/my-memberships", {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (premiumResponse.data.memberships && premiumResponse.data.memberships.length > 0) {
              // Get the most recent membership
              const membership = premiumResponse.data.memberships[0];
              const isPaid = membership.paymentStatus === "paid";
              const isActive = membership.status === "active" || membership.status === "pending";
              const notExpired = !membership.endDate || new Date(membership.endDate) > new Date();

              if (isPaid && isActive && notExpired) {
                setIsPremiumIndividualSeeker(true);
                return;
              }
            }
          } catch (err) {
            // Premium membership check failed, try subscription
          }

          // Check for subscription
          try {
            const subscriptionResponse = await axios.get("/subscriptions/my-subscription", {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (subscriptionResponse.data.hasSubscription && subscriptionResponse.data.subscription) {
              const subscription = subscriptionResponse.data.subscription;
              const isActive = subscription.status === "active" || subscription.status === "trial";
              const notExpired = subscription.endDate && new Date(subscription.endDate) > new Date();
              const isForSeeker = subscription.plan?.applicableTo === "seeker" || subscription.plan?.applicableTo === "both";

              if (isActive && notExpired && isForSeeker) {
                setIsPremiumIndividualSeeker(true);
              }
            }
          } catch (err) {
            // Subscription check failed
          }
        }
      } catch (error) {
        console.error("Error checking premium status:", error);
      }
    };

    checkPremiumStatus();
  }, []);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getServiceById(id);
        setService(data);
        setError('');
        
        // Fetch provider duty status, info, and rating
        if (data.providerId) {
          try {
            const dutyResponse = await axios.get(`/provider/duty-status/${data.providerId}`);
            setIsProviderOnDuty(dutyResponse.data.isOnDuty || false);
          } catch (dutyError) {
            console.error('Error fetching provider duty status:', dutyError);
            setIsProviderOnDuty(null);
          }

          // Fetch provider public info (email, phone)
          try {
            const providerInfoResponse = await axios.get(`/provider/public-info/${data.providerId}`);
            setProviderInfo({
              email: providerInfoResponse.data.email,
              phone: providerInfoResponse.data.phone
            });
          } catch (infoError) {
            console.error('Error fetching provider info:', infoError);
            setProviderInfo(null);
          }

          // Fetch provider rating from reviews
          try {
            // Get all services for this provider to calculate average rating
            const servicesResponse = await axios.get(`/services/provider/${data.providerId}`);
            const providerServices = servicesResponse.data || [];
            
            if (providerServices.length > 0) {
              const serviceIds = providerServices.map((s: any) => s._id || s.id).filter(Boolean);
              
              if (serviceIds.length > 0) {
                // Fetch review statistics for each service
                const reviewStatsPromises = serviceIds.map(async (serviceId: string) => {
                  try {
                    const response = await axios.get(`/reviews/service/${serviceId}`, {
                      params: { page: 1, limit: 1 }
                    });
                    return {
                      averageRating: parseFloat(response.data.averageRating) || 0,
                      totalReviews: response.data.totalReviews || 0
                    };
                  } catch (error) {
                    return { averageRating: 0, totalReviews: 0 };
                  }
                });
                
                const reviewStats = await Promise.all(reviewStatsPromises);
                
                // Calculate weighted average rating
                let totalWeightedRating = 0;
                let totalReviewCount = 0;
                
                reviewStats.forEach((stats) => {
                  if (stats.totalReviews > 0) {
                    totalWeightedRating += stats.averageRating * stats.totalReviews;
                    totalReviewCount += stats.totalReviews;
                  }
                });
                
                if (totalReviewCount > 0) {
                  setProviderRating(totalWeightedRating / totalReviewCount);
                } else {
                  setProviderRating(0);
                }
              } else {
                setProviderRating(0);
              }
            } else {
              setProviderRating(0);
            }
          } catch (ratingError) {
            console.error('Error fetching provider rating:', ratingError);
            setProviderRating(null);
          }
        }
      } catch (err: any) {
        console.error('Error fetching service details:', err);
        if (err.response?.status === 404) {
          setError('This service is no longer available. It may have been removed by the provider.');
        } else {
          setError(err.response?.data?.message || 'Failed to load service details');
        }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Not Available</h2>
          <p className="text-gray-600 mb-6">
            {error || 'The service you are looking for does not exist or has been removed.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Go to Home
            </button>
            <button
              onClick={() => navigate('/services')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Browse All Services
            </button>
          </div>
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
                  <div className="relative aspect-video bg-gray-100">
                    {service.photos && service.photos[selectedImage] ? (
                      <img
                        src={normalizeImageUrl(service.photos[selectedImage], {
                          width: 1200,
                          height: 675,
                          crop: 'fill',
                          quality: 'auto',
                          format: 'auto'
                        }) || service.photos[selectedImage] || ''}
                        alt={service.title}
                        className="w-full h-full object-cover"
                        loading="eager"
                        decoding="async"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const currentSrc = target.src;
                          console.error('❌ Main image failed to load:', currentSrc);
                          console.error('Original photo URL:', service.photos[selectedImage]);
                          
                          // Try original URL without transformations first
                          if (service.photos && service.photos[selectedImage]) {
                            const originalUrl = service.photos[selectedImage];
                            if (currentSrc !== originalUrl && !target.dataset.retried) {
                              target.dataset.retried = 'true';
                              console.log('🔄 Retrying with original URL:', originalUrl);
                              target.src = originalUrl;
                              return;
                            }
                          }
                          
                          // Try with getCardImageUrl as fallback
                          const { getCardImageUrl } = require('../utils/imageHelper');
                          const cardUrl = getCardImageUrl(service.photos[selectedImage]);
                          if (cardUrl && currentSrc !== cardUrl && !target.dataset.cardRetried) {
                            target.dataset.cardRetried = 'true';
                            console.log('🔄 Retrying with card image URL:', cardUrl);
                            target.src = cardUrl;
                            return;
                          }
                          
                          // Try getFullImageUrl
                          const { getFullImageUrl } = require('../utils/imageHelper');
                          const fullUrl = getFullImageUrl(service.photos[selectedImage]);
                          if (fullUrl && currentSrc !== fullUrl && !target.dataset.fullRetried) {
                            target.dataset.fullRetried = 'true';
                            console.log('🔄 Retrying with full image URL:', fullUrl);
                            target.src = fullUrl;
                            return;
                          }
                          
                          // Final fallback
                          console.log('⚠️  All retry attempts failed, using fallback image');
                          handleImageError(e);
                        }}
                        onLoad={() => {
                          console.log('✅ Main image loaded successfully');
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-24 h-24 bg-orange-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl">🔧</span>
                          </div>
                          <p className="text-gray-600">No image available</p>
                        </div>
                      </div>
                    )}
                    
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
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all bg-gray-100 ${
                            selectedImage === index ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          <img 
                            src={normalizeImageUrl(photo, {
                              width: 200,
                              height: 200,
                              crop: 'fill',
                              quality: 'auto',
                              format: 'auto'
                            }) || photo || ''} 
                            alt={`${service.title} - ${index + 1}`} 
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.currentTarget;
                              const currentSrc = target.src;
                              console.error('Thumbnail image failed to load:', currentSrc);
                              
                              // Try original URL
                              if (currentSrc !== photo && !target.dataset.retried) {
                                target.dataset.retried = 'true';
                                console.log('Retrying thumbnail with original URL:', photo);
                                target.src = photo;
                                return;
                              }
                              
                              // Try with getThumbnailUrl
                              const { getThumbnailUrl } = require('../utils/imageHelper');
                              const thumbUrl = getThumbnailUrl(photo);
                              if (thumbUrl && currentSrc !== thumbUrl && !target.dataset.thumbRetried) {
                                target.dataset.thumbRetried = 'true';
                                console.log('Retrying thumbnail with getThumbnailUrl:', thumbUrl);
                                target.src = thumbUrl;
                                return;
                              }
                              
                              // Final fallback
                              handleImageError(e);
                            }}
                            onLoad={() => {
                              // Image loaded successfully
                            }}
                          />
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
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    {service.title}
                  </h1>
                  {/* Service Rating from Reviews */}
                  {service.serviceRating !== null && service.serviceRating !== undefined ? (
                    <div className="flex items-center space-x-1 ml-4">
                      <Star size={24} className={`${getRatingColor(service.serviceRating)} fill-current`} />
                      <span className={`text-2xl font-bold ${getRatingColor(service.serviceRating)}`}>
                        {service.serviceRating.toFixed(1)}
                      </span>
                      {service.ratingCount !== undefined && service.ratingCount > 0 && (
                        <span className="text-sm text-gray-500 ml-1">
                          ({service.ratingCount} {service.ratingCount === 1 ? 'rating' : 'ratings'})
                        </span>
                      )}
                    </div>
                  ) : null}
                </div>
                
                {/* Location and Availability */}
                <div className="flex items-center space-x-4 text-gray-600 flex-wrap gap-2">
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
                  {/* Provider Duty Status */}
                  {isProviderOnDuty !== null && (
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${isProviderOnDuty ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`} />
                      <span className={`text-sm font-medium ${isProviderOnDuty ? 'text-blue-600' : 'text-gray-600'}`}>
                        {isProviderOnDuty ? 'On Duty' : 'Off Duty'}
                      </span>
                    </div>
                  )}
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

            {/* Reviews Section */}
            <Reviews serviceId={id || ''} />
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Pricing Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                {specialOffer && (
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-semibold text-orange-800">Special Offer Active!</span>
                    </div>
                    <p className="text-xs text-orange-700 mb-2">{specialOffer.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                        {specialOffer.discountType === 'percentage'
                          ? `${specialOffer.discountValue}% OFF`
                          : `${specialOffer.discountValue} ETB OFF`}
                      </span>
                      <span className="text-xs text-gray-500">
                        Valid until {new Date(specialOffer.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
                <div>
                  <div className="flex items-baseline space-x-2 mb-2">
                    {specialOffer ? (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-4xl font-bold text-orange-600">
                            {formatPrice(specialOffer.discountedPrice, service.priceType)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg text-gray-400 line-through">
                            {formatPrice(service.price, service.priceType)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-4xl font-bold text-gray-900">
                        {formatPrice(service.price, service.priceType)}
                      </span>
                    )}
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
                      {providerRating !== null ? (
                        <>
                          <Star size={16} className={`${getRatingColor(providerRating)} fill-current`} />
                          <span className={`text-sm font-semibold ${getRatingColor(providerRating)}`}>
                            {providerRating.toFixed(1)}
                          </span>
                        </>
                      ) : (
                        <>
                          <Star size={16} className={`${getRatingColor(service.providerRating || 0)} fill-current`} />
                          <span className={`text-sm font-semibold ${getRatingColor(service.providerRating || 0)}`}>
                            {(service.providerRating || 0).toFixed(1)}
                          </span>
                        </>
                      )}
                      <span className="text-gray-500 text-sm">(Verified)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-2">
                  {providerInfo?.phone ? (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone size={16} />
                      <a href={`tel:${providerInfo.phone}`} className="text-sm hover:text-orange-600 transition-colors">
                        {providerInfo.phone}
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Phone size={16} />
                      <span className="text-sm">Contact on booking</span>
                    </div>
                  )}
                  {providerInfo?.email ? (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail size={16} />
                      <a href={`mailto:${providerInfo.email}`} className="text-sm hover:text-orange-600 transition-colors break-all">
                        {providerInfo.email}
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Mail size={16} />
                      <span className="text-sm">Email support available</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock size={16} />
                    <span className="text-sm">Joined {service.createdAt ? new Date(service.createdAt).toLocaleDateString() : 'Recently'}</span>
                  </div>
                </div>

                {/* View Provider Details Button for Premium Individual Seekers */}
                {isPremiumIndividualSeeker && service.providerId && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/provider/${service.providerId}/details`)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-lg hover:from-brand-secondary hover:to-brand-primary transition-all font-medium"
                    >
                      <FileText size={18} />
                      <span>View Provider Details</span>
                      <ExternalLink size={16} />
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Premium members can view provider documents and detailed information
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        service={service}
        specialOffer={specialOffer}
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


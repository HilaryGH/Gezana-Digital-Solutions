import React, { useState } from 'react';
import { Star, MapPin, Clock, DollarSign, Eye, Heart, Calendar } from 'lucide-react';
import { type Service } from '../api/services';
import BookingModal from './BookingModal';

interface ServiceCardProps {
  service: Service;
  onViewDetails?: (service: Service) => void;
  onBookService?: (service: Service) => void;
  onToggleFavorite?: (service: Service) => void;
  isFavorite?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onViewDetails,
  onBookService,
  onToggleFavorite,
  isFavorite = false,
  variant = 'default'
}) => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const formatPrice = (price: number, priceType: string) => {
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);

    switch (priceType) {
      case 'hourly':
        return `${formattedPrice}/hour`;
      case 'per_sqft':
        return `${formattedPrice}/sq ft`;
      case 'custom':
        return `From ${formattedPrice}`;
      default:
        return formattedPrice;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-yellow-600';
    if (rating >= 3.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'p-3';
      case 'detailed':
        return 'p-6';
      default:
        return 'p-4';
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden group ${getVariantClasses()}`}>
      {/* Image Section */}
      <div className="relative mb-4 overflow-hidden rounded-xl">
        {service.photos && service.photos.length > 0 ? (
          <div className="relative">
            <img
              src={service.photos[0]}
              alt={service.title || (service as any).name || 'Service'}
              className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            
            {/* Favorite Button */}
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(service)}
                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
              >
                <Heart 
                  size={20} 
                  className={isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'} 
                />
              </button>
            )}

            {/* Price Badge */}
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(service.price || 0, service.priceType || 'fixed')}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full h-48 sm:h-56 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center rounded-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-300 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🔧</span>
              </div>
              <p className="text-gray-600 text-sm">No image available</p>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="space-y-3">
        {/* Title and Rating */}
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
            {service.title || (service as any).name}
          </h3>
          {variant !== 'compact' && (
            <div className="flex items-center space-x-1 ml-2">
              <Star size={16} className={`${getRatingColor(service.providerRating)} fill-current`} />
              <span className={`text-sm font-semibold ${getRatingColor(service.providerRating || 0)}`}>
                {(service.providerRating || 0).toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Provider Info */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {(service.providerName || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{service.providerName || 'Unknown Provider'}</p>
            {variant === 'detailed' && (
              <div className="flex items-center space-x-1">
                <Star size={12} className={`${getRatingColor(service.providerRating)} fill-current`} />
                <span className={`text-xs ${getRatingColor(service.providerRating || 0)}`}>
                  {(service.providerRating || 0).toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {variant !== 'compact' && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {service.description || 'No description available'}
          </p>
        )}

        {/* Category and Location */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
              {service.category || 'Uncategorized'}
            </span>
            {service.subcategory && (
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                {service.subcategory}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <MapPin size={14} />
            <span className="truncate max-w-24">{service.location || 'Location not specified'}</span>
          </div>
        </div>

        {/* Availability Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${(service.isAvailable !== false) ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-medium ${(service.isAvailable !== false) ? 'text-green-600' : 'text-red-600'}`}>
              {(service.isAvailable !== false) ? 'Available' : 'Unavailable'}
            </span>
          </div>
          
          {variant === 'detailed' && (
            <div className="flex items-center space-x-1 text-gray-500">
              <Clock size={14} />
              <span className="text-xs">
                {service.createdAt ? new Date(service.createdAt).toLocaleDateString() : 'Recently added'}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(service)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <Eye size={16} />
              <span>View Details</span>
            </button>
          )}
          
          {(onBookService || service.isAvailable !== false) && (
            <button
              onClick={() => {
                if (onBookService) {
                  onBookService(service);
                } else {
                  setShowBookingModal(true);
                }
              }}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium"
            >
              <Calendar size={16} />
              <span>Book Now</span>
            </button>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        service={service}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onBookingSuccess={(booking) => {
          console.log('Booking successful:', booking);
          // You can add additional success handling here
        }}
      />
    </div>
  );
};

export default ServiceCard;

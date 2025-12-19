import React, { useState } from 'react';
import { Star, MapPin, Clock, Eye, Heart, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { type Service } from '../api/services';
import BookingModal from './BookingModal';
import DistanceDisplay from './DistanceDisplay';
import { getCardImageUrl, handleImageError, normalizeImageUrl } from '../utils/imageHelper';

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
  const [isExpanded, setIsExpanded] = useState(false);

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-yellow-600';
    if (rating >= 3.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't expand if clicking on favorite button
    if ((e.target as HTMLElement).closest('button[data-favorite]')) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  // Format price in ETB
  const getPriceInETB = () => {
    const price = service.price || 0;
    const priceType = service.priceType || 'fixed';
    
    if (priceType === 'hourly') {
      return `${price} ETB/hour`;
    } else if (priceType === 'per_sqft') {
      return `${price} ETB/sq ft`;
    } else if (priceType === 'custom') {
      return `From ${price} ETB`;
    } else {
      return `${price} ETB`;
    }
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden group cursor-pointer w-full h-full flex flex-col"
      onClick={handleCardClick}
    >
      {/* Image Section - Takes all space */}
      {service.photos && service.photos.length > 0 ? (
        <div className="relative w-full aspect-square overflow-hidden">
          <img
            src={(() => {
              const photoUrl = service.photos[0];
              if (!photoUrl) return '';
              
              // Detect if we're on mobile device
              const isMobile = typeof window !== 'undefined' && 
                (window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
              
              // Use smaller image size for mobile to ensure faster loading
              const imageSize = isMobile ? 400 : 800;
              
              // For mobile devices, convert localhost URLs to current host immediately
              let urlToUse = photoUrl;
              if (typeof window !== 'undefined' && window.location) {
                try {
                  // Handle both absolute URLs and relative paths
                  let urlObj: URL;
                  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
                    urlObj = new URL(photoUrl);
                  } else {
                    // Relative path - construct full URL
                    const currentHost = window.location.hostname;
                    const currentProtocol = window.location.protocol;
                    const currentPort = window.location.port || '5000';
                    urlObj = new URL(photoUrl, `${currentProtocol}//${currentHost}:${currentPort}`);
                  }
                  
                  const currentHost = window.location.hostname;
                  const currentProtocol = window.location.protocol;
                  const currentPort = window.location.port || '5000';
                  
                  // If URL is localhost but we're on mobile (different host), convert it immediately
                  if ((urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') &&
                      currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
                    urlObj.hostname = currentHost;
                    urlObj.port = currentPort;
                    urlObj.protocol = currentProtocol;
                    urlToUse = urlObj.toString();
                  }
                } catch (err) {
                  // URL parsing failed, use original
                }
              }
              
              // Always normalize the URL with appropriate size for mobile compatibility
              const normalized = normalizeImageUrl(urlToUse, {
                width: imageSize,
                height: imageSize,
                crop: 'fill',
                quality: 'auto',
                format: 'auto'
              });
              return normalized || urlToUse || '';
            })()}
            alt={service.title || (service as any).name || 'Service'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              const currentSrc = target.src;
              const photoUrl = service.photos[0];
              
              if (!photoUrl) return;
              
              // Detect if we're on mobile device
              const isMobile = typeof window !== 'undefined' && 
                (window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
              
              // Try progressively smaller image sizes for mobile (in case size is the issue)
              const sizes = isMobile ? [300, 200, 150, 100] : [600, 400, 300];
              const currentSizeIndex = parseInt(target.dataset.sizeRetryIndex || '0');
              
              if (currentSizeIndex < sizes.length && !target.dataset.sizeRetried) {
                target.dataset.sizeRetried = 'true';
                const smallerSize = sizes[currentSizeIndex];
                target.dataset.sizeRetryIndex = String(currentSizeIndex + 1);
                
                // Convert URL for mobile first
                let urlToUse = photoUrl;
                if (typeof window !== 'undefined' && window.location) {
                  try {
                    let urlObj: URL;
                    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
                      urlObj = new URL(photoUrl);
                    } else {
                      const currentHost = window.location.hostname;
                      const currentProtocol = window.location.protocol;
                      const currentPort = window.location.port || '5000';
                      urlObj = new URL(photoUrl, `${currentProtocol}//${currentHost}:${currentPort}`);
                    }
                    
                    const currentHost = window.location.hostname;
                    const currentProtocol = window.location.protocol;
                    const currentPort = window.location.port || '5000';
                    
                    if ((urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') &&
                        currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
                      urlObj.hostname = currentHost;
                      urlObj.port = currentPort;
                      urlObj.protocol = currentProtocol;
                      urlToUse = urlObj.toString();
                    }
                  } catch (err) {
                    // URL parsing failed
                  }
                }
                
                const resizedUrl = normalizeImageUrl(urlToUse, {
                  width: smallerSize,
                  height: smallerSize,
                  crop: 'fill',
                  quality: 'auto',
                  format: 'auto'
                });
                
                if (resizedUrl && currentSrc !== resizedUrl) {
                  console.log(`Retrying with smaller image size (${smallerSize}x${smallerSize}):`, resizedUrl);
                  target.dataset.sizeRetried = 'false'; // Reset for next size
                  target.src = resizedUrl;
                  return;
                }
              }
              
              // Try mobile-converted URL (convert localhost to current host)
              if (typeof window !== 'undefined' && window.location && photoUrl) {
                try {
                  let urlObj: URL;
                  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
                    urlObj = new URL(photoUrl);
                  } else {
                    const currentHost = window.location.hostname;
                    const currentProtocol = window.location.protocol;
                    const currentPort = window.location.port || '5000';
                    urlObj = new URL(photoUrl, `${currentProtocol}//${currentHost}:${currentPort}`);
                  }
                  
                  const currentHost = window.location.hostname;
                  const currentProtocol = window.location.protocol;
                  const currentPort = window.location.port || '5000';
                  
                  // If URL is localhost but we're on mobile, convert it
                  if ((urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') &&
                      currentHost !== 'localhost' && currentHost !== '127.0.0.1' &&
                      !target.dataset.mobileRetried) {
                    target.dataset.mobileRetried = 'true';
                    urlObj.hostname = currentHost;
                    urlObj.port = currentPort;
                    urlObj.protocol = currentProtocol;
                    const mobileUrl = urlObj.toString();
                    console.log('Retrying with mobile-converted URL:', mobileUrl);
                    target.src = mobileUrl;
                    return;
                  }
                } catch (err) {
                  // URL parsing failed, continue
                }
              }
              
              // Try normalized URL without size constraints
              const normalized = normalizeImageUrl(photoUrl);
              if (normalized && currentSrc !== normalized && !target.dataset.normalizedRetried) {
                target.dataset.normalizedRetried = 'true';
                console.log('Retrying with normalized URL:', normalized);
                target.src = normalized;
                return;
              }
              
              // Try original URL with mobile conversion
              if (photoUrl && currentSrc !== photoUrl && !target.dataset.originalRetried) {
                target.dataset.originalRetried = 'true';
                
                // Convert original URL for mobile
                let originalUrl = photoUrl;
                if (typeof window !== 'undefined' && window.location) {
                  try {
                    let urlObj: URL;
                    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
                      urlObj = new URL(photoUrl);
                    } else {
                      const currentHost = window.location.hostname;
                      const currentProtocol = window.location.protocol;
                      const currentPort = window.location.port || '5000';
                      urlObj = new URL(photoUrl, `${currentProtocol}//${currentHost}:${currentPort}`);
                    }
                    
                    const currentHost = window.location.hostname;
                    const currentProtocol = window.location.protocol;
                    const currentPort = window.location.port || '5000';
                    
                    if ((urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') &&
                        currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
                      urlObj.hostname = currentHost;
                      urlObj.port = currentPort;
                      urlObj.protocol = currentProtocol;
                      originalUrl = urlObj.toString();
                    }
                  } catch (err) {
                    // URL parsing failed
                  }
                }
                
                console.log('Retrying with original URL (mobile-converted):', originalUrl);
                target.src = originalUrl;
                return;
              }
              
              // If all retries failed, show placeholder but keep trying in background
              if (!target.dataset.placeholderShown) {
                target.dataset.placeholderShown = 'true';
                target.style.opacity = '0.3';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('.image-placeholder')) {
                  const placeholder = document.createElement('div');
                  placeholder.className = 'image-placeholder absolute inset-0 w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center pointer-events-none';
                  placeholder.innerHTML = `
                    <div class="text-center">
                      <div class="w-12 h-12 bg-orange-300 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
                        <span class="text-xl">🔧</span>
                      </div>
                      <p class="text-gray-600 text-xs">Loading image...</p>
                    </div>
                  `;
                  parent.appendChild(placeholder);
                }
              }
            }}
            onLoad={(e) => {
              console.log('✅ ServiceCard image loaded successfully');
              // Remove placeholder and restore opacity if image loads
              const target = e.currentTarget;
              target.style.opacity = '1';
              const parent = target.parentElement;
              if (parent) {
                const placeholder = parent.querySelector('.image-placeholder');
                if (placeholder) {
                  placeholder.remove();
                }
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          {/* Favorite Button */}
          {onToggleFavorite && (
            <button
              data-favorite
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(service);
              }}
              className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-10"
            >
              <Heart 
                size={16} 
                className={isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'} 
              />
            </button>
          )}
        </div>
      ) : (
        <div className="w-full aspect-square bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-300 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-xl">🔧</span>
            </div>
            <p className="text-gray-600 text-xs">No image</p>
          </div>
        </div>
      )}

      {/* Content Section - Title, Rating, Price in order */}
      <div className="p-4 space-y-2 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
          {service.title || (service as any).name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center space-x-1">
          {service.serviceRating !== null && service.serviceRating !== undefined ? (
            <>
              <Star size={14} className={`${getRatingColor(service.serviceRating)} fill-current`} />
              <span className={`text-sm font-semibold ${getRatingColor(service.serviceRating)}`}>
                {service.serviceRating.toFixed(1)}
              </span>
              {service.ratingCount !== undefined && service.ratingCount > 0 && (
                <span className="text-xs text-gray-500">
                  ({service.ratingCount} {service.ratingCount === 1 ? 'rating' : 'ratings'})
                </span>
              )}
            </>
          ) : (
            <>
              <Star size={14} className="text-gray-300" />
              <span className="text-xs font-semibold text-gray-400">
                No rating
              </span>
            </>
          )}
        </div>
        
        {/* Price and Distance */}
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-orange-600">
            {getPriceInETB()}
          </span>
          <div className="flex items-center space-x-2">
            {/* Distance Display */}
            <DistanceDisplay 
              distance={service.distance}
              variant="badge"
            />
            {isExpanded ? (
              <ChevronUp size={16} className="text-gray-400" />
            ) : (
              <ChevronDown size={16} className="text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details - shown on click */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in border-t border-gray-200 pt-4">
          {/* Provider Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {(service.providerName || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{service.providerName || 'Unknown Provider'}</p>
              <div className="flex items-center space-x-1 mt-1">
                <Star size={12} className={`${getRatingColor(service.providerRating || 0)} fill-current`} />
                <span className={`text-xs ${getRatingColor(service.providerRating || 0)}`}>
                  {(service.providerRating || 0).toFixed(1)} Rating
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {service.description && (
            <p className="text-gray-600 text-sm leading-relaxed">
              {service.description}
            </p>
          )}

          {/* Category and Location */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
                {service.category || 'Uncategorized'}
              </span>
              {service.subcategory && (
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                  {service.subcategory}
                </span>
              )}
            </div>
            {service.location && (
              <div className="flex items-center space-x-1 text-gray-600">
                <MapPin size={14} />
                <span>{service.location}</span>
              </div>
            )}
            {/* Distance in expanded view */}
            <DistanceDisplay 
              distance={service.distance}
              variant="badge"
              className="bg-blue-50 text-blue-600 px-3 py-1"
            />
          </div>

          {/* Availability Status */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${(service.isAvailable !== false) ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-sm font-medium ${(service.isAvailable !== false) ? 'text-green-600' : 'text-red-600'}`}>
                {(service.isAvailable !== false) ? 'Available' : 'Unavailable'}
              </span>
            </div>
            
            {service.createdAt && (
              <div className="flex items-center space-x-1 text-gray-500">
                <Clock size={14} />
                <span className="text-xs">
                  {new Date(service.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            {onViewDetails && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(service);
                }}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium"
              >
                <Eye size={16} />
                <span>View Full Details</span>
              </button>
            )}
            {onBookService && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBookingModal(true);
                }}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium"
              >
                <Calendar size={16} />
                <span>Book Now</span>
              </button>
            )}
          </div>
        </div>
      )}

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

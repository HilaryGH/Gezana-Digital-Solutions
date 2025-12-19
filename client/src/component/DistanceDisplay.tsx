import React from 'react';
import { Navigation, Loader2, AlertCircle } from 'lucide-react';

interface DistanceDisplayProps {
  distance: number | null | undefined;
  isLoading?: boolean;
  error?: string | null;
  variant?: 'badge' | 'inline' | 'compact';
  className?: string;
}

/**
 * DistanceDisplay Component
 * Displays estimated distance between user and provider with loading and error states
 */
const DistanceDisplay: React.FC<DistanceDisplayProps> = ({
  distance,
  isLoading = false,
  error = null,
  variant = 'badge',
  className = ''
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div 
        className={`flex items-center space-x-1.5 text-gray-500 ${className}`}
        aria-label="Calculating distance"
      >
        <Loader2 size={14} className="animate-spin text-gray-400" />
        <span className="text-xs font-medium">Calculating...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div 
        className={`flex items-center space-x-1.5 text-red-500 ${className}`}
        title={error}
        aria-label={`Distance error: ${error}`}
      >
        <AlertCircle size={14} className="text-red-400" />
        <span className="text-xs font-medium">Distance unavailable</span>
      </div>
    );
  }

  // No distance data available
  if (distance === null || distance === undefined) {
    return null; // Don't render anything if no distance
  }

  // Format distance
  const formattedDistance = distance < 1 
    ? `${(distance * 1000).toFixed(0)} m away` // Show in meters if less than 1km
    : `${distance.toFixed(1)} km away`;

  // Variant styles
  const variantStyles = {
    badge: 'bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600',
    inline: 'text-sm text-gray-600',
    compact: 'text-xs text-gray-500'
  };

  const iconSize = variant === 'compact' ? 12 : 14;

  return (
    <div 
      className={`flex items-center space-x-1.5 ${variantStyles[variant]} ${className}`}
      aria-label={`Distance: ${formattedDistance}`}
    >
      <Navigation 
        size={iconSize} 
        className="text-blue-500 flex-shrink-0" 
        aria-hidden="true"
      />
      <span className="font-medium">{formattedDistance}</span>
    </div>
  );
};

export default DistanceDisplay;







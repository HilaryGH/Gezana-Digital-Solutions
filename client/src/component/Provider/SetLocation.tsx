import React, { useState } from 'react';
import { MapPin, Navigation, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from '../../api/axios';

interface SetLocationProps {
  onSuccess?: () => void;
}

const SetLocation: React.FC<SetLocationProps> = ({ onSuccess }) => {
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [locationMethod, setLocationMethod] = useState<'gps' | 'manual'>('gps');

  const getCurrentLocation = () => {
    setGpsLoading(true);
    setError('');
    setSuccess('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat.toString());
        setLongitude(lng.toString());
        setGpsLoading(false);
        setSuccess('Location retrieved successfully! Click Submit to save.');
      },
      (err) => {
        let errorMessage = 'Failed to get your location.';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions in your browser settings.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
        }
        setError(errorMessage);
        setGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const validateCoordinates = (lat: string, lng: string): boolean => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      setError('Please enter valid numeric values for latitude and longitude.');
      return false;
    }

    if (latNum < -90 || latNum > 90) {
      setError('Latitude must be between -90 and 90.');
      return false;
    }

    if (lngNum < -180 || lngNum > 180) {
      setError('Longitude must be between -180 and 180.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!latitude.trim() || !longitude.trim()) {
      setError('Please provide both latitude and longitude.');
      setLoading(false);
      return;
    }

    if (!validateCoordinates(latitude, longitude)) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to set your location.');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        '/provider/location',
        {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess('Location updated successfully!');
      setLatitude('');
      setLongitude('');

      // Call onSuccess callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (err: any) {
      console.error('Error setting location:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update location. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Set Your Location</h2>
      </div>

      {/* Method Selection */}
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => {
              setLocationMethod('gps');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              locationMethod === 'gps'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Navigation className="w-4 h-4 inline-block mr-2" />
            Use GPS
          </button>
          <button
            type="button"
            onClick={() => {
              setLocationMethod('manual');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              locationMethod === 'manual'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <MapPin className="w-4 h-4 inline-block mr-2" />
            Manual Entry
          </button>
        </div>
      </div>

      {/* GPS Method */}
      {locationMethod === 'gps' && (
        <div className="mb-6">
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={gpsLoading}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {gpsLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Getting location...
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                Get My Current Location
              </>
            )}
          </button>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Allow location access when prompted
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
            Latitude
          </label>
          <input
            type="text"
            id="latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="e.g., 9.1450"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base"
            inputMode="decimal"
          />
        </div>

        <div>
          <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
            Longitude
          </label>
          <input
            type="text"
            id="longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="e.g., 38.7617"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base"
            inputMode="decimal"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !latitude.trim() || !longitude.trim()}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <MapPin className="w-5 h-5" />
              Save Location
            </>
          )}
        </button>
      </form>

      {/* Help Text */}
      <p className="mt-4 text-xs text-gray-500 text-center">
        Your location helps customers find services near them
      </p>
    </div>
  );
};

export default SetLocation;



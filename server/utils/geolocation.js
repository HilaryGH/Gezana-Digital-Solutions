/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  // Earth's radius in kilometers
  const R = 6371;

  // Convert degrees to radians
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 2 decimal places
  return Math.round(distance * 100) / 100;
}

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number} Radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distance using MongoDB geoNear (alternative method)
 * Note: This requires coordinates to be in GeoJSON Point format
 * @param {Object} seekerCoords - GeoJSON Point { type: 'Point', coordinates: [lon, lat] }
 * @param {Object} providerCoords - GeoJSON Point { type: 'Point', coordinates: [lon, lat] }
 * @returns {number} Distance in kilometers
 */
function calculateDistanceGeoJSON(seekerCoords, providerCoords) {
  if (!seekerCoords || !providerCoords) {
    return null;
  }

  const [lon1, lat1] = seekerCoords.coordinates || [];
  const [lon2, lat2] = providerCoords.coordinates || [];

  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return null;
  }

  return calculateDistance(lat1, lon1, lat2, lon2);
}

/**
 * Get distance from user coordinates (latitude/longitude or GeoJSON)
 * @param {Object} seeker - User object with latitude/longitude or coordinates
 * @param {Object} provider - User/Service object with latitude/longitude or coordinates
 * @returns {number|null} Distance in kilometers or null if coordinates unavailable
 */
function getDistanceBetween(seeker, provider) {
  let seekerLat, seekerLon, providerLat, providerLon;

  // Extract seeker coordinates
  if (seeker.latitude != null && seeker.longitude != null) {
    seekerLat = seeker.latitude;
    seekerLon = seeker.longitude;
  } else if (seeker.coordinates && seeker.coordinates.coordinates) {
    [seekerLon, seekerLat] = seeker.coordinates.coordinates;
  } else {
    return null; // Seeker location not available
  }

  // Extract provider coordinates
  if (provider.latitude != null && provider.longitude != null) {
    providerLat = provider.latitude;
    providerLon = provider.longitude;
  } else if (provider.coordinates && provider.coordinates.coordinates) {
    [providerLon, providerLat] = provider.coordinates.coordinates;
  } else {
    return null; // Provider location not available
  }

  return calculateDistance(seekerLat, seekerLon, providerLat, providerLon);
}

module.exports = {
  calculateDistance,
  calculateDistanceGeoJSON,
  getDistanceBetween,
  toRadians
};








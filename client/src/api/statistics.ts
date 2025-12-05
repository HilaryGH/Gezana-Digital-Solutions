import axios from "./axios";

export interface NavbarStatistics {
  newProvidersThisWeek: number;
  completedBookings: number;
  averageRating: number;
}

export const getNavbarStatistics = async (): Promise<NavbarStatistics> => {
  try {
    const response = await axios.get("/statistics/navbar");
    // Ensure we have valid numbers
    return {
      newProvidersThisWeek: response.data.newProvidersThisWeek || 0,
      completedBookings: response.data.completedBookings || 0,
      averageRating: response.data.averageRating || 0,
    };
  } catch (error) {
    console.error("Error fetching navbar statistics:", error);
    // Return zero values if API fails (don't show fake data)
    return {
      newProvidersThisWeek: 0,
      completedBookings: 0,
      averageRating: 0,
    };
  }
};










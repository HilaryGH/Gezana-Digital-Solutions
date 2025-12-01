import axios from "./axios";

export interface NavbarStatistics {
  newProvidersThisWeek: number;
  completedBookings: number;
  averageRating: number;
}

export const getNavbarStatistics = async (): Promise<NavbarStatistics> => {
  try {
    const response = await axios.get("/statistics/navbar");
    return response.data;
  } catch (error) {
    console.error("Error fetching navbar statistics:", error);
    // Return default values if API fails
    return {
      newProvidersThisWeek: 500,
      completedBookings: 0,
      averageRating: 0,
    };
  }
};



import axios from './axios';

export interface PromotionalBanner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
  isActive: boolean;
  order: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Get all active promotional banners (public)
export const getPromotionalBanners = async (): Promise<PromotionalBanner[]> => {
  try {
    const response = await axios.get<PromotionalBanner[]>('/promotional-banners');
    return response.data;
  } catch (error) {
    console.error('Error fetching promotional banners:', error);
    throw error;
  }
};

// Get all promotional banners (admin only)
export const getAllPromotionalBanners = async (): Promise<PromotionalBanner[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get<PromotionalBanner[]>('/promotional-banners/all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all promotional banners:', error);
    throw error;
  }
};

// Get promotional banners created by current user (provider/admin)
export const getMyPromotionalBanners = async (): Promise<PromotionalBanner[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get<PromotionalBanner[]>('/promotional-banners/mine', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching my promotional banners:', error);
    throw error;
  }
};

// Get single promotional banner
export const getPromotionalBannerById = async (id: string): Promise<PromotionalBanner> => {
  try {
    const response = await axios.get<PromotionalBanner>(`/promotional-banners/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching promotional banner:', error);
    throw error;
  }
};

// Create promotional banner (admin only)
export const createPromotionalBanner = async (bannerData: Partial<PromotionalBanner>): Promise<PromotionalBanner> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post<PromotionalBanner>('/promotional-banners', bannerData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating promotional banner:', error);
    throw error;
  }
};

// Update promotional banner (admin only)
export const updatePromotionalBanner = async (id: string, bannerData: Partial<PromotionalBanner>): Promise<PromotionalBanner> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put<PromotionalBanner>(`/promotional-banners/${id}`, bannerData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating promotional banner:', error);
    throw error;
  }
};

// Delete promotional banner (admin only)
export const deletePromotionalBanner = async (id: string): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`/promotional-banners/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error('Error deleting promotional banner:', error);
    throw error;
  }
};


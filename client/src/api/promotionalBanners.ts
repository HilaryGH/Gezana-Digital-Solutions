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

/** Mongo returns `_id`; client expects `id` for URLs (update/delete). */
function normalizeBanner(raw: Record<string, unknown>): PromotionalBanner {
  const r = raw as Record<string, unknown>;
  const id =
    (typeof r.id === 'string' && r.id) || (r._id != null ? String(r._id) : '');
  return {
    id,
    title: String(r.title ?? ''),
    subtitle: r.subtitle != null ? String(r.subtitle) : undefined,
    description: r.description != null ? String(r.description) : undefined,
    icon: r.icon != null ? String(r.icon) : undefined,
    backgroundColor: r.backgroundColor != null ? String(r.backgroundColor) : undefined,
    textColor: r.textColor != null ? String(r.textColor) : undefined,
    buttonText: r.buttonText != null ? String(r.buttonText) : undefined,
    buttonLink: r.buttonLink != null ? String(r.buttonLink) : undefined,
    image: r.image != null ? String(r.image) : undefined,
    isActive: Boolean(r.isActive),
    order: Number(r.order ?? 0),
    startDate: r.startDate != null ? String(r.startDate) : undefined,
    endDate: r.endDate != null ? String(r.endDate) : undefined,
    createdAt: r.createdAt != null ? String(r.createdAt) : '',
    updatedAt: r.updatedAt != null ? String(r.updatedAt) : '',
  };
}

// Get all active promotional banners (public)
export const getPromotionalBanners = async (): Promise<PromotionalBanner[]> => {
  try {
    const response = await axios.get<Record<string, unknown>[]>('/promotional-banners');
    return (response.data || []).map((row) => normalizeBanner(row));
  } catch (error) {
    console.error('Error fetching promotional banners:', error);
    throw error;
  }
};

// Get all promotional banners (admin only)
export const getAllPromotionalBanners = async (): Promise<PromotionalBanner[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get<Record<string, unknown>[]>('/promotional-banners/all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return (response.data || []).map((row) => normalizeBanner(row));
  } catch (error) {
    console.error('Error fetching all promotional banners:', error);
    throw error;
  }
};

// Get promotional banners created by current user (provider/admin)
export const getMyPromotionalBanners = async (): Promise<PromotionalBanner[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get<Record<string, unknown>[]>('/promotional-banners/mine', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return (response.data || []).map((row) => normalizeBanner(row));
  } catch (error) {
    console.error('Error fetching my promotional banners:', error);
    throw error;
  }
};

// Get single promotional banner
export const getPromotionalBannerById = async (id: string): Promise<PromotionalBanner> => {
  try {
    const response = await axios.get<Record<string, unknown>>(`/promotional-banners/${id}`);
    return normalizeBanner(response.data);
  } catch (error) {
    console.error('Error fetching promotional banner:', error);
    throw error;
  }
};

// Create promotional banner (admin only)
export const createPromotionalBanner = async (bannerData: Partial<PromotionalBanner>): Promise<PromotionalBanner> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post<Record<string, unknown>>('/promotional-banners', bannerData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return normalizeBanner(response.data);
  } catch (error) {
    console.error('Error creating promotional banner:', error);
    throw error;
  }
};

// Update promotional banner (admin only)
export const updatePromotionalBanner = async (id: string, bannerData: Partial<PromotionalBanner>): Promise<PromotionalBanner> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put<Record<string, unknown>>(`/promotional-banners/${id}`, bannerData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return normalizeBanner(response.data);
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


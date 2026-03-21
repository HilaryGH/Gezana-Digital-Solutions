import axios from './axios';
import { REGISTRATION_SERVICE_CATEGORIES } from '../constants/registrationServiceCategories';

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  priceType: 'fixed' | 'hourly' | 'per_sqft' | 'custom';
  photos: string[];
  providerId: string;
  providerName: string;
  providerRating: number;
  serviceRating?: number | null; // Service-specific rating from reviews
  ratingCount?: number; // Number of ratings/reviews
  isAvailable: boolean;
  location: string;
  distance?: number | null; // Distance in kilometers between user and provider
  createdAt: string;
  updatedAt: string;
  /** Set when row comes from GET /catalog (agent-submitted professional) */
  catalogSource?: 'provider' | 'agent';
  agentPhone?: string | null;
  agentEmail?: string | null;
  agentWhatsapp?: string | null;
  agentTelegram?: string | null;
  agentNotes?: string | null;
  agentListingStatus?: string;
}

/** Single row from GET /api/catalog */
export interface CatalogItemBase {
  _id: string;
  title: string;
  price: number | null;
  category: string;
  providerName: string;
  source: 'provider' | 'agent';
}

export interface CatalogProviderItem extends CatalogItemBase {
  source: 'provider';
  price: number;
}

export interface CatalogAgentItem extends CatalogItemBase {
  source: 'agent';
  price: null;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  telegram?: string | null;
  city?: string | null;
  location?: string | null;
  notes?: string | null;
  status?: string;
  photo?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type CatalogItem = CatalogProviderItem | CatalogAgentItem;

export function mapCatalogAgentToService(row: CatalogAgentItem): Service {
  const locParts = [row.city, row.location].filter(Boolean);
  const created = row.createdAt ? String(row.createdAt) : '';
  const updated = row.updatedAt ? String(row.updatedAt) : created;
  return {
    id: String(row._id),
    title: row.title,
    description: row.notes?.trim() || 'Professional referred by a Homehub agent. Contact directly to discuss scope and pricing.',
    category: row.category || '',
    subcategory: '',
    price: 0,
    priceType: 'custom',
    photos:
      row.photo != null && String(row.photo).trim() !== ''
        ? [String(row.photo).trim()]
        : [],
    providerId: '',
    providerName: row.providerName,
    providerRating: 0,
    serviceRating: null,
    ratingCount: 0,
    isAvailable: row.status !== 'rejected',
    location: locParts.join(', '),
    createdAt: created,
    updatedAt: updated,
    catalogSource: 'agent',
    agentPhone: row.phone,
    agentEmail: row.email,
    agentWhatsapp: row.whatsapp,
    agentTelegram: row.telegram,
    agentNotes: row.notes,
    agentListingStatus: row.status,
  };
}

export interface CreateServiceData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  priceType: 'fixed' | 'hourly' | 'per_sqft' | 'custom';
  photos: File[];
  location: string;
}

export interface ServiceSearchParams {
  query?: string;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  page?: number;
  limit?: number;
}

function normalizeCategoriesPayload(data: unknown): ServiceCategory[] {
  if (!Array.isArray(data) || data.length === 0) return [];
  if (typeof data[0] === 'string') {
    return (data as string[]).map((name) => ({
      id: name,
      name,
      icon: '',
      subcategories: [],
    }));
  }
  return data as ServiceCategory[];
}

// Service Categories
export const getServiceCategories = async (): Promise<ServiceCategory[]> => {
  try {
    const response = await axios.get('/services/categories');
    return normalizeCategoriesPayload(response.data);
  } catch (error) {
    console.error('Error fetching service categories:', error);
    // Return fallback categories if API fails
    return getFallbackCategories();
  }
};

/** Same taxonomy as provider registration (see `registrationServiceCategories.ts`). */
export const getFallbackCategories = (): ServiceCategory[] =>
  REGISTRATION_SERVICE_CATEGORIES.map((c) => ({
    id: c.name,
    name: c.name,
    icon: '',
    subcategories: [...c.subcategories],
  }));

// Create a new service
export const createService = async (serviceData: CreateServiceData): Promise<Service> => {
  try {
    const formData = new FormData();
    formData.append('title', serviceData.title);
    formData.append('description', serviceData.description);
    formData.append('category', serviceData.category);
    formData.append('subcategory', serviceData.subcategory);
    formData.append('price', serviceData.price.toString());
    formData.append('priceType', serviceData.priceType);
    formData.append('location', serviceData.location);
    
    // Append photos
    serviceData.photos.forEach((photo) => {
      formData.append(`photos`, photo);
    });

    const token = localStorage.getItem('token');
    const response = await axios.post('/services', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return response.data as Service;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

// Get all services with optional filters
export const getServices = async (params?: ServiceSearchParams): Promise<{ services: Service[]; total: number; page: number; totalPages: number }> => {
  try {
    const response = await axios.get('/services', { params });
    console.log('Services API response:', response.data);
    
    // Handle different response structures
    const data = response.data as any;
    if (Array.isArray(data)) {
      // If response is directly an array
      return {
        services: data,
        total: data.length,
        page: 1,
        totalPages: 1
      };
    }
    
    // If response has expected structure
    return {
      services: data.services || data.data || [],
      total: data.total || data.count || 0,
      page: data.page || 1,
      totalPages: data.totalPages || data.total_pages || 1
    };
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

/** Combined provider services + agent-submitted professionals (public). */
export const getCatalog = async (): Promise<CatalogItem[]> => {
  try {
    const response = await axios.get<CatalogItem[]>('/catalog');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return [];
  }
};

// Get service by ID
export const getServiceById = async (id: string): Promise<Service> => {
  try {
    const response = await axios.get(`/services/${id}`);
    return response.data as Service;
  } catch (error) {
    console.error('Error fetching service:', error);
    throw error;
  }
};

// Get services by provider
export const getServicesByProvider = async (providerId: string): Promise<Service[]> => {
  try {
    const response = await axios.get(`/services/provider/${providerId}`);
    return response.data as Service[];
  } catch (error) {
    console.error('Error fetching provider services:', error);
    throw error;
  }
};

// Get current provider's own services
export const getMyServices = async (): Promise<Service[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/services/mine', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Transform the response to match the Service interface
    const raw = response.data as unknown[];
    const services = raw.map((service: any) => ({
      id: service._id,
      title: service.name,
      description: service.description,
      category: service.category?.name || service.category,
      subcategory: service.type?.name || service.type,
      price: service.price,
      priceType: service.priceType || 'fixed',
      photos: service.photos || [],
      providerId: service.provider,
      providerName: '',
      providerRating: 4.5,
      isAvailable: service.isActive !== false,
      location: service.location || '',
      createdAt: service.createdAt,
      updatedAt: service.updatedAt
    }));
    
    return services;
  } catch (error) {
    console.error('Error fetching my services:', error);
    throw error;
  }
};

// Update service
export const updateService = async (id: string, serviceData: Partial<CreateServiceData>): Promise<Service> => {
  try {
    const formData = new FormData();
    
    if (serviceData.title) formData.append('title', serviceData.title);
    if (serviceData.description) formData.append('description', serviceData.description);
    if (serviceData.category) formData.append('category', serviceData.category);
    if (serviceData.subcategory) formData.append('subcategory', serviceData.subcategory);
    if (serviceData.price) formData.append('price', serviceData.price.toString());
    if (serviceData.priceType) formData.append('priceType', serviceData.priceType);
    if (serviceData.location) formData.append('location', serviceData.location);
    
    // Append new photos if provided
    if (serviceData.photos) {
      serviceData.photos.forEach((photo) => {
        formData.append('photos', photo);
      });
    }

    const response = await axios.put(`/services/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as Service;
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
};

// Delete service
export const deleteService = async (id: string): Promise<void> => {
  try {
    await axios.delete(`/services/${id}`);
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

// Search services
export const searchServices = async (query: string, filters?: Omit<ServiceSearchParams, 'query'>): Promise<{ services: Service[]; total: number }> => {
  try {
    const response = await axios.get('/services/search', {
      params: { query, ...filters }
    });
    console.log('Search services API response:', response.data);
    
    const data = response.data as any;
    if (Array.isArray(data)) {
      return {
        services: data,
        total: data.length
      };
    }
    
    return {
      services: data.services || data.data || [],
      total: data.total || data.count || 0
    };
  } catch (error) {
    console.error('Error searching services:', error);
    throw error;
  }
};

// Get recently added services
export const getRecentServices = async (limit: number = 10): Promise<Service[]> => {
  try {
    const response = await axios.get('/services/recent', {
      params: { limit }
    });
    return response.data as Service[];
  } catch (error) {
    console.error('Error fetching recent services:', error);
    throw error;
  }
};

// Get most booked services
export const getMostBookedServices = async (limit: number = 10): Promise<Service[]> => {
  try {
    const response = await axios.get('/services/most-booked', {
      params: { limit }
    });
    return response.data as Service[];
  } catch (error) {
    console.error('Error fetching most booked services:', error);
    throw error;
  }
};

// Get top rated providers
export interface TopProvider {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  photo?: string | null;
  serviceType?: string;
  city?: string;
  location?: string;
  rating: number;
  reviewCount: number;
  serviceCount: number;
}

export const getTopProviders = async (limit: number = 10): Promise<TopProvider[]> => {
  try {
    const response = await axios.get('/services/top-providers', {
      params: { limit }
    });
    return response.data as TopProvider[];
  } catch (error) {
    console.error('Error fetching top providers:', error);
    throw error;
  }
};

import axios from './axios';

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
  createdAt: string;
  updatedAt: string;
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

// Service Categories
export const getServiceCategories = async (): Promise<ServiceCategory[]> => {
  try {
    const response = await axios.get('/services/categories');
    return response.data as ServiceCategory[];
  } catch (error) {
    console.error('Error fetching service categories:', error);
    // Return fallback categories if API fails
    return getFallbackCategories();
  }
};

// Fallback categories when API is not available
export const getFallbackCategories = (): ServiceCategory[] => [
  {
    id: '1',
    name: 'Home Maintenance',
    icon: '🔧',
    subcategories: [
      'Plumbing',
      'Electrical Work',
      'Painting',
      'Carpentry',
      'General Repairs',
      'Door & Window Repair',
      'Furniture Assembly',
      'TV Mounting',
      'Roofing',
      'Flooring',
      'HVAC Services',
      'Handyman Services',
      'Lock Installation',
      'Shelf Installation',
      'Cabinet Installation',
      'Light Fixture Installation'
    ]
  },
  {
    id: '2',
    name: 'Cleaning Services',
    icon: '🧹',
    subcategories: [
      'House Cleaning',
      'Office Cleaning',
      'Carpet Cleaning',
      'Window Cleaning',
      'Deep Cleaning',
      'Move-in/Move-out Cleaning',
      'Post-Construction Cleaning',
      'Pest Control',
      'Upholstery Cleaning',
      'Appliance Cleaning',
      'Gutter Cleaning',
      'Pressure Washing',
      'Green Cleaning',
      'Sanitization Services',
      'Event Cleanup',
      'Regular Maintenance'
    ]
  },
  {
    id: '3',
    name: 'Appliance Repair',
    icon: '⚙️',
    subcategories: [
      'Refrigerator Repair',
      'Washing Machine Repair',
      'AC Repair',
      'Oven Repair',
      'Dryer Repair',
      'Dishwasher Repair',
      'Microwave Repair',
      'Water Heater Repair',
      'Garbage Disposal Repair',
      'Ice Maker Repair',
      'Stove Repair',
      'Freezer Repair',
      'Appliance Installation',
      'Appliance Maintenance',
      'Emergency Repair',
      'Warranty Service'
    ]
  },
  {
    id: '4',
    name: 'Personal Care',
    icon: '👶',
    subcategories: [
      'Babysitting',
      'Nanny Services',
      'Elderly Care',
      'Pet Care',
      'Personal Assistant',
      'Companion Care',
      'Special Needs Care',
      'Overnight Care',
      'Tutoring Services',
      'After School Care',
      'Weekend Care',
      'Holiday Care',
      'Travel Companion',
      'Medical Appointment Assistance',
      'Meal Preparation',
      'Medication Reminders'
    ]
  },
  {
    id: '5',
    name: 'Household & Home Services',
    icon: '🏠',
    subcategories: [
      'Gardening',
      'Laundry',
      'Home Organization',
      'Pest Control',
      'Home Security',
      'Maintenance',
      'Interior Design',
      'Furniture Assembly',
      'Landscaping',
      'Pool Maintenance',
      'Gutter Cleaning',
      'Pressure Washing',
      'Home Staging',
      'Decluttering',
      'Storage Solutions',
      'Seasonal Services'
    ]
  },
  {
    id: '6',
    name: 'Hotel/Lounge Services',
    icon: '🏨',
    subcategories: [
      'Room Service',
      'Concierge',
      'Housekeeping',
      'Event Planning',
      'Catering',
      'Spa Services',
      'Front Desk',
      'Guest Services',
      'Bartending',
      'Waitressing',
      'VIP Services',
      'Reception Services',
      'Security Services',
      'Valet Services',
      'Bell Services',
      'Guest Relations'
    ]
  }
];

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
    const services = response.data.map((service: any) => ({
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

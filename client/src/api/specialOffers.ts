import axios from './axios';

export interface SpecialOffer {
  _id: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  originalPrice?: number;
  discountedPrice?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  maxUses?: number;
  currentUses?: number;
  image?: string;
  terms?: string;
  provider?: {
    _id: string;
    name?: string;
    companyName?: string;
  };
  service?: {
    _id: string;
    name: string;
    price: number;
    photos?: string[];
    category?: any;
  };
  createdAt: string;
  updatedAt: string;
}

interface SpecialOffersResponse {
  success: boolean;
  offers: SpecialOffer[];
  debug?: {
    totalOffers: number;
    afterDateFilter: number;
    afterMaxUsesFilter: number;
    finalCount: number;
    currentTime: string;
  };
}

// Get all active special offers (public)
export const getActiveSpecialOffers = async (): Promise<SpecialOffer[]> => {
  try {
    const response = await axios.get<SpecialOffersResponse | SpecialOffer[]>('/special-offers/active');
    
    // Handle different response formats
    if (Array.isArray(response.data)) {
      // If response is directly an array
      return response.data;
    }
    
    // If response has the expected structure with success and offers
    const data = response.data as SpecialOffersResponse;
    if (data.success && data.offers) {
      return data.offers;
    }
    
    // Fallback to empty array
    console.warn('Unexpected response format for special offers:', response.data);
    return [];
  } catch (error: any) {
    console.error('Error fetching active special offers:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    // Return empty array instead of throwing to prevent UI breaking
    return [];
  }
};



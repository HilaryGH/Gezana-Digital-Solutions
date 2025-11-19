import axios from './axios';

export interface Review {
  _id: string;
  service: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  rating: number;
  comment: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResponse {
  reviews: Review[];
  total: number;
  page: number;
  totalPages: number;
  averageRating: string;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface CreateReviewData {
  serviceId: string;
  rating: number;
  comment: string;
}

export const getServiceReviews = async (
  serviceId: string,
  page: number = 1,
  limit: number = 10
): Promise<ReviewResponse> => {
  const response = await axios.get(`/reviews/service/${serviceId}`, {
    params: { page, limit },
  });
  return response.data;
};

export const createReview = async (data: CreateReviewData): Promise<Review> => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    '/reviews',
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.review;
};

export const updateReview = async (
  reviewId: string,
  data: { rating?: number; comment?: string }
): Promise<Review> => {
  const token = localStorage.getItem('token');
  const response = await axios.put(
    `/reviews/${reviewId}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.review;
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  const token = localStorage.getItem('token');
  await axios.delete(`/reviews/${reviewId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};






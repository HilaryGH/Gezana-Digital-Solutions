import axios from './axios';

export interface Booking {
  _id: string;
  user: string;
  service: string;
  category: string;
  type: string;
  serviceType: string;
  date: string;
  note?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'in_progress';
  paymentStatus: 'pending' | 'paid';
  createdAt: string;
  updatedAt: string;
}

export interface BookingWithDetails extends Booking {
  user?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  service?: {
    _id: string;
    name: string;
    price: number;
    provider?: {
      _id: string;
      name: string;
      email: string;
      phone?: string;
    };
  };
  category?: {
    _id: string;
    name: string;
  };
  type?: {
    _id: string;
    name: string;
  };
}

export interface CreateBookingData {
  service: string;
  category: string;
  type: string;
  serviceType: string;
  date: string;
  note?: string;
  paymentMethod?: 'cash' | 'online';
}

export interface UpdateBookingData {
  date?: string;
  note?: string;
  status?: string;
  paymentStatus?: string;
}

// Get all bookings for admin
export const getAllBookings = async (): Promise<BookingWithDetails[]> => {
  try {
    const response = await axios.get('/bookings/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    throw error;
  }
};

// Get user's bookings
export const getUserBookings = async (): Promise<BookingWithDetails[]> => {
  try {
    const response = await axios.get('/bookings/my');
    return response.data;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
};

// Get provider's bookings
export const getProviderBookings = async (): Promise<BookingWithDetails[]> => {
  try {
    const response = await axios.get('/provider/bookings');
    return response.data;
  } catch (error) {
    console.error('Error fetching provider bookings:', error);
    throw error;
  }
};

// Create a new booking
export const createBooking = async (bookingData: CreateBookingData): Promise<Booking> => {
  try {
    const response = await axios.post('/bookings', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

// Update a booking
export const updateBooking = async (id: string, bookingData: UpdateBookingData): Promise<Booking> => {
  try {
    const response = await axios.put(`/bookings/${id}`, bookingData);
    return response.data;
  } catch (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
};

// Cancel a booking
export const cancelBooking = async (id: string): Promise<Booking> => {
  try {
    const response = await axios.patch(`/bookings/${id}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};

// Delete a booking
export const deleteBooking = async (id: string): Promise<void> => {
  try {
    await axios.delete(`/bookings/${id}`);
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
};

// Get booking by ID
export const getBookingById = async (id: string): Promise<BookingWithDetails> => {
  try {
    const response = await axios.get(`/bookings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
};

// Get booking statistics
export const getBookingStats = async (): Promise<{
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
}> => {
  try {
    const bookings = await getUserBookings();
    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      completed: bookings.filter(b => b.status === 'completed').length,
    };
    return stats;
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    throw error;
  }
};

// Get provider booking statistics
export const getProviderBookingStats = async (): Promise<{
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  totalEarnings: number;
}> => {
  try {
    const bookings = await getProviderBookings();
    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      totalEarnings: bookings
        .filter(b => b.status === 'completed' && b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + (b.service?.price || 0), 0),
    };
    return stats;
  } catch (error) {
    console.error('Error fetching provider booking stats:', error);
    throw error;
  }
};

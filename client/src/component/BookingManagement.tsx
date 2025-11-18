import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, MapPin, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { 
  getUserBookings, 
  updateBooking, 
  deleteBooking, 
  cancelBooking,
  type BookingWithDetails 
} from '../api/bookings';
import BookingStatus from './BookingStatus';
import BookingNotification, { useBookingNotifications } from './BookingNotification';

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    date: '',
    note: ''
  });

  const { notifications, addNotification, removeNotification } = useBookingNotifications();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getUserBookings();
      setBookings(data);
    } catch (err) {
      setError('Failed to load bookings');
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load your bookings'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (booking: BookingWithDetails) => {
    setEditingId(booking._id);
    setEditData({
      date: booking.date.split('T')[0],
      note: booking.note || ''
    });
  };

  const handleSave = async (id: string) => {
    try {
      const bookingDateTime = new Date(`${editData.date}T12:00:00`);
      await updateBooking(id, {
        date: bookingDateTime.toISOString(),
        note: editData.note
      });
      
      setEditingId(null);
      fetchBookings();
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Booking updated successfully'
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update booking'
      });
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await cancelBooking(id);
      fetchBookings();
      addNotification({
        type: 'success',
        title: 'Booking Cancelled',
        message: 'Your booking has been cancelled'
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to cancel booking'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) return;
    
    try {
      await deleteBooking(id);
      fetchBookings();
      addNotification({
        type: 'success',
        title: 'Booking Deleted',
        message: 'Your booking has been deleted'
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete booking'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchBookings}
          className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-600">Manage your service bookings and appointments</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-500">Start by booking a service to see your appointments here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.service?.name || 'Service'}
                      </h3>
                      <BookingStatus status={booking.status} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(booking.date)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(booking.date)}</span>
                      </div>
                    </div>

                    {booking.service?.provider && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Service Provider</h4>
                        <div className="flex items-center space-x-2 text-gray-600 mb-1">
                          <User className="w-4 h-4" />
                          <span>{booking.service.provider.name}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 mb-1">
                          <Mail className="w-4 h-4" />
                          <span>{booking.service.provider.email}</span>
                        </div>
                        {booking.service.provider.phone && (
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{booking.service.provider.phone}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                      {editingId === booking._id ? (
                        <textarea
                          value={editData.note}
                          onChange={(e) => setEditData(prev => ({ ...prev, note: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          rows={3}
                          placeholder="Add any special requirements..."
                        />
                      ) : (
                        <p className="text-gray-600">
                          {booking.note || 'No notes added'}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Price: {booking.service?.price || 0} ETB</span>
                      <span>Created: {formatDate(booking.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    {editingId === booking._id ? (
                      <>
                        <button
                          onClick={() => handleSave(booking._id)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </>
                    ) : (
                      <>
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleEdit(booking)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                        )}
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleCancel(booking._id)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Cancel</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(booking._id)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BookingNotification
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
};

export default BookingManagement;

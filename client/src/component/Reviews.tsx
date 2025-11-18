import React, { useState, useEffect } from 'react';
import { Star, Trash2, Edit2, Check, X } from 'lucide-react';
import {
  getServiceReviews,
  createReview,
  updateReview,
  deleteReview,
  type Review,
  type ReviewResponse,
} from '../api/reviews';
import axios from '../api/axios';

interface ReviewsProps {
  serviceId: string;
}

const Reviews: React.FC<ReviewsProps> = ({ serviceId }) => {
  const [reviewsData, setReviewsData] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    fetchCurrentUser();
    fetchReviews();
  }, [serviceId]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get('/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(response.data);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getServiceReviews(serviceId);
      setReviewsData(data);
      setError('');
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please login to leave a review');
      return;
    }

    try {
      if (editingReview) {
        await updateReview(editingReview._id, {
          rating: formData.rating,
          comment: formData.comment,
        });
      } else {
        await createReview({
          serviceId,
          rating: formData.rating,
          comment: formData.comment,
        });
      }
      setFormData({ rating: 5, comment: '' });
      setShowForm(false);
      setEditingReview(null);
      fetchReviews();
    } catch (err: any) {
      console.error('Error submitting review:', err);
      alert(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setFormData({
      rating: review.rating,
      comment: review.comment,
    });
    setShowForm(true);
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await deleteReview(reviewId);
      fetchReviews();
    } catch (err: any) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review');
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-yellow-600';
    if (rating >= 3.0) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const averageRating = reviewsData?.averageRating
    ? parseFloat(reviewsData.averageRating)
    : 0;
  const totalReviews = reviewsData?.totalReviews || 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Reviews & Ratings
          </h2>
          {totalReviews > 0 && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Star
                  size={24}
                  className={`${getRatingColor(averageRating)} fill-current`}
                />
                <span
                  className={`text-2xl font-bold ${getRatingColor(averageRating)}`}
                >
                  {averageRating}
                </span>
              </div>
              <span className="text-gray-600">
                ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>
        {currentUser && !showForm && !editingReview && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Rating Distribution */}
      {reviewsData?.ratingDistribution && totalReviews > 0 && (
        <div className="grid grid-cols-5 gap-2 pt-4 border-t border-gray-200">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = reviewsData.ratingDistribution[rating as keyof typeof reviewsData.ratingDistribution] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={rating} className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Star
                    size={16}
                    className={`${getRatingColor(rating)} fill-current`}
                  />
                  <span className="text-sm font-semibold">{rating}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div
                    className={`h-2 rounded-full ${
                      rating >= 4
                        ? 'bg-green-500'
                        : rating >= 3
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600">{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {editingReview ? 'Edit Your Review' : 'Write a Review'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating *
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: parseInt(e.target.value) })
                  }
                  className="flex-1"
                />
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: i + 1 })}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        size={24}
                        className={
                          i < formData.rating
                            ? 'fill-yellow-400 text-yellow-400 cursor-pointer'
                            : 'text-gray-300 cursor-pointer'
                        }
                      />
                    </button>
                  ))}
                </div>
                <span className="text-lg font-semibold text-orange-600 w-12">
                  {formData.rating}/5
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) =>
                  setFormData({ ...formData, comment: e.target.value })
                }
                required
                rows={4}
                placeholder="Share your experience with this service..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium"
              >
                {editingReview ? 'Update Review' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingReview(null);
                  setFormData({ rating: 5, comment: '' });
                }}
                className="px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {totalReviews === 0 ? (
        <div className="text-center py-12">
          <Star size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">No reviews yet</p>
          <p className="text-gray-500">
            Be the first to review this service!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviewsData?.reviews.map((review) => (
            <div
              key={review._id}
              className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {review.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {review.user.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }
                      />
                    ))}
                  </div>
                  {currentUser &&
                    (currentUser.id === review.user._id || currentUser._id === review.user._id) && (
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(review)}
                          className="p-1.5 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;


import React, { useState } from "react";
import axios from "../../api/axios";
import { Star, Send, CheckCircle } from "lucide-react";

const SubmitTestimonial = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    photo: "",
    text: "",
    rating: 5,
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rating" ? parseInt(value) || 5 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post("/testimonials", formData);
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        photo: "",
        text: "",
        rating: 5,
      });
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to submit testimonial");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pt-20">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white p-10 shadow-xl rounded-2xl border border-orange-100 text-center">
            <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Thank You!
            </h2>
            <p className="text-gray-600 mb-6">
              Your testimonial has been submitted successfully. It will be reviewed
              and published shortly.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setSubmitted(false)}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition font-semibold"
              >
                Submit Another
              </button>
              <a
                href="/about"
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                View About Page
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pt-20">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white p-10 shadow-xl rounded-2xl border border-orange-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-orange-600 mb-3">
              Share Your Experience
            </h1>
            <p className="text-gray-600">
              We'd love to hear about your experience with Gezana Digital Solutions
            </p>
            <div className="w-24 h-1 bg-orange-500 mx-auto mt-4 rounded-full" />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (Optional - for verification only)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                We won't display your email publicly
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Photo URL (Optional)
              </label>
              <input
                type="url"
                name="photo"
                value={formData.photo}
                onChange={handleInputChange}
                placeholder="https://example.com/your-photo.jpg"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              {formData.photo && (
                <img
                  src={formData.photo}
                  alt="Preview"
                  className="mt-2 w-16 h-16 rounded-full object-cover border-2 border-orange-300"
                />
              )}
              <p className="text-xs text-gray-500 mt-1">
                A default avatar will be used if you don't provide a photo
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating *
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  name="rating"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={handleInputChange}
                  className="flex-1"
                />
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={24}
                      className={
                        i < formData.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-orange-600 w-12">
                  {formData.rating}/5
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Testimonial *
              </label>
              <textarea
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                required
                rows={6}
                placeholder="Tell us about your experience with our services..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Please share specific details about what you liked
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white px-6 py-4 rounded-lg hover:bg-orange-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                "Submitting..."
              ) : (
                <>
                  <Send size={20} />
                  Submit Testimonial
                </>
              )}
            </button>

            <p className="text-xs text-center text-gray-500 mt-4">
              Your testimonial will be reviewed before being published on our website.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitTestimonial;


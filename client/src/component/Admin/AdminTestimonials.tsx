import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import { Edit, Trash2, Check, X, Eye, EyeOff, Star } from "lucide-react";

type Testimonial = {
  _id: string;
  name: string;
  email?: string;
  photo: string;
  text: string;
  rating: number;
  isApproved: boolean;
  isActive: boolean;
  order: number;
  createdAt: string;
};

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved">("all");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    photo: "",
    text: "",
    rating: 5,
    order: 0,
    isApproved: false,
    isActive: true,
  });

  const fetchTestimonials = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get<Testimonial[]>("/testimonials/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTestimonials(res.data);
      setError(null);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch testimonials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "order" || name === "rating" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      if (editingTestimonial) {
        // Update existing testimonial
        await axios.put(`/testimonials/${editingTestimonial._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Create new testimonial (admin can create pre-approved ones)
        await axios.post("/testimonials", { ...formData, isApproved: formData.isApproved }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setShowModal(false);
      setEditingTestimonial(null);
      setFormData({
        name: "",
        email: "",
        photo: "",
        text: "",
        rating: 5,
        order: 0,
        isApproved: false,
        isActive: true,
      });
      fetchTestimonials();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save testimonial");
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      email: testimonial.email || "",
      photo: testimonial.photo,
      text: testimonial.text,
      rating: testimonial.rating,
      order: testimonial.order,
      isApproved: testimonial.isApproved,
      isActive: testimonial.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/testimonials/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTestimonials();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete testimonial");
    }
  };

  const handleApprove = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`/testimonials/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTestimonials();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to approve testimonial");
    }
  };

  const handleReject = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`/testimonials/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTestimonials();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to reject testimonial");
    }
  };

  const handleToggleActive = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`/testimonials/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTestimonials();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to toggle testimonial status");
    }
  };

  const filteredTestimonials = testimonials.filter((testimonial) => {
    if (filterStatus === "pending") return !testimonial.isApproved;
    if (filterStatus === "approved") return testimonial.isApproved;
    return true;
  });

  const pendingCount = testimonials.filter(t => !t.isApproved).length;

  if (loading) return <p className="p-6">Loading testimonials...</p>;

  return (
    <div className="p-6 bg-orange-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Testimonials Management</h2>
        
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === "all"
                ? "bg-orange-600 text-white"
                : "bg-white text-gray-700 hover:bg-orange-100"
            }`}
          >
            All ({testimonials.length})
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-4 py-2 rounded-lg font-medium transition relative ${
              filterStatus === "pending"
                ? "bg-orange-600 text-white"
                : "bg-white text-gray-700 hover:bg-orange-100"
            }`}
          >
            Pending ({pendingCount})
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterStatus("approved")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === "approved"
                ? "bg-orange-600 text-white"
                : "bg-white text-gray-700 hover:bg-orange-100"
            }`}
          >
            Approved ({testimonials.filter(t => t.isApproved).length})
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Testimonials List */}
      {filteredTestimonials.length === 0 ? (
        <p className="text-gray-600">No testimonials found in this category.</p>
      ) : (
        <div className="space-y-4">
          {filteredTestimonials.map((testimonial) => (
            <div
              key={testimonial._id}
              className={`bg-white rounded-xl shadow-md p-6 ${
                !testimonial.isActive ? "opacity-60 border-2 border-red-300" : ""
              } ${
                !testimonial.isApproved ? "border-l-4 border-yellow-500" : ""
              }`}
            >
              <div className="flex gap-4">
                {/* User Photo */}
                <img
                  src={testimonial.photo}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-orange-300"
                />

                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {testimonial.name}
                      </h3>
                      {testimonial.email && (
                        <p className="text-sm text-gray-500">{testimonial.email}</p>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < testimonial.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          testimonial.isApproved
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {testimonial.isApproved ? "Approved" : "Pending"}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          testimonial.isActive
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {testimonial.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 italic mb-3">"{testimonial.text}"</p>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Order: {testimonial.order} | Submitted: {new Date(testimonial.createdAt).toLocaleDateString()}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {!testimonial.isApproved && (
                        <button
                          onClick={() => handleApprove(testimonial._id)}
                          className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                          title="Approve"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      {testimonial.isApproved && (
                        <button
                          onClick={() => handleReject(testimonial._id)}
                          className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition"
                          title="Unapprove"
                        >
                          <X size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleActive(testimonial._id)}
                        className={`p-2 rounded-lg transition ${
                          testimonial.isActive
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        }`}
                        title={testimonial.isActive ? "Deactivate" : "Activate"}
                      >
                        {testimonial.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button
                        onClick={() => handleEdit(testimonial)}
                        className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial._id)}
                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              {editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo URL *
                </label>
                <input
                  type="url"
                  name="photo"
                  value={formData.photo}
                  onChange={handleInputChange}
                  required
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                {formData.photo && (
                  <img
                    src={formData.photo}
                    alt="Preview"
                    className="mt-2 w-16 h-16 rounded-full object-cover border-2 border-orange-300"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Testimonial Text *
                </label>
                <textarea
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="What did the client say about your service?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (1-5)
                </label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  min="1"
                  max="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isApproved"
                    checked={formData.isApproved}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isApproved: e.target.checked }))
                    }
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">
                    Approved
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                    }
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition font-semibold"
                >
                  {editingTestimonial ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTestimonial(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTestimonials;


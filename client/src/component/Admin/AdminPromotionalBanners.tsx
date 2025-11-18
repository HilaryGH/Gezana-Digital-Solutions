import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X } from "lucide-react";
import {
  getAllPromotionalBanners,
  createPromotionalBanner,
  updatePromotionalBanner,
  deletePromotionalBanner,
  type PromotionalBanner,
} from "../../api/promotionalBanners";

const AdminPromotionalBanners = () => {
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromotionalBanner | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    icon: "✨",
    backgroundColor: "from-blue-500 via-blue-600 to-blue-700",
    textColor: "text-white",
    buttonText: "Learn More",
    buttonLink: "/services",
    isActive: true,
    order: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await getAllPromotionalBanners();
      setBanners(data);
    } catch (error) {
      console.error("Error fetching banners:", error);
      alert("Failed to fetch promotional banners");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (banner?: PromotionalBanner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle || "",
        description: banner.description || "",
        icon: banner.icon || "✨",
        backgroundColor: banner.backgroundColor || "from-blue-500 via-blue-600 to-blue-700",
        textColor: banner.textColor || "text-white",
        buttonText: banner.buttonText || "Learn More",
        buttonLink: banner.buttonLink || "/services",
        isActive: banner.isActive,
        order: banner.order,
        startDate: banner.startDate ? new Date(banner.startDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        endDate: banner.endDate ? new Date(banner.endDate).toISOString().split("T")[0] : "",
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: "",
        subtitle: "",
        description: "",
        icon: "✨",
        backgroundColor: "from-blue-500 via-blue-600 to-blue-700",
        textColor: "text-white",
        buttonText: "Learn More",
        buttonLink: "/services",
        isActive: true,
        order: 0,
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBanner(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await updatePromotionalBanner(editingBanner.id, formData);
      } else {
        await createPromotionalBanner(formData);
      }
      await fetchBanners();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving banner:", error);
      alert("Failed to save promotional banner");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotional banner?")) return;
    try {
      await deletePromotionalBanner(id);
      await fetchBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
      alert("Failed to delete promotional banner");
    }
  };

  const toggleActive = async (banner: PromotionalBanner) => {
    try {
      await updatePromotionalBanner(banner.id, { isActive: !banner.isActive });
      await fetchBanners();
    } catch (error) {
      console.error("Error toggling banner status:", error);
      alert("Failed to update banner status");
    }
  };

  const gradientPresets = [
    { name: "Blue", value: "from-blue-500 via-blue-600 to-blue-700" },
    { name: "Green", value: "from-green-500 via-green-600 to-green-700" },
    { name: "Pink", value: "from-pink-500 via-pink-600 to-purple-700" },
    { name: "Orange", value: "from-orange-500 via-orange-600 to-orange-700" },
    { name: "Purple", value: "from-purple-500 via-purple-600 to-purple-700" },
    { name: "Teal", value: "from-teal-500 via-teal-600 to-teal-700" },
  ];

  if (loading && banners.length === 0) {
    return <div className="p-6">Loading promotional banners...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Promotional Banners</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => {
          const gradientClasses = banner.backgroundColor || "from-blue-500 via-blue-600 to-blue-700";
          const textColorClass = banner.textColor || "text-white";
          
          return (
            <div key={banner.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Banner Preview */}
              <div className={`relative h-48 bg-gradient-to-br ${gradientClasses} p-6 ${textColorClass}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-xl">{banner.icon || "✨"}</span>
                  </div>
                  <h3 className="text-xl font-bold truncate">{banner.title}</h3>
                </div>
                {banner.subtitle && (
                  <p className="text-sm opacity-90 truncate">{banner.subtitle}</p>
                )}
                <div className="absolute top-2 right-2">
                  {banner.isActive ? (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Active</span>
                  ) : (
                    <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">Inactive</span>
                  )}
                </div>
              </div>

              {/* Banner Info */}
              <div className="p-4">
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Order:</span> {banner.order}
                  </p>
                  {banner.endDate && (
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Expires:</span>{" "}
                      {new Date(banner.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(banner)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      banner.isActive
                        ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    {banner.isActive ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Activate
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleOpenModal(banner)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="flex items-center justify-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {banners.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No promotional banners yet</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
          >
            Create your first banner
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingBanner ? "Edit Banner" : "Create New Banner"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="✨"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Gradient
                </label>
                <select
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {gradientPresets.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {preset.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Color
                </label>
                <select
                  value={formData.textColor}
                  onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="text-white">White</option>
                  <option value="text-black">Black</option>
                  <option value="text-gray-900">Dark Gray</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  {editingBanner ? "Update Banner" : "Create Banner"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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

export default AdminPromotionalBanners;


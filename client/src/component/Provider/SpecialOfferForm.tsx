import { useState, useEffect } from "react";
import axios from "../../api/axios";
import { X, Calendar, DollarSign, Percent, Tag } from "lucide-react";

interface Service {
  _id: string;
  name: string;
  price: number;
}

interface SpecialOffer {
  _id: string;
  service: {
    _id: string;
    name: string;
    price: number;
  };
  title: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  originalPrice: number;
  startDate: string;
  endDate: string;
  maxUses: number | null;
  image?: string;
  terms?: string;
}

interface SpecialOfferFormProps {
  offer?: SpecialOffer | null;
  onClose: () => void;
  onSuccess: () => void;
}

const SpecialOfferForm = ({ offer, onClose, onSuccess }: SpecialOfferFormProps) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(offer?.image || null);
  const [formData, setFormData] = useState({
    service: offer?.service._id || "",
    title: offer?.title || "",
    description: offer?.description || "",
    discountType: offer?.discountType || "percentage",
    discountValue: offer?.discountValue || 0,
    originalPrice: offer?.originalPrice || 0,
    startDate: offer?.startDate ? new Date(offer.startDate).toISOString().split("T")[0] : "",
    endDate: offer?.endDate ? new Date(offer.endDate).toISOString().split("T")[0] : "",
    maxUses: offer?.maxUses?.toString() || "",
    terms: offer?.terms || "",
  });

  useEffect(() => {
    fetchServices();
    if (offer?.service) {
      setFormData((prev) => ({
        ...prev,
        originalPrice: offer.service.price,
      }));
      if (offer.image) {
        setImagePreview(offer.image);
      }
    } else {
      // Set default start date to today if creating new offer
      const today = new Date().toISOString().split("T")[0];
      setFormData((prev) => ({
        ...prev,
        startDate: prev.startDate || today,
      }));
    }
  }, [offer]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("File selected:", {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      });
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, GIF, or WEBP)');
        e.target.value = ''; // Clear the input
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        e.target.value = ''; // Clear the input
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      console.log("No file selected");
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/services/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter only active services
      const activeServices = Array.isArray(response.data) 
        ? response.data.filter((s: any) => s.isAvailable !== false)
        : [];
      setServices(activeServices);
    } catch (error) {
      console.error("Error fetching services:", error);
      alert("Failed to load services. Please refresh the page.");
    }
  };

  const handleServiceChange = (serviceId: string) => {
    const selectedService = services.find((s) => s._id === serviceId);
    setFormData((prev) => ({
      ...prev,
      service: serviceId,
      originalPrice: selectedService?.price || 0,
    }));
  };

  const calculateDiscountedPrice = () => {
    if (!formData.originalPrice || !formData.discountValue) return 0;
    if (formData.discountType === "percentage") {
      return formData.originalPrice * (1 - formData.discountValue / 100);
    } else {
      return formData.originalPrice - formData.discountValue;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.service) {
        alert("Please select a service");
        setLoading(false);
        return;
      }

      if (!formData.title.trim()) {
        alert("Please enter an offer title");
        setLoading(false);
        return;
      }

      if (!formData.description.trim()) {
        alert("Please enter an offer description");
        setLoading(false);
        return;
      }

      if (formData.discountValue <= 0) {
        alert("Discount value must be greater than 0");
        setLoading(false);
        return;
      }

      if (formData.discountType === "percentage" && formData.discountValue > 100) {
        alert("Percentage discount cannot exceed 100%");
        setLoading(false);
        return;
      }

      if (formData.discountType === "fixed" && formData.discountValue >= formData.originalPrice) {
        alert("Fixed discount cannot be greater than or equal to the original price");
        setLoading(false);
        return;
      }

      if (!formData.startDate || !formData.endDate) {
        alert("Please select both start and end dates");
        setLoading(false);
        return;
      }

      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate <= startDate) {
        alert("End date must be after start date");
        setLoading(false);
        return;
      }

      // Check if image is provided (required for new offers)
      if (!offer && !imageFile) {
        alert("Please upload an offer image");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      const discountedPrice = calculateDiscountedPrice();

      if (discountedPrice < 0) {
        alert("Discounted price cannot be negative. Please adjust your discount.");
        setLoading(false);
        return;
      }

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("service", formData.service);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("discountType", formData.discountType);
      formDataToSend.append("discountValue", formData.discountValue.toString());
      formDataToSend.append("originalPrice", formData.originalPrice.toString());
      formDataToSend.append("startDate", formData.startDate);
      formDataToSend.append("endDate", formData.endDate);
      if (formData.maxUses) {
        formDataToSend.append("maxUses", formData.maxUses);
      }
      if (formData.terms) {
        formDataToSend.append("terms", formData.terms);
      }
      
      // Append image file - required for new offers, optional for updates
      if (!imageFile && !offer) {
        // For new offers, image is required
        alert("Please upload an offer image");
        setLoading(false);
        return;
      }
      
      if (imageFile) {
        console.log("Appending image file to FormData:", {
          name: imageFile.name,
          type: imageFile.type,
          size: imageFile.size,
          isFile: imageFile instanceof File
        });
        // Append file with explicit filename
        formDataToSend.append("image", imageFile, imageFile.name);
      }
      
      // Log FormData contents for debugging
      console.log("FormData entries before sending:");
      for (let pair of formDataToSend.entries()) {
        if (pair[1] instanceof File) {
          console.log(pair[0] + ': File -', pair[1].name, pair[1].type, pair[1].size + ' bytes');
        } else {
          console.log(pair[0] + ':', pair[1]);
        }
      }

      if (offer) {
        // Update existing offer
        await axios.put(`/special-offers/${offer._id}`, formDataToSend, {
          headers: { 
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type - let browser set it with boundary
          },
        });
        alert("Special offer updated successfully!");
      } else {
        // Create new offer
        await axios.post("/special-offers", formDataToSend, {
          headers: { 
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type - let browser set it with boundary
          },
        });
        alert("Special offer created successfully!");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving offer:", error);
      const errorMessage = error.response?.data?.message || "Failed to save special offer";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const discountedPrice = calculateDiscountedPrice();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-orange-600" />
            {offer ? "Edit Special Offer" : "Create Special Offer"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Service Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Service <span className="text-red-500">*</span>
            </label>
            {services.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  No active services found. Please create a service first before adding a special offer.
                </p>
              </div>
            ) : (
              <select
                value={formData.service}
                onChange={(e) => handleServiceChange(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.name} - {service.price.toFixed(2)} ETB
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Offer Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="e.g., Summer Sale - 30% Off"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              placeholder="Describe your special offer..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Discount Type and Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Discount Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.discountType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountType: e.target.value as "percentage" | "fixed",
                  })
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Discount Value <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {formData.discountType === "percentage" ? (
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                ) : (
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                )}
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })
                  }
                  required
                  min="0"
                  step={formData.discountType === "percentage" ? "1" : "0.01"}
                  placeholder={formData.discountType === "percentage" ? "30" : "100"}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Pricing Display */}
          {formData.originalPrice > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Original Price</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formData.originalPrice.toFixed(2)} ETB
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Discount</p>
                  <p className="text-lg font-semibold text-red-600">
                    {formData.discountType === "percentage"
                      ? `${formData.discountValue}%`
                      : `${formData.discountValue} ETB`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Discounted Price</p>
                  <p className="text-lg font-bold text-orange-600">
                    {discountedPrice.toFixed(2)} ETB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                  min={formData.startDate || new Date().toISOString().split("T")[0]}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Max Uses */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Maximum Uses (Optional)
            </label>
            <input
              type="number"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
              min="1"
              placeholder="Leave empty for unlimited"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Limit how many times this offer can be used. Leave empty for unlimited uses.
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Offer Image <span className="text-red-500">*</span>
            </label>
            {imagePreview ? (
              <div className="space-y-2">
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300">
                  <img
                    src={imagePreview}
                    alt="Offer preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500">Upload a new image to replace the current one</p>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={!offer}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload an image for your offer (Max size: 5MB, Formats: JPG, PNG)
                </p>
              </div>
            )}
          </div>

          {/* Terms */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Terms & Conditions (Optional)
            </label>
            <textarea
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              rows={3}
              placeholder="Add any terms and conditions for this offer..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{offer ? "Updating..." : "Creating..."}</span>
                </>
              ) : (
                <span>{offer ? "Update Offer" : "Create Offer"}</span>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all duration-300 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SpecialOfferForm;


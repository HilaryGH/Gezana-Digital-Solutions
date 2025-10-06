import { useState, useEffect } from "react";
import { createService, type CreateServiceData } from "../../api/services";


interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
}

// Service categories with comprehensive subcategories
const serviceCategories: Category[] = [
  {
    id: '1',
    name: 'Home Maintenance',
    icon: '🔧',
    subcategories: ['Plumbing', 'Electrical', 'Carpentry', 'General Repairs', 'Door & Window Repair', 'Furniture Assembly', 'TV Mounting', 'Roofing', 'Flooring', 'HVAC Services', 'Handyman Services', 'Lock Installation', 'Shelf Installation', 'Cabinet Installation', 'Light Fixture Installation']
  },
  {
    id: '2',
    name: 'Cleaning Services',
    icon: '🧹',
    subcategories: ['Residential Cleaning', 'Carpet Washing', 'Pest Control', 'Deep Cleaning', 'Move-in/Move-out Cleaning', 'Post-Construction Cleaning', 'Window Cleaning', 'Office Cleaning', 'Upholstery Cleaning', 'Appliance Cleaning', 'Gutter Cleaning', 'Pressure Washing', 'Green Cleaning', 'Sanitization Services', 'Event Cleanup', 'Regular Maintenance']
  },
  {
    id: '3',
    name: 'Appliance Repair',
    icon: '⚙️',
    subcategories: ['Refrigerator Repair', 'AC Repair', 'Washing Machine Repair', 'Dryer Repair', 'Dishwasher Repair', 'Oven Repair', 'Microwave Repair', 'Water Heater Repair', 'Garbage Disposal Repair', 'Ice Maker Repair', 'Stove Repair', 'Freezer Repair', 'Appliance Installation', 'Appliance Maintenance', 'Emergency Repair', 'Warranty Service']
  },
  {
    id: '4',
    name: 'Personal Care',
    icon: '💄',
    subcategories: ['Haircut', 'Hairstyle', 'Facial', 'Manicure & Pedicure', 'Makeup Services', 'Eyebrow Shaping', 'Hair Coloring', 'Spa Treatments', 'Massage Therapy', 'Beauty Consultation', 'Hair Styling', 'Nail Art', 'Bridal Makeup', 'Skincare Treatment', 'Hair Treatment', 'Beauty Therapy']
  },
  {
    id: '5',
    name: 'Housemaid Services',
    icon: '👩‍💼',
    subcategories: ['Daily Housekeeping', 'Cooking Services', 'Laundry Services', 'Ironing Services', 'Grocery Shopping', 'Child Care Assistance', 'Elderly Care', 'Pet Care', 'Meal Preparation', 'Home Organization', 'Personal Assistant', 'Companion Care', 'Special Needs Care', 'Overnight Care', 'Tutoring Services', 'After School Care']
  },
  {
    id: '6',
    name: 'Hotel/Lounge Services',
    icon: '🏨',
    subcategories: ['Room Service', 'Concierge', 'Housekeeping', 'Event Planning', 'Catering', 'Spa Services', 'Front Desk', 'Guest Services', 'Bartending', 'Waitressing', 'VIP Services', 'Reception Services', 'Security Services', 'Valet Services', 'Bell Services', 'Guest Relations']
  }
];

const AddService: React.FC = () => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [priceType, setPriceType] = useState<'fixed' | 'hourly' | 'per_sqft' | 'custom'>('fixed');
  const [location, setLocation] = useState("");
  const [servicePhoto, setServicePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [filteredSubcategories, setFilteredSubcategories] = useState<string[]>([]);

  // Filter subcategories by selected category
  useEffect(() => {
    if (!category) {
      setFilteredSubcategories([]);
      setSubcategory("");
      return;
    }
    const selectedCategory = serviceCategories.find(cat => cat.id === category);
    if (selectedCategory) {
      setFilteredSubcategories(selectedCategory.subcategories);
      setSubcategory("");
    }
  }, [category]);

  // Handle photo upload and preview
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setServicePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove photo
  const removePhoto = () => {
    setServicePhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Login required to add services");
        return;
      }

      // Get category name from the selected category ID
      const selectedCategory = serviceCategories.find(cat => cat.id === category);
      const categoryName = selectedCategory ? selectedCategory.name : category;

      const serviceData: CreateServiceData = {
        title,
        description,
        category: categoryName,
        subcategory,
        price: Number(price),
        priceType,
        location,
        photos: servicePhoto ? [servicePhoto] : []
      };

      const res = await createService(serviceData);
      setMessage(`Service "${res.title}" created successfully!`);

      // Reset form
      setTitle("");
      setCategory("");
      setSubcategory("");
      setDescription("");
      setPrice("");
      setLocation("");
      setPriceType('fixed');
      setServicePhoto(null);
      setPhotoPreview(null);
      setFilteredSubcategories([]);
    } catch (err: any) {
      console.error('Service creation error:', err);
      setMessage(err.response?.data?.message || err.message || "Failed to add service");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {message && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 font-medium">{message}</p>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        encType="multipart/form-data"
      >
        {/* Service Title */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Service Title *
          </label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter service title"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          />
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Service Category *
          </label>
        <select
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          >
            <option value="">Select a category</option>
            {serviceCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
            </option>
          ))}
        </select>
        </div>

        {/* Subcategory Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Service Type *
          </label>
          <select
            required
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={!filteredSubcategories.length}
          >
            <option value="">Select service type</option>
            {filteredSubcategories.map((subcategoryOption, index) => (
              <option key={index} value={subcategoryOption}>
                {subcategoryOption}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Description
          </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your service in detail..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
          rows={4}
        />
        </div>

        {/* Price and Price Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Price (ETB) *
            </label>
            <input
              required
              type="number"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="Enter service price"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Price Type *
            </label>
            <select
              required
              value={priceType}
              onChange={(e) => setPriceType(e.target.value as 'fixed' | 'hourly' | 'per_sqft' | 'custom')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            >
              <option value="fixed">Fixed Price</option>
              <option value="hourly">Per Hour</option>
              <option value="per_sqft">Per Square Foot</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Service Location *
          </label>
          <input
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter service location (e.g., Addis Ababa, Ethiopia)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          />
        </div>

        {/* Service Photo Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Service Photo
          </label>
          
          {photoPreview ? (
            <div className="relative">
              <div className="w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={photoPreview}
                  alt="Service preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors">
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Upload service photo</p>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 10MB</p>
                </div>
        <input
          type="file"
                  accept="image/png,image/jpg,image/jpeg"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Choose Photo
        </label>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Create Service
        </button>
      </form>
    </div>
  );
};

export default AddService;

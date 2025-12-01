import { useState, useEffect } from "react";
import axios from "../../api/axios";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Tag, Calendar, DollarSign, AlertCircle, Crown } from "lucide-react";
import SpecialOfferForm from "./SpecialOfferForm";
import { getCardImageUrl, handleImageError } from "../../utils/imageHelper";

interface SpecialOffer {
  _id: string;
  service: {
    _id: string;
    name: string;
    price: number;
    photos?: string[];
  };
  title: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  originalPrice: number;
  discountedPrice: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  maxUses: number | null;
  currentUses: number;
  image?: string;
  terms?: string;
}

const SpecialOffers = () => {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPremium, setHasPremium] = useState(false);
  const [premiumInfo, setPremiumInfo] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<SpecialOffer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkPremiumStatus();
    fetchOffers();
    
    // Check if user just returned from payment success
    const checkPaymentReturn = () => {
      const paymentSuccess = sessionStorage.getItem('premiumPaymentSuccess');
      if (paymentSuccess === 'true') {
        // Refresh premium status after payment
        setTimeout(() => {
          checkPremiumStatus();
          sessionStorage.removeItem('premiumPaymentSuccess');
        }, 1000);
      }
    };
    
    checkPaymentReturn();
    
    // Also listen for storage events (in case payment success happens in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'premiumPaymentSuccess' && e.newValue === 'true') {
        setTimeout(() => {
          checkPremiumStatus();
          sessionStorage.removeItem('premiumPaymentSuccess');
        }, 1000);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/special-offers/check-premium/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        const hasPremium = response.data.hasPremium;
        setHasPremium(hasPremium);
        setPremiumInfo(response.data);
        console.log("Premium status check:", {
          hasPremium,
          premiumMembership: response.data.premiumMembership,
          subscription: response.data.subscription,
        });
      }
    } catch (error: any) {
      console.error("Error checking premium status:", error);
      console.error("Error response:", error.response?.data);
    }
  };

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/special-offers/my-offers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setOffers(response.data.offers);
      }
    } catch (error: any) {
      console.error("Error fetching offers:", error);
      setError(error.response?.data?.message || "Failed to fetch special offers");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `/special-offers/${id}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchOffers();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to toggle offer");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this special offer?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/special-offers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOffers();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete offer");
    }
  };

  const handleEdit = (offer: SpecialOffer) => {
    setEditingOffer(offer);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingOffer(null);
    fetchOffers();
  };

  const isOfferValid = (offer: SpecialOffer) => {
    const now = new Date();
    const start = new Date(offer.startDate);
    const end = new Date(offer.endDate);
    return (
      offer.isActive &&
      start <= now &&
      end >= now &&
      (offer.maxUses === null || offer.currentUses < offer.maxUses)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-orange-600" />
            Special Offers
          </h2>
          <p className="text-gray-600 mt-1">Create and manage special offers for your services</p>
        </div>
        {hasPremium ? (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Offer
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Crown className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">Premium Required</span>
          </div>
        )}
      </div>

      {/* Premium Status Alert */}
      {!hasPremium && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-1">Premium Membership Required</h3>
              <p className="text-sm text-yellow-800 mb-3">
                You need an active premium membership to create special offers. Upgrade to premium to unlock this feature and attract more customers with exclusive deals.
              </p>
              <a
                href="/premium-membership"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
              >
                <Crown className="w-4 h-4" />
                View Premium Plans
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Offers List */}
      {offers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Special Offers Yet</h3>
          <p className="text-gray-600 mb-4">
            {hasPremium
              ? "Create your first special offer to attract more customers with exclusive deals"
              : "Upgrade to premium to start creating special offers"}
          </p>
          {hasPremium && (
            <div className="space-y-3">
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold shadow-lg"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Create Your First Offer
              </button>
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-2xl mx-auto">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for Creating Effective Offers:</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Choose a service that you want to promote</li>
                  <li>Set an attractive discount (10-50% is common)</li>
                  <li>Use clear, compelling titles (e.g., "Summer Sale - 30% Off")</li>
                  <li>Set dates that give customers enough time to book</li>
                  <li>Add terms and conditions if needed</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => {
            const isValid = isOfferValid(offer);
            return (
              <div
                key={offer._id}
                className={`bg-white rounded-lg shadow-md border-2 overflow-hidden transition-all ${
                  isValid ? "border-green-200" : "border-gray-200"
                }`}
              >
                {/* Offer Image or Service Photo */}
                {offer.image || (offer.service.photos && offer.service.photos.length > 0) ? (
                  <div className="h-40 bg-gray-200 overflow-hidden">
                    <img
                      src={getCardImageUrl(offer.image || offer.service.photos[0]) || offer.image || offer.service.photos[0]}
                      alt={offer.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={handleImageError}
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                    <Tag className="w-12 h-12 text-white opacity-50" />
                  </div>
                )}

                {/* Offer Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 text-lg">{offer.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        isValid
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {isValid ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{offer.description}</p>

                  {/* Service Info */}
                  <div className="mb-3 pb-3 border-b border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Service</p>
                    <p className="text-sm font-medium text-gray-900">{offer.service.name}</p>
                  </div>

                  {/* Pricing */}
                  <div className="mb-3 pb-3 border-b border-gray-200">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-orange-600">
                        {offer.discountedPrice.toFixed(2)} ETB
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {offer.originalPrice.toFixed(2)} ETB
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
                        {offer.discountType === "percentage"
                          ? `${offer.discountValue}% OFF`
                          : `${offer.discountValue} ETB OFF`}
                      </span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="mb-3 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(offer.startDate).toLocaleDateString()} -{" "}
                        {new Date(offer.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    {offer.maxUses !== null && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>
                          Uses: {offer.currentUses} / {offer.maxUses}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleToggle(offer._id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        offer.isActive
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {offer.isActive ? (
                        <>
                          <ToggleRight className="w-4 h-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4" />
                          Activate
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(offer)}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(offer._id)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <SpecialOfferForm
          offer={editingOffer}
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      )}
    </div>
  );
};

export default SpecialOffers;


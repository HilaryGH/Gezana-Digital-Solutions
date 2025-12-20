import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, FileText, Download, Eye, Building, Mail, Phone, 
  MapPin, Star, Calendar, Award, Shield, CheckCircle, User,
  ExternalLink, Image as ImageIcon, Video, File
} from "lucide-react";
import axios from "../api/axios";

interface ProviderDetails {
  _id: string;
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  alternativePhone?: string;
  officePhone?: string;
  whatsapp?: string;
  telegram?: string;
  address?: string;
  city?: string;
  location?: string;
  subRole?: string;
  serviceCategory?: string;
  freelanceSubCategory?: string;
  gender?: string;
  femaleLedOrOwned?: boolean;
  tin?: string;
  branches?: any[];
  banks?: any[];
  businessStatus?: string;
  createdAt: string;
  averageRating: number;
  totalReviews: number;
  totalServices: number;
  documents: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  services: Array<{
    _id: string;
    name: string;
    price: number;
    description?: string;
    category?: string;
    type?: string;
    photos?: string[];
    createdAt: string;
  }>;
}

const ProviderDetails = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<ProviderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (providerId) {
      fetchProviderDetails();
    }
  }, [providerId]);

  const fetchProviderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.get(`/provider/details/${providerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setProvider(response.data.provider);
      }
    } catch (err: any) {
      console.error("Error fetching provider details:", err);
      if (err.response?.status === 403) {
        setError(err.response?.data?.message || "Premium subscription required to view provider details");
      } else {
        setError(err.response?.data?.message || "Failed to load provider details");
      }
    } finally {
      setLoading(false);
    }
  };

  const getDocumentIcon = (type: string) => {
    if (type.includes("Photo") || type === "photo") return <ImageIcon className="w-5 h-5" />;
    if (type === "video") return <Video className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <Shield className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/premium-membership")}
              className="px-6 py-3 bg-gradient-to-r from-brand-accent to-brand-gold text-white rounded-lg hover:from-brand-gold hover:to-brand-accent transition-all font-semibold"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-600">Provider not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {provider.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{provider.name}</h1>
                  {provider.companyName && (
                    <p className="text-lg text-gray-600">{provider.companyName}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4">
                {provider.averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-brand-gold fill-brand-gold" />
                    <span className="font-semibold text-gray-900">{provider.averageRating}</span>
                    <span className="text-gray-500">({provider.totalReviews} reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Verified Provider</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-6 h-6 text-brand-primary" />
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-brand-accent" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{provider.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-brand-accent" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{provider.phone}</p>
                  </div>
                </div>
                {provider.alternativePhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Alternative Phone</p>
                      <p className="font-medium text-gray-900">{provider.alternativePhone}</p>
                    </div>
                  </div>
                )}
                {provider.officePhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Office Phone</p>
                      <p className="font-medium text-gray-900">{provider.officePhone}</p>
                    </div>
                  </div>
                )}
                {provider.whatsapp && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500">WhatsApp</p>
                      <p className="font-medium text-gray-900">{provider.whatsapp}</p>
                    </div>
                  </div>
                )}
                {provider.telegram && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Telegram</p>
                      <p className="font-medium text-gray-900">{provider.telegram}</p>
                    </div>
                  </div>
                )}
                {provider.address && (
                  <div className="flex items-start gap-3 md:col-span-2">
                    <MapPin className="w-5 h-5 text-brand-accent mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium text-gray-900">{provider.address}</p>
                      {provider.city && <p className="text-gray-600">{provider.city}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Business Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="w-6 h-6 text-brand-primary" />
                Business Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {provider.subRole && (
                  <div>
                    <p className="text-sm text-gray-500">Business Type</p>
                    <p className="font-medium text-gray-900 capitalize">{provider.subRole.replace(/([A-Z])/g, ' $1').trim()}</p>
                  </div>
                )}
                {provider.serviceCategory && (
                  <div>
                    <p className="text-sm text-gray-500">Service Category</p>
                    <p className="font-medium text-gray-900">{provider.serviceCategory}</p>
                  </div>
                )}
                {provider.tin && (
                  <div>
                    <p className="text-sm text-gray-500">TIN Number</p>
                    <p className="font-medium text-gray-900">{provider.tin}</p>
                  </div>
                )}
                {provider.businessStatus && (
                  <div>
                    <p className="text-sm text-gray-500">Business Status</p>
                    <p className="font-medium text-gray-900">{provider.businessStatus}</p>
                  </div>
                )}
                {provider.gender && (
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium text-gray-900 capitalize">{provider.gender}</p>
                  </div>
                )}
                {provider.femaleLedOrOwned && (
                  <div>
                    <p className="text-sm text-gray-500">Female-Led/Owned</p>
                    <p className="font-medium text-green-600">Yes</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-900">
                    {new Date(provider.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Documents */}
            {provider.documents.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-brand-primary" />
                  Documents & Files
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {provider.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-brand-accent transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand-accent/10 rounded-lg flex items-center justify-center text-brand-accent">
                            {getDocumentIcon(doc.type)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{doc.name}</p>
                            <p className="text-xs text-gray-500">Document</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-5 h-5" />
                          </a>
                          <a
                            href={doc.url}
                            download
                            className="p-2 text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="w-5 h-5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            {provider.services.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-brand-primary" />
                  Services ({provider.totalServices})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {provider.services.map((service) => (
                    <div
                      key={service._id}
                      onClick={() => navigate(`/service/${service._id}`)}
                      className="border border-gray-200 rounded-lg p-4 hover:border-brand-accent hover:shadow-md transition-all cursor-pointer"
                    >
                      {service.photos && service.photos.length > 0 && (
                        <img
                          src={service.photos[0]}
                          alt={service.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <h3 className="font-semibold text-gray-900 mb-1">{service.name}</h3>
                      {service.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{service.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-brand-accent">{service.price} ETB</span>
                        {service.category && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {service.category}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Provider Statistics</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-white/80">Total Services</p>
                  <p className="text-3xl font-bold">{provider.totalServices}</p>
                </div>
                <div>
                  <p className="text-sm text-white/80">Average Rating</p>
                  <div className="flex items-center gap-2">
                    <Star className="w-6 h-6 fill-brand-gold text-brand-gold" />
                    <p className="text-3xl font-bold">{provider.averageRating}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-white/80">Total Reviews</p>
                  <p className="text-3xl font-bold">{provider.totalReviews}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/services?provider=${provider._id}`)}
                  className="w-full flex items-center justify-between p-3 bg-brand-accent/10 hover:bg-brand-accent/20 rounded-lg transition-colors"
                >
                  <span className="font-medium text-gray-900">View All Services</span>
                  <ExternalLink className="w-5 h-5 text-brand-accent" />
                </button>
                {provider.email && (
                  <a
                    href={`mailto:${provider.email}`}
                    className="w-full flex items-center justify-between p-3 bg-brand-primary/10 hover:bg-brand-primary/20 rounded-lg transition-colors"
                  >
                    <span className="font-medium text-gray-900">Send Email</span>
                    <Mail className="w-5 h-5 text-brand-primary" />
                  </a>
                )}
                {provider.phone && (
                  <a
                    href={`tel:${provider.phone}`}
                    className="w-full flex items-center justify-between p-3 bg-brand-secondary/10 hover:bg-brand-secondary/20 rounded-lg transition-colors"
                  >
                    <span className="font-medium text-gray-900">Call Provider</span>
                    <Phone className="w-5 h-5 text-brand-secondary" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetails;



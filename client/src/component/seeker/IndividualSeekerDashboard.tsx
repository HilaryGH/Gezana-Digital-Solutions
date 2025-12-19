import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Star, Gift, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, Users, Copy, Check, ArrowLeft, Search } from "lucide-react";
import axios from "../../api/axios";
import { FaGift, FaCalendarAlt, FaStar } from "react-icons/fa";

interface Booking {
  _id: string;
  date: string;
  status: string;
  note?: string;
  service?: {
    _id: string;
    name: string;
    price?: number;
    provider?: {
      _id: string;
      name: string;
      email: string;
      phone?: string;
    };
  };
}

interface Service {
  _id: string;
  name: string;
  description?: string;
  price?: number;
  photos?: string[];
  category?: {
    name: string;
  };
  type?: {
    name: string;
  };
  provider?: {
    name: string;
    companyName?: string;
  };
  serviceRating?: number;
  ratingCount?: number;
}

interface IndividualSeekerDashboardProps {
  activeSection?: string | null;
  onSectionChange?: (section: string | null) => void;
}

const IndividualSeekerDashboard = ({ 
  activeSection: externalActiveSection, 
  onSectionChange: externalOnSectionChange 
}: IndividualSeekerDashboardProps = {}) => {
  const navigate = useNavigate();
  const [internalActiveSection, setInternalActiveSection] = useState<string | null>(null);
  
  // Use external state if provided, otherwise use internal state
  const activeSection = externalActiveSection !== undefined ? externalActiveSection : internalActiveSection;
  const setActiveSection = (section: string | null) => {
    if (externalOnSectionChange) {
      externalOnSectionChange(section);
    } else {
      setInternalActiveSection(section);
    }
  };
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");
  const [editDate, setEditDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  const [profileError, setProfileError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    pendingBookings: 0
  });
  const [referralData, setReferralData] = useState<{
    referralCode: string | null;
    stats: {
      totalReferrals: number;
      completedReferrals: number;
      pendingReferrals: number;
      totalEarnings: number;
      referralCount: number;
    };
    referrals: Array<{
      _id: string;
      referredUser: { name: string; email: string; joinedAt: string } | null;
      status: string;
      usedInRegistration: boolean;
      usedInPurchase: boolean;
      createdAt: string;
    }>;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch bookings
        const bookingsRes = await axios.get<Booking[]>("/bookings/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(bookingsRes.data);

        // Calculate stats
        const now = new Date();
        const upcoming = bookingsRes.data.filter(b => {
          const bookingDate = new Date(b.date);
          return bookingDate >= now && b.status !== 'cancelled';
        });
        const completed = bookingsRes.data.filter(b => b.status === 'completed');
        const pending = bookingsRes.data.filter(b => b.status === 'pending');

        setStats({
          totalBookings: bookingsRes.data.length,
          upcomingBookings: upcoming.length,
          completedBookings: completed.length,
          pendingBookings: pending.length
        });

        // Fetch loyalty points
        try {
          const loyaltyRes = await axios.get<{ points: number }>("/user/loyalty", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setLoyaltyPoints(loyaltyRes.data.points || 0);
        } catch (err) {
          console.error("Failed to fetch loyalty points:", err);
        }

        // Fetch referral data
        try {
          const referralRes = await axios.get<{
            success: boolean;
            referralCode: string | null;
            stats: {
              totalReferrals: number;
              completedReferrals: number;
              pendingReferrals: number;
              totalEarnings: number;
              referralCount: number;
            };
            referrals: Array<{
              _id: string;
              referredUser: { name: string; email: string; joinedAt: string } | null;
              status: string;
              usedInRegistration: boolean;
              usedInPurchase: boolean;
              createdAt: string;
            }>;
          }>("/referrals/my", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (referralRes.data.success) {
            setReferralData(referralRes.data);
          }
        } catch (err) {
          console.error("Failed to fetch referral data:", err);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    const base = "px-2 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case 'confirmed':
        return `${base} bg-brand-highlight/20 text-brand-highlight`;
      case 'completed':
        return `${base} bg-brand-secondary/20 text-brand-secondary`;
      case 'cancelled':
        return `${base} bg-red-100 text-red-700`;
      case 'pending':
        return `${base} bg-brand-gold/20 text-brand-gold`;
      default:
        return `${base} bg-gray-100 text-gray-700`;
    }
  };

  const copyReferralCode = () => {
    if (referralData?.referralCode) {
      navigator.clipboard.writeText(referralData.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fetchAllBookings = async () => {
    try {
      setSectionLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get<Booking[]>("/bookings/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllBookings(res.data);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setSectionLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      setSectionLoading(true);
      const res = await axios.get<Service[]>("/services");
      setServices(res.data);
    } catch (err) {
      console.error("Failed to fetch services:", err);
    } finally {
      setSectionLoading(false);
    }
  };

  const handleSectionClick = (section: string) => {
    setActiveSection(section);
    if (section === "bookings") {
      fetchAllBookings();
    } else if (section === "services") {
      fetchServices();
    } else if (section === "profile") {
      fetchProfile();
    }
  };

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get<{
        id: string;
        name: string;
        email: string;
        phone?: string;
        role: string;
        createdAt: string;
      }>("/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfileData({
        name: res.data.name,
        email: res.data.email,
        phone: res.data.phone || "",
        password: ""
      });
    } catch (err: any) {
      setProfileError(err.response?.data?.message || "Failed to fetch profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileMessage("");

    try {
      const token = localStorage.getItem("token");
      const body: any = { 
        name: profileData.name, 
        email: profileData.email, 
        phone: profileData.phone 
      };
      if (profileData.password.trim()) body.password = profileData.password;

      await axios.put("/user/me", body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfileMessage("✅ Profile updated successfully");
      setProfileData(prev => ({ ...prev, password: "" }));
      // Update localStorage name if changed
      localStorage.setItem("name", profileData.name);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || "Update failed");
    }
  };

  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(" ");
    return names
      .map((n) => n[0]?.toUpperCase())
      .slice(0, 2)
      .join("");
  };

  // Handle external section changes
  useEffect(() => {
    if (externalActiveSection !== undefined) {
      if (externalActiveSection === "bookings") {
        fetchAllBookings();
      } else if (externalActiveSection === "services") {
        fetchServices();
      } else if (externalActiveSection === "profile") {
        fetchProfile();
      }
    }
  }, [externalActiveSection]);

  const handleEdit = (booking: Booking) => {
    setEditId(booking._id);
    setEditNote(booking.note || "");
    setEditDate(booking.date);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/bookings/${editId}`,
        { note: editNote, date: editDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditId(null);
      fetchAllBookings();
      // Also refresh the main bookings list
      const bookingsRes = await axios.get<Booking[]>("/bookings/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(bookingsRes.data);
    } catch (err) {
      alert("Update failed");
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAllBookings();
      // Also refresh the main bookings list
      const bookingsRes = await axios.get<Booking[]>("/bookings/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(bookingsRes.data);
    } catch (err) {
      alert("Delete failed");
      console.error(err);
    }
  };

  const filteredServices = services.filter(service =>
    service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render active section content
  if (activeSection === "bookings") {
  return (
      <div className="space-y-6">
        <button
          onClick={() => setActiveSection(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
          </div>

          <div className="p-6">
            {sectionLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : allBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
                <p className="text-gray-600 mb-6">Start by browsing and booking services</p>
                <button
                  onClick={() => handleSectionClick("services")}
                  className="px-6 py-3 bg-gradient-to-r from-brand-accent to-brand-gold text-white rounded-xl hover:from-brand-gold hover:to-brand-accent transition-all font-semibold"
                >
                  Browse Services
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Service</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Provider</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Note</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {allBookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">
                          {booking.service?.name || "—"}
                          <div className="text-xs text-gray-500">
                            {booking.service?.price ? `${booking.service.price} ETB` : "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {editId === booking._id ? (
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="border p-1 rounded text-sm"
                            />
                          ) : (
                            new Date(booking.date).toLocaleDateString()
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={getStatusBadge(booking.status)}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {booking.status === "confirmed" && booking.service?.provider ? (
                            <>
                              <div className="font-semibold text-sm">{booking.service.provider.name}</div>
                              <div className="text-xs text-gray-600">{booking.service.provider.email}</div>
                              {booking.service.provider.phone && (
                                <div className="text-xs text-gray-600">{booking.service.provider.phone}</div>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400 text-sm">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editId === booking._id ? (
                            <input
                              type="text"
                              value={editNote}
                              onChange={(e) => setEditNote(e.target.value)}
                              className="border p-1 rounded w-full text-sm"
                            />
                          ) : (
                            <span className="text-sm">{booking.note || "—"}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 space-x-2">
                          {editId === booking._id ? (
                            <>
                              <button
                                onClick={handleSave}
                                className="bg-brand-highlight hover:bg-brand-secondary text-white px-3 py-1 rounded text-xs"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditId(null)}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(booking)}
                                className="bg-brand-primary hover:bg-brand-secondary text-white px-3 py-1 rounded text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(booking._id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === "services") {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setActiveSection(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Browse Services</h2>
              <div className="flex-1 max-w-md ml-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {sectionLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Services Found</h3>
                <p className="text-gray-600">Try adjusting your search terms</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <div
                    key={service._id}
                    onClick={() => navigate(`/service/${service._id}`)}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                  >
                    {service.photos && service.photos.length > 0 && (
                      <img
                        src={service.photos[0]}
                        alt={service.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2">{service.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          {service.price && (
                            <span className="text-lg font-bold text-brand-accent">
                              {service.price} ETB
                            </span>
                          )}
                          {service.category && (
                            <p className="text-xs text-gray-500 mt-1">{service.category.name}</p>
                          )}
                        </div>
                        {service.serviceRating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-brand-gold fill-brand-gold" />
                            <span className="text-sm font-medium">{service.serviceRating}</span>
                            {service.ratingCount && (
                              <span className="text-xs text-gray-500">({service.ratingCount})</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === "loyalty") {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setActiveSection(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">Loyalty Points</h2>
          </div>

          <div className="p-6">
            <div className="max-w-md mx-auto text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-brand-primary mb-2">{loyaltyPoints} pts</h3>
              <p className="text-gray-600 mb-6">Earn more by booking services!</p>
              <div className="bg-gray-100 rounded-full h-4 mb-4">
                <div
                  className="bg-gradient-to-r from-brand-primary to-brand-secondary h-4 rounded-full transition-all"
                  style={{ width: `${Math.min((loyaltyPoints / 1000) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">
                {Math.max(0, 1000 - loyaltyPoints)} points until next reward tier
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === "profile") {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setActiveSection(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-brand-primary to-brand-secondary p-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white text-brand-primary flex items-center justify-center text-2xl font-bold shadow-md">
              {getInitials(profileData.name || "User")}
            </div>
            <div>
              <h2 className="text-white text-xl font-bold">My Profile</h2>
              <p className="text-white/80 text-sm">Manage your details</p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {(profileError || profileMessage) && (
              <div
                className={`px-4 py-3 rounded-lg font-medium text-sm ${
                  profileError
                    ? "bg-red-100 text-red-700"
                    : "bg-brand-highlight/20 text-brand-highlight"
                }`}
              >
                {profileError || profileMessage}
              </div>
            )}

            {profileLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    autoComplete="tel"
                    pattern="\+?[0-9]{7,15}"
                    title="Enter a valid phone number"
                    placeholder="e.g. +251912345678"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current"
                    value={profileData.password}
                    onChange={(e) => setProfileData(prev => ({ ...prev, password: e.target.value }))}
                    autoComplete="current-password"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-accent focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-brand-accent to-brand-gold hover:from-brand-gold hover:to-brand-accent text-white font-semibold py-3 rounded-lg transition transform hover:scale-105 shadow-lg"
                >
                  Save Changes
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
        <p className="text-gray-600">Here's an overview of your activity and bookings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-brand-accent to-brand-gold rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/90 text-sm font-medium mb-1">Total Bookings</p>
              <p className="text-3xl font-bold">{stats.totalBookings}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/90 text-sm font-medium mb-1">Upcoming</p>
              <p className="text-3xl font-bold">{stats.upcomingBookings}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-brand-highlight to-brand-secondary rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/90 text-sm font-medium mb-1">Completed</p>
              <p className="text-3xl font-bold">{stats.completedBookings}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-brand-primary to-brand-highlight rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/90 text-sm font-medium mb-1">Loyalty Points</p>
              <p className="text-3xl font-bold">{loyaltyPoints}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Recent Bookings</h2>
            <button
              onClick={() => handleSectionClick("bookings")}
              className="text-brand-accent hover:text-brand-gold font-medium text-sm flex items-center gap-1"
            >
              View All
              <span>→</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
              <p className="text-gray-600 mb-6">Start by browsing and booking services</p>
              <button
                onClick={() => handleSectionClick("services")}
                className="px-6 py-3 bg-gradient-to-r from-brand-accent to-brand-gold text-white rounded-xl hover:from-brand-gold hover:to-brand-accent transition-all font-semibold"
              >
                Browse Services
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking._id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {booking.service?.name || "Service"}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(booking.date).toLocaleDateString()}
                        </span>
                        {booking.service?.price && (
                          <span className="font-semibold text-brand-accent">
                            {booking.service.price} ETB
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={getStatusBadge(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => handleSectionClick("services")}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-brand-accent/10 rounded-xl flex items-center justify-center group-hover:bg-brand-accent/20 transition-colors">
              <TrendingUp className="w-6 h-6 text-brand-accent" />
            </div>
            <span className="text-gray-400 group-hover:text-brand-accent transition-colors">→</span>
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Browse Services</h3>
          <p className="text-sm text-gray-600">Discover and book services from trusted providers</p>
        </button>

        <button
          onClick={() => handleSectionClick("bookings")}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
              <Calendar className="w-6 h-6 text-brand-primary" />
            </div>
            <span className="text-gray-400 group-hover:text-brand-primary transition-colors">→</span>
          </div>
          <h3 className="font-bold text-gray-900 mb-2">My Bookings</h3>
          <p className="text-sm text-gray-600">View and manage all your service bookings</p>
        </button>

        <button
          onClick={() => handleSectionClick("loyalty")}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
              <Gift className="w-6 h-6 text-brand-primary" />
            </div>
            <span className="text-gray-400 group-hover:text-brand-primary transition-colors">→</span>
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Loyalty Points</h3>
          <p className="text-sm text-gray-600">View your rewards and redeem points</p>
        </button>
      </div>

      {/* Referral Program Section */}
      {referralData && referralData.referralCode && (
        <div className="bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Referral Program</h2>
                <p className="text-indigo-100">Share your code and earn rewards!</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-8 h-8" />
              </div>
            </div>

            {/* Referral Code */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
              <label className="text-sm font-medium text-indigo-100 mb-2 block">Your Referral Code</label>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white rounded-lg px-4 py-3">
                  <code className="text-2xl font-bold text-indigo-600 tracking-wider">
                    {referralData.referralCode}
                  </code>
        </div>
                <button
                  onClick={copyReferralCode}
                  className="px-4 py-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-semibold flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Referral Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-indigo-100 text-sm mb-1">Total Referrals</p>
                <p className="text-3xl font-bold">{referralData.stats.totalReferrals}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-indigo-100 text-sm mb-1">Completed</p>
                <p className="text-3xl font-bold">{referralData.stats.completedReferrals}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-indigo-100 text-sm mb-1">Pending</p>
                <p className="text-3xl font-bold">{referralData.stats.pendingReferrals}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-indigo-100 text-sm mb-1">Total Earnings</p>
                <p className="text-3xl font-bold">{referralData.stats.totalEarnings.toFixed(0)}</p>
                <p className="text-xs text-indigo-200">ETB</p>
              </div>
            </div>

            {/* Recent Referrals */}
            {referralData.referrals.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <h3 className="font-semibold text-lg mb-3">Recent Referrals</h3>
                <div className="space-y-2">
                  {referralData.referrals.slice(0, 3).map((ref) => (
                    <div key={ref._id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <div>
                        <p className="font-medium text-white">
                          {ref.referredUser?.name || "Unknown User"}
                        </p>
                        <p className="text-xs text-indigo-200">
                          {ref.usedInRegistration && "Registered"}
                          {ref.usedInRegistration && ref.usedInPurchase && " • "}
                          {ref.usedInPurchase && "Made Purchase"}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        ref.status === 'completed' 
                          ? 'bg-brand-highlight/30 text-white' 
                          : ref.status === 'pending'
                          ? 'bg-brand-gold/30 text-white'
                          : 'bg-gray-500/30 text-gray-100'
                      }`}>
                        {ref.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
        </div>
  );
};

export default IndividualSeekerDashboard;

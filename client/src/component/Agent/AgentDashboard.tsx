import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";

type Me = {
  _id: string;
  name: string;
  email: string;
  role: "agent";
  agentEnabled?: boolean;
};

type AgentDashboardResponse = {
  me: {
    id: string;
    name: string;
    email: string;
    referralCode: string | null;
  };
  stats: {
    totalReferrals: number;
    registrationReferrals: number;
    purchaseReferrals: number;
    totalEarnings: number;
    conversionRate: number;
  };
  recentReferrals: Array<{
    _id: string;
    referralCode: string;
    usedInRegistration: boolean;
    usedInPurchase: boolean;
    rewardAmount: number;
    createdAt: string;
    referredUser: { name: string; email: string; joinedAt: string } | null;
  }>;
};

type Professional = {
  _id: string;
  name: string;
  serviceType?: string;
  city?: string;
  location?: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  email?: string;
  photo?: string;
};

type MyProfessional = {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  whatsapp?: string;
  telegram?: string;
  city?: string;
  location?: string;
  serviceType?: string;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

type ServicesOfferedItem = {
  id: string;
  serviceName: string;
  price: string;
  description: string;
};

type ProviderService = {
  _id: string;
  name: string;
  category?: { name?: string } | null;
};

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [me, setMe] = useState<Me | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [dash, setDash] = useState<AgentDashboardResponse | null>(null);
  const [myProfessionals, setMyProfessionals] = useState<MyProfessional[]>([]);
  const [directoryQuery, setDirectoryQuery] = useState("");
  const [directoryServiceType, setDirectoryServiceType] = useState("");
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    whatsapp: "",
    telegram: "",
    city: "",
    location: "",
    serviceType: "",
    notes: "",
    profileImage: null as string | null,
    experience: "",
    startingPrice: "",
    pricingType: "fixed" as "fixed" | "hourly",
    verified: false,
  });
  const [servicesOffered, setServicesOffered] = useState<ServicesOfferedItem[]>([
    { id: `svc_${Date.now()}`, serviceName: "", price: "", description: "" },
  ]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [servicesModalOpen, setServicesModalOpen] = useState(false);
  const [servicesModalProvider, setServicesModalProvider] = useState<Professional | null>(null);
  const [providerServices, setProviderServices] = useState<ProviderService[]>([]);
  const [loadingProviderServices, setLoadingProviderServices] = useState(false);
  const [providerServicesQuery, setProviderServicesQuery] = useState("");
  const [providerServicesError, setProviderServicesError] = useState<string>("");

  const extractServiceTypeTokens = (value?: string | null) =>
    (value || "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

  const serviceTypeOptions = Array.from(
    new Set([
      ...myProfessionals.flatMap((p) => extractServiceTypeTokens(p.serviceType)),
      ...professionals.flatMap((p) => extractServiceTypeTokens(p.serviceType)),
    ])
  ).sort((a, b) => a.localeCompare(b));

  const normalizedQuery = directoryQuery.trim().toLowerCase();
  const normalizedServiceType = directoryServiceType.trim().toLowerCase();

  const filteredMyProfessionals = myProfessionals.filter((p) => {
    const matchesQuery = !normalizedQuery || p.fullName.toLowerCase().includes(normalizedQuery);
    const matchesServiceType =
      !normalizedServiceType || (p.serviceType || "").toLowerCase().includes(normalizedServiceType);
    return matchesQuery && matchesServiceType;
  });

  const filteredProfessionals = professionals.filter((p) => {
    const matchesQuery = !normalizedQuery || (p.name || "").toLowerCase().includes(normalizedQuery);
    const matchesServiceType =
      !normalizedServiceType || (p.serviceType || "").toLowerCase().includes(normalizedServiceType);
    return matchesQuery && matchesServiceType;
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const run = async () => {
      try {
        const meRes = await axios.get<Me>("/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (meRes.data.role !== "agent") {
          navigate("/dashboard");
          return;
        }

        setMe(meRes.data);

        const dashRes = await axios.get<AgentDashboardResponse>("/agents/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDash(dashRes.data);

        const profRes = await axios.get<{ professionals: Professional[] }>(
          "/agents/professionals",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfessionals(profRes.data.professionals || []);

        const myRes = await axios.get<{ professionals: MyProfessional[] }>(
          "/agents/my-professionals",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMyProfessionals(myRes.data.professionals || []);
      } catch (e: any) {
        const message =
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "Failed to load agent dashboard";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [navigate]);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  const copyReferral = async () => {
    try {
      const code = dash?.me?.referralCode;
      if (!code) return;
      await navigator.clipboard.writeText(code);
      alert("Referral code copied");
    } catch {
      // ignore
    }
  };

  const refreshMyProfessionals = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const myRes = await axios.get<{ professionals: MyProfessional[] }>("/agents/my-professionals", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMyProfessionals(myRes.data.professionals || []);
  };

  const openProviderServices = async (provider: Professional) => {
    setProviderServicesError("");
    setProviderServicesQuery("");
    setServicesModalProvider(provider);
    setServicesModalOpen(true);

    setLoadingProviderServices(true);
    setProviderServices([]);
    try {
      // Public endpoint. Returns active services for a provider.
      const res = await axios.get<ProviderService[]>(`/services/provider/${provider._id}`);
      setProviderServices(Array.isArray(res.data) ? res.data : (res.data as any) || []);
    } catch (e: any) {
      setProviderServicesError(e?.response?.data?.message || e?.message || "Failed to fetch services");
    } finally {
      setLoadingProviderServices(false);
    }
  };

  const filteredProviderServices = providerServices.filter((s) => {
    const q = providerServicesQuery.trim().toLowerCase();
    if (!q) return true;
    const name = s.name?.toLowerCase() || "";
    const category = s.category?.name?.toLowerCase() || "";
    return name.includes(q) || category.includes(q);
  });

  const submitProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setAdding(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const computedServiceType = servicesOffered
        .map((s) => s.serviceName.trim())
        .filter(Boolean)
        .join(", ");

      const serviceDescriptions = servicesOffered
        .map((s) => s.description.trim())
        .filter(Boolean);

      const computedNotes = [addForm.notes.trim(), ...serviceDescriptions]
        .filter(Boolean)
        .join("\n\n");

      if (!computedServiceType) {
        setError("Please add at least one Service Name in Services Offered.");
        return;
      }

      // NOTE: The backend `/agents/my-professionals` endpoint only accepts text fields.
      // Sending `profileImage` here would include a base64 data URL which can exceed
      // Express' default JSON body limit and trigger 413.
      const { profileImage: _profileImage, ...textPayload } = addForm;

      await axios.post(
        "/agents/my-professionals",
        {
          ...textPayload,
          serviceType: computedServiceType,
          notes: computedNotes,
          fullName: addForm.fullName.trim(),
          phone: addForm.phone.trim(),
          experience: addForm.experience ? Number(addForm.experience) : undefined,
          startingPrice: addForm.startingPrice ? Number(addForm.startingPrice) : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAddForm({
        fullName: "",
        phone: "",
        email: "",
        whatsapp: "",
        telegram: "",
        city: "",
        location: "",
        serviceType: "",
        notes: "",
        profileImage: null,
        experience: "",
        startingPrice: "",
        pricingType: "fixed",
        verified: false,
      });
      setServicesOffered([{ id: `svc_${Date.now()}`, serviceName: "", price: "", description: "" }]);
      await refreshMyProfessionals();
      alert("Professional added (pending review)");
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to add professional");
    } finally {
      setAdding(false);
    }
  };

  const handleProfileImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      setAddForm((prev) => ({ ...prev, profileImage: null }));
      return;
    }

    // Convert to data URL so we can keep the existing JSON POST contract.
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      setAddForm((prev) => ({ ...prev, profileImage: result }));
    };
    reader.readAsDataURL(file);
  };

  const updateServiceOffered = (
    id: string,
    patch: Partial<Omit<ServicesOfferedItem, "id">>
  ) => {
    setServicesOffered((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  };

  const addAnotherService = () => {
    setServicesOffered((prev) => [
      ...prev,
      { id: `svc_${Date.now()}_${Math.random().toString(36).slice(2)}`, serviceName: "", price: "", description: "" },
    ]);
  };

  const removeServiceOffered = (id: string) => {
    setServicesOffered((prev) => {
      const next = prev.filter((s) => s.id !== id);
      return next.length ? next : [{ id: `svc_${Date.now()}`, serviceName: "", price: "", description: "" }];
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50/30">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-md border border-blue-100/80 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-orange-500" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-950">Agent Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome{me?.name ? `, ${me.name}` : ""}. Track referrals, commission, and performance.
              </p>
            </div>
            <button
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-colors"
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
            >
              Logout
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700">
              {error}
            </div>
          )}

          {/* Stats */}
          {dash && !error && (
            <>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl border border-blue-100/70 p-4 bg-gradient-to-br from-blue-50 to-white">
                  <div className="text-sm text-gray-600">Total Referrals</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{dash.stats.totalReferrals}</div>
                </div>
                <div className="rounded-xl border border-blue-100/70 p-4 bg-gradient-to-br from-purple-50 to-white">
                  <div className="text-sm text-gray-600">Registrations</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{dash.stats.registrationReferrals}</div>
                </div>
                <div className="rounded-xl border border-blue-100/70 p-4 bg-gradient-to-br from-green-50 to-white">
                  <div className="text-sm text-gray-600">Purchases</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{dash.stats.purchaseReferrals}</div>
                </div>
                <div className="rounded-xl border border-blue-100/70 p-4 bg-gradient-to-br from-amber-50 to-white">
                  <div className="text-sm text-gray-600">Commission Earned</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(dash.stats.totalEarnings)} ETB
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="rounded-xl border border-blue-100/70 p-4 bg-gradient-to-br from-blue-50/20 to-white">
                  <div className="text-sm font-semibold text-gray-900">Your Referral Code</div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 font-mono text-sm text-blue-950">
                      {dash.me.referralCode || "—"}
                    </div>
                    <button
                      onClick={copyReferral}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                      disabled={!dash.me.referralCode}
                    >
                      Copy
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Share this code to earn commission when bookings are paid.
                  </div>
                </div>
                <div className="rounded-xl border border-blue-100/70 p-4">
                  <div className="text-sm font-semibold text-gray-900">Performance</div>
                  <div className="mt-2 text-sm text-gray-700">
                    <div>
                      <span className="font-medium">Conversion rate:</span>{" "}
                      {Math.round((dash.stats.conversionRate || 0) * 100)}%
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Purchases ÷ registrations (based on tracked referrals).
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-blue-100/70 p-4">
                  <div className="text-sm font-semibold text-gray-900">Commission Rate</div>
                  <div className="mt-2 text-sm text-gray-700">
                    Default is <span className="font-medium">5%</span> per paid booking
                    (configurable via <span className="font-mono">AGENT_COMMISSION_RATE</span>).
                  </div>
                </div>
              </div>

              {/* Recent Referrals */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Referrals</h2>
                </div>
                <div className="mt-3 overflow-x-auto rounded-xl border border-blue-100/70 bg-white">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Referred User</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Type</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Commission</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-50">
                      {dash.recentReferrals.map((r) => (
                        <tr key={r._id} className="hover:bg-blue-50/50">
                          <td className="px-4 py-3">
                            {r.referredUser ? (
                              <div>
                                <div className="font-medium text-gray-900">{r.referredUser.name}</div>
                                <div className="text-xs text-gray-500">{r.referredUser.email}</div>
                              </div>
                            ) : (
                              <span className="text-gray-500">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {r.usedInPurchase ? (
                              <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                Purchase
                              </span>
                            ) : r.usedInRegistration ? (
                              <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                                Registration
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                                Other
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(r.rewardAmount)} ETB
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {dash.recentReferrals.length === 0 && (
                        <tr>
                          <td className="px-4 py-6 text-gray-600" colSpan={4}>
                            No referrals yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Add / My Professionals */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-blue-100/70 p-4 bg-gradient-to-br from-blue-50/20 to-white shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Add Professional</h2>
              <p className="text-sm text-gray-600">Add a professional lead to your list.</p>

              <form onSubmit={submitProfessional} className="mt-4 space-y-4">
                {/* Basic Info */}
                <div className="rounded-xl border border-blue-100/70 p-4 bg-white shadow-sm">
                  <div className="text-sm font-semibold text-gray-900 mb-3">
                    Basic Info
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition"
                      placeholder="Full Name *"
                      value={addForm.fullName}
                      onChange={(e) =>
                        setAddForm({ ...addForm, fullName: e.target.value })
                      }
                      required
                    />
                    <input
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition"
                      placeholder="Phone *"
                      value={addForm.phone}
                      onChange={(e) =>
                        setAddForm({ ...addForm, phone: e.target.value })
                      }
                      required
                    />
                    <input
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition"
                      placeholder="Email"
                      value={addForm.email}
                      onChange={(e) =>
                        setAddForm({ ...addForm, email: e.target.value })
                      }
                    />
                    <input
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition"
                      placeholder="WhatsApp"
                      value={addForm.whatsapp}
                      onChange={(e) =>
                        setAddForm({ ...addForm, whatsapp: e.target.value })
                      }
                    />
                    <input
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition"
                      placeholder="Telegram"
                      value={addForm.telegram}
                      onChange={(e) =>
                        setAddForm({ ...addForm, telegram: e.target.value })
                      }
                    />
                    <input
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition"
                      placeholder="City"
                      value={addForm.city}
                      onChange={(e) =>
                        setAddForm({ ...addForm, city: e.target.value })
                      }
                    />
                    <input
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition sm:col-span-2"
                      placeholder="Location"
                      value={addForm.location}
                      onChange={(e) =>
                        setAddForm({ ...addForm, location: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Services */}
                <div className="rounded-xl border border-blue-100/70 p-4 bg-white shadow-sm">
                  <div className="text-sm font-semibold text-gray-900 mb-3">
                    Services Offered
                  </div>

                  <div className="space-y-3">
                    {servicesOffered.map((svc, idx) => (
                      <div
                        key={svc.id}
                        className="rounded-xl border border-blue-100/70 p-3 bg-blue-50/40"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-xs font-semibold text-gray-700">
                            Service {idx + 1}
                          </div>
                          {servicesOffered.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeServiceOffered(svc.id)}
                              className="text-sm px-2 py-1 rounded-lg border border-blue-100 bg-white hover:bg-blue-50 transition"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition sm:col-span-2"
                            placeholder="Service Name *"
                            value={svc.serviceName}
                            onChange={(e) =>
                              updateServiceOffered(svc.id, {
                                serviceName: e.target.value,
                              })
                            }
                          />

                          <input
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition"
                            placeholder="Price (optional)"
                            value={svc.price}
                            onChange={(e) =>
                              updateServiceOffered(svc.id, {
                                price: e.target.value,
                              })
                            }
                          />

                          <div className="sm:col-span-1" />

                          <textarea
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition sm:col-span-2"
                            placeholder="Description (optional)"
                            value={svc.description}
                            onChange={(e) =>
                              updateServiceOffered(svc.id, {
                                description: e.target.value,
                              })
                            }
                            rows={3}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={addAnotherService}
                      className="w-full px-4 py-2 rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                    >
                      Add Another Service
                    </button>
                  </div>
                </div>

                {/* Professional Details */}
                <div className="rounded-xl border border-blue-100/70 p-4 bg-white shadow-sm">
                  <div className="text-sm font-semibold text-gray-900 mb-3">
                    Professional Details
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Profile Image */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Profile Image Upload
                      </label>
                      <div className="flex items-center gap-3 flex-wrap">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                          className="w-full sm:w-auto"
                        />
                        {addForm.profileImage && (
                          <img
                            src={addForm.profileImage}
                            alt="Profile preview"
                            className="w-14 h-14 rounded-full object-cover border border-gray-200"
                          />
                        )}
                      </div>
                    </div>

                    <input
                      type="number"
                      min={0}
                      step={1}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition"
                      placeholder="Experience (years)"
                      value={addForm.experience}
                      onChange={(e) =>
                        setAddForm({ ...addForm, experience: e.target.value })
                      }
                    />

                    <textarea
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition sm:col-span-2"
                      placeholder="Short Bio"
                      value={addForm.notes}
                      onChange={(e) =>
                        setAddForm({ ...addForm, notes: e.target.value })
                      }
                      rows={3}
                    />

                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition"
                      placeholder="Starting Price"
                      value={addForm.startingPrice}
                      onChange={(e) =>
                        setAddForm({ ...addForm, startingPrice: e.target.value })
                      }
                    />

                    {/* Pricing Type */}
                    <div className="rounded-lg border border-gray-200 p-3 bg-white">
                      <div className="text-sm font-semibold text-gray-700 mb-2">
                        Pricing Type
                      </div>
                      <label className="flex items-center gap-2 text-sm text-gray-700 mb-2 cursor-pointer">
                        <input
                          type="radio"
                          name="pricingType"
                          value="fixed"
                          checked={addForm.pricingType === "fixed"}
                          onChange={() =>
                            setAddForm((prev) => ({ ...prev, pricingType: "fixed" }))
                          }
                        />
                        Fixed
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name="pricingType"
                          value="hourly"
                          checked={addForm.pricingType === "hourly"}
                          onChange={() =>
                            setAddForm((prev) => ({ ...prev, pricingType: "hourly" }))
                          }
                        />
                        Hourly
                      </label>
                    </div>

                    {/* Verified toggle */}
                    <label className="flex items-center gap-3 sm:col-span-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addForm.verified}
                        onChange={(e) =>
                          setAddForm((prev) => ({
                            ...prev,
                            verified: e.target.checked,
                          }))
                        }
                        className="h-4 w-4"
                      />
                      <span className="text-sm font-semibold text-gray-700">
                        Verified
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={adding}
                  className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 transition"
                >
                  {adding ? "Adding..." : "Add Professional"}
                </button>
              </form>
            </div>

            <div className="rounded-xl border border-blue-100/70 p-4 bg-gradient-to-br from-blue-50/20 to-white shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">My Professionals</h2>
                <button
                  onClick={refreshMyProfessionals}
                  className="px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm transition-colors"
                >
                  Refresh
                </button>
              </div>
              <p className="text-sm text-gray-600">Professionals you submitted.</p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Search Professional
                  </label>
                  <input
                    value={directoryQuery}
                    onChange={(e) => setDirectoryQuery(e.target.value)}
                    placeholder="Type a name..."
                    className="w-full px-3 py-2 rounded-lg border border-blue-100 bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Service Type
                  </label>
                  <select
                    value={directoryServiceType}
                    onChange={(e) => setDirectoryServiceType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-blue-100 bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition"
                  >
                    <option value="">All service types</option>
                    {serviceTypeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3 overflow-x-auto rounded-xl border border-blue-100/70 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Name</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Phone</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50">
                    {filteredMyProfessionals.map((p) => (
                      <tr key={p._id} className="hover:bg-blue-50/50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{p.fullName}</div>
                          <div className="text-xs text-gray-500">
                            {p.serviceType ? p.serviceType : "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{p.phone}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              p.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : p.status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {p.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {filteredMyProfessionals.length === 0 && (
                      <tr>
                        <td className="px-4 py-6 text-gray-600" colSpan={4}>
                          No professionals match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900">Professionals</h2>
            <p className="text-sm text-gray-600">
              This list shows verified providers available on the platform.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProfessionals.map((p) => (
                <div
                  key={p._id}
                  className="bg-white rounded-xl border border-blue-100/70 p-4 hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-50 overflow-hidden flex items-center justify-center">
                      {p.photo ? (
                        <img
                          src={p.photo}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-500 font-semibold">
                          {(p.name || "?").slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{p.name}</div>
                      <div className="text-sm text-gray-600 truncate">
                        {p.serviceType || "Service Provider"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-700 space-y-1">
                    <div>
                      <span className="font-medium">Location:</span>{" "}
                      {`${p.city || ""}${p.city && p.location ? ", " : ""}${p.location || ""}` ||
                        "—"}
                    </div>
                    {p.phone && (
                      <div>
                        <span className="font-medium">Phone:</span> {p.phone}
                      </div>
                    )}
                    {p.whatsapp && (
                      <div>
                        <span className="font-medium">WhatsApp:</span> {p.whatsapp}
                      </div>
                    )}
                    {p.telegram && (
                      <div>
                        <span className="font-medium">Telegram:</span> {p.telegram}
                      </div>
                    )}
                    {p.email && (
                      <div className="truncate">
                        <span className="font-medium">Email:</span> {p.email}
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => openProviderServices(p)}
                      className="w-full px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={loadingProviderServices && servicesModalProvider?._id === p._id}
                    >
                      {loadingProviderServices && servicesModalProvider?._id === p._id
                        ? "Loading services..."
                        : "View Services"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {!error && filteredProfessionals.length === 0 && (
              <div className="mt-4 text-gray-600">No professionals match your filters.</div>
            )}
          </div>

          {/* Provider Services Modal */}
          {servicesModalOpen && servicesModalProvider && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => {
                setServicesModalOpen(false);
                setServicesModalProvider(null);
                setProviderServices([]);
                setProviderServicesQuery("");
                setProviderServicesError("");
              }}
            >
              <div
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-5 bg-gradient-to-r from-indigo-600 to-orange-500 text-white flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold truncate">
                      Services by {servicesModalProvider.name}
                    </h3>
                    <p className="text-sm text-white/90 mt-1 truncate">
                      {servicesModalProvider.serviceType || "Service provider"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setServicesModalOpen(false);
                      setServicesModalProvider(null);
                      setProviderServices([]);
                      setProviderServicesQuery("");
                      setProviderServicesError("");
                    }}
                    className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white flex items-center justify-center"
                    aria-label="Close services modal"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-5 flex flex-col gap-4 overflow-y-auto">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Search services
                    </label>
                    <input
                      value={providerServicesQuery}
                      onChange={(e) => setProviderServicesQuery(e.target.value)}
                      placeholder="Type a service name..."
                      className="w-full px-3 py-2 rounded-lg border border-blue-100 bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition"
                    />
                  </div>

                  {providerServicesError && (
                    <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
                      {providerServicesError}
                    </div>
                  )}

                  {loadingProviderServices ? (
                    <div className="text-sm text-gray-600">Loading services...</div>
                  ) : filteredProviderServices.length > 0 ? (
                    <div className="space-y-3">
                      {filteredProviderServices.map((s) => (
                        <div
                          key={s._id}
                          className="rounded-xl border border-blue-100/70 p-3 bg-gradient-to-br from-blue-50/40 to-white"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 truncate">
                                {s.name}
                              </div>
                              {s.category?.name && (
                                <div className="text-xs text-gray-600 mt-1 truncate">
                                  Category: {s.category.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      No services match your search.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;


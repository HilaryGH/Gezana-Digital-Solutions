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

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [me, setMe] = useState<Me | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [dash, setDash] = useState<AgentDashboardResponse | null>(null);
  const [myProfessionals, setMyProfessionals] = useState<MyProfessional[]>([]);
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
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

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

      await axios.post(
        "/agents/my-professionals",
        {
          ...addForm,
          fullName: addForm.fullName.trim(),
          phone: addForm.phone.trim(),
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
      });
      await refreshMyProfessionals();
      alert("Professional added (pending review)");
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to add professional");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome{me?.name ? `, ${me.name}` : ""}. Track referrals, commission, and performance.
              </p>
            </div>
            <button
              className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
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
                <div className="rounded-xl border border-gray-200 p-4 bg-gradient-to-br from-blue-50 to-white">
                  <div className="text-sm text-gray-600">Total Referrals</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{dash.stats.totalReferrals}</div>
                </div>
                <div className="rounded-xl border border-gray-200 p-4 bg-gradient-to-br from-purple-50 to-white">
                  <div className="text-sm text-gray-600">Registrations</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{dash.stats.registrationReferrals}</div>
                </div>
                <div className="rounded-xl border border-gray-200 p-4 bg-gradient-to-br from-green-50 to-white">
                  <div className="text-sm text-gray-600">Purchases</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{dash.stats.purchaseReferrals}</div>
                </div>
                <div className="rounded-xl border border-gray-200 p-4 bg-gradient-to-br from-amber-50 to-white">
                  <div className="text-sm text-gray-600">Commission Earned</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(dash.stats.totalEarnings)} ETB
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-sm font-semibold text-gray-900">Your Referral Code</div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 font-mono text-sm">
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
                <div className="rounded-xl border border-gray-200 p-4">
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
                <div className="rounded-xl border border-gray-200 p-4">
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
                <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Referred User</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Type</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Commission</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {dash.recentReferrals.map((r) => (
                        <tr key={r._id} className="hover:bg-gray-50">
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
            <div className="rounded-xl border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">Add Professional</h2>
              <p className="text-sm text-gray-600">Add a professional lead to your list.</p>

              <form onSubmit={submitProfessional} className="mt-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-gray-200"
                    placeholder="Full Name *"
                    value={addForm.fullName}
                    onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                    required
                  />
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-gray-200"
                    placeholder="Phone *"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    required
                  />
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-gray-200"
                    placeholder="Email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  />
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-gray-200"
                    placeholder="Service Type"
                    value={addForm.serviceType}
                    onChange={(e) => setAddForm({ ...addForm, serviceType: e.target.value })}
                  />
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-gray-200"
                    placeholder="City"
                    value={addForm.city}
                    onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
                  />
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-gray-200"
                    placeholder="Location"
                    value={addForm.location}
                    onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
                  />
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-gray-200"
                    placeholder="WhatsApp"
                    value={addForm.whatsapp}
                    onChange={(e) => setAddForm({ ...addForm, whatsapp: e.target.value })}
                  />
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-gray-200"
                    placeholder="Telegram"
                    value={addForm.telegram}
                    onChange={(e) => setAddForm({ ...addForm, telegram: e.target.value })}
                  />
                </div>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-gray-200"
                  placeholder="Notes (optional)"
                  value={addForm.notes}
                  onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                  rows={3}
                />
                <button
                  type="submit"
                  disabled={adding}
                  className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {adding ? "Adding..." : "Add Professional"}
                </button>
              </form>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">My Professionals</h2>
                <button
                  onClick={refreshMyProfessionals}
                  className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
                >
                  Refresh
                </button>
              </div>
              <p className="text-sm text-gray-600">Professionals you submitted.</p>

              <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Name</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Phone</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {myProfessionals.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-50">
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
                    {myProfessionals.length === 0 && (
                      <tr>
                        <td className="px-4 py-6 text-gray-600" colSpan={4}>
                          No professionals added yet.
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
              {professionals.map((p) => (
                <div
                  key={p._id}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
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
                </div>
              ))}
            </div>

            {!error && professionals.length === 0 && (
              <div className="mt-4 text-gray-600">No professionals found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;


import { useState, useEffect } from "react";
import axios from "../../api/axios";
import { Users, TrendingUp, DollarSign, CheckCircle, Clock, XCircle, Copy, Check } from "lucide-react";

interface Referral {
  _id: string;
  referrer: {
    _id: string;
    name: string;
    email: string;
    referralCode: string;
  } | null;
  referredUser: {
    _id: string;
    name: string;
    email: string;
    joinedAt: string;
  } | null;
  referralCode: string;
  status: string;
  usedInRegistration: boolean;
  usedInPurchase: boolean;
  bookingId: string | null;
  rewardAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface ReferralStats {
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
  totalEarnings: number;
  registrationReferrals: number;
  purchaseReferrals: number;
}

interface TopReferrer {
  name: string;
  referralCode: string;
  referralCount: number;
  earnings: number;
}

const AdminReferrals = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchReferrals();
    fetchStats();
  }, [filterStatus, page]);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`/referrals/all`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          limit: 50,
          ...(filterStatus !== "all" && { status: filterStatus }),
        },
      });

      if (response.data.success) {
        setReferrals(response.data.referrals);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (err: any) {
      console.error("Error fetching referrals:", err);
      setError(err.response?.data?.message || "Failed to fetch referrals");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/referrals/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setStats(response.data.stats);
        setTopReferrers(response.data.stats.topReferrers || []);
      }
    } catch (err: any) {
      console.error("Error fetching referral stats:", err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    const base = "px-3 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case "completed":
        return `${base} bg-green-100 text-green-700`;
      case "pending":
        return `${base} bg-yellow-100 text-yellow-700`;
      case "cancelled":
        return `${base} bg-red-100 text-red-700`;
      default:
        return `${base} bg-gray-100 text-gray-700`;
    }
  };

  const filteredReferrals = referrals.filter(
    (ref) => filterStatus === "all" || ref.status === filterStatus
  );

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Referral Tracking</h2>
        <p className="text-gray-600">Monitor and manage all referral activities</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Referrals</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Earnings</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalEarnings.toFixed(0)}</p>
                <p className="text-xs text-gray-500 mt-1">ETB</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">Registration Referrals</p>
            <p className="text-2xl font-bold text-gray-900">{stats.registrationReferrals}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">Purchase Referrals</p>
            <p className="text-2xl font-bold text-gray-900">{stats.purchaseReferrals}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">Total Referrers</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalReferrers || 0}</p>
          </div>
        </div>
      )}

      {/* Top Referrers */}
      {topReferrers.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            Top Referrers
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Referral Code</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Referrals</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {topReferrers.map((referrer, index) => (
                  <tr key={referrer.referralCode} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-bold text-orange-600">#{index + 1}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{referrer.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {referrer.referralCode}
                        </code>
                        <button
                          onClick={() => copyToClipboard(referrer.referralCode)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {copiedCode === referrer.referralCode ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      {referrer.referralCount}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-purple-600">
                      {referrer.earnings.toFixed(0)} ETB
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => {
              setFilterStatus("all");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === "all"
                ? "bg-orange-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({stats?.total || 0})
          </button>
          <button
            onClick={() => {
              setFilterStatus("completed");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === "completed"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Completed ({stats?.completed || 0})
          </button>
          <button
            onClick={() => {
              setFilterStatus("pending");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === "pending"
                ? "bg-yellow-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Pending ({stats?.pending || 0})
          </button>
          <button
            onClick={() => {
              setFilterStatus("cancelled");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === "cancelled"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Cancelled ({stats?.cancelled || 0})
          </button>
        </div>
      </div>

      {/* Referrals List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Referrer</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Referred User</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Code</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Type</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Reward</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No referrals found
                  </td>
                </tr>
              ) : (
                filteredReferrals.map((referral) => (
                  <tr key={referral._id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      {referral.referrer ? (
                        <div>
                          <p className="font-medium text-gray-900">{referral.referrer.name}</p>
                          <p className="text-sm text-gray-500">{referral.referrer.email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Unknown</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {referral.referredUser ? (
                        <div>
                          <p className="font-medium text-gray-900">{referral.referredUser.name}</p>
                          <p className="text-sm text-gray-500">{referral.referredUser.email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Unknown</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {referral.referralCode}
                        </code>
                        <button
                          onClick={() => copyToClipboard(referral.referralCode)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {copiedCode === referral.referralCode ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        {referral.usedInRegistration && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Registration
                          </span>
                        )}
                        {referral.usedInPurchase && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            Purchase
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={getStatusBadge(referral.status)}>
                        {referral.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-purple-600">
                      {referral.rewardAmount.toFixed(0)} ETB
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReferrals;


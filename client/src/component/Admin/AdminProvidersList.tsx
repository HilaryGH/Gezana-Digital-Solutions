import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileCheck2, Loader2, ShieldAlert, Users } from "lucide-react";
import axios from "../../api/axios";

type VerificationStatus = "pending" | "approved" | "rejected";

interface ProviderDocuments {
  license?: string | null;
  tradeRegistration?: string | null;
  professionalCertificate?: string | null;
  priceList?: string | null;
  photo?: string | null;
  video?: string | null;
  servicePhotos?: string[];
}

interface Provider {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  location?: string;
  serviceType?: string;
  subRole?: string;
  createdAt: string;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  credentials: string[];
  documents: ProviderDocuments;
}

const statusClasses: Record<VerificationStatus, string> = {
  approved:
    "bg-emerald-50 text-emerald-700 border border-emerald-200",
  pending:
    "bg-amber-50 text-amber-700 border border-amber-200",
  rejected:
    "bg-rose-50 text-rose-700 border border-rose-200",
};

const gradientButtonStyle = {
  background: "linear-gradient(120deg, var(--brand-primary), var(--brand-secondary))",
  boxShadow: "0 12px 25px rgba(46, 61, 211, 0.25)",
};

const AdminProvidersList = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await axios.get<Provider[]>("/user/admin/providers", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setProviders(res.data);
    } catch (err) {
      console.error(err);
      setError("We couldn't load the providers list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleVerification = async (providerId: string, status: VerificationStatus) => {
    try {
      setError("");
      setActionLoading(`${providerId}-${status}`);
      const token = localStorage.getItem("token");
      const res = await axios.patch<{ provider: Provider }>(
        `/user/admin/providers/${providerId}/verify`,
        { status },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      setProviders((prev) =>
        prev.map((provider) =>
          provider._id === providerId ? res.data.provider : provider
        )
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update verification status.");
    } finally {
      setActionLoading(null);
    }
  };

  const stats = useMemo(() => {
    const total = providers.length;
    const approved = providers.filter((provider) => provider.verificationStatus === "approved").length;
    const pending = providers.filter((provider) => provider.verificationStatus === "pending").length;
    const rejected = providers.filter((provider) => provider.verificationStatus === "rejected").length;

    return { total, approved, pending, rejected };
  }, [providers]);

  const renderDocuments = (provider: Provider) => {
    const docEntries = [
      { label: "Business License", url: provider.documents.license },
      { label: "Trade Registration", url: provider.documents.tradeRegistration },
      { label: "Professional Certificate", url: provider.documents.professionalCertificate },
      { label: "Price List", url: provider.documents.priceList },
      { label: "Brand Photo", url: provider.documents.photo },
      { label: "Intro Video", url: provider.documents.video },
    ].filter((doc) => !!doc.url);

    const servicePhotos =
      provider.documents.servicePhotos?.map((url, index) => ({
        label: `Service Photo ${index + 1}`,
        url,
      })) || [];

    const credentialDocs = provider.credentials.map((url, index) => ({
      label: `Credential ${index + 1}`,
      url,
    }));

    const combinedDocs = [...docEntries, ...servicePhotos, ...credentialDocs];

    if (combinedDocs.length === 0) {
      return <p className="text-sm text-gray-500">No documents submitted yet.</p>;
    }

    return (
      <div className="flex flex-wrap gap-3">
        {combinedDocs.map(({ label, url }, index) => (
          <a
            key={`${label}-${index}`}
            href={url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-transform duration-200 border"
            style={{
              background: "rgba(0, 174, 239, 0.08)",
              color: "var(--brand-primary)",
              borderColor: "rgba(46, 61, 211, 0.2)",
            }}
          >
            <FileCheck2 className="h-4 w-4" />
            {label}
          </a>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div
        className="rounded-3xl p-6 text-white shadow-xl"
        style={{
          background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))",
          boxShadow: "0 25px 50px rgba(46, 61, 211, 0.35)",
        }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest opacity-80">
              Provider Trust Center
            </p>
            <h2 className="text-3xl font-bold mt-2">Verification Overview</h2>
            <p className="opacity-85 mt-2 max-w-2xl">
              Monitor every provider credential in one place and take action with a single tap.
            </p>
          </div>
          <div className="bg-white/15 rounded-2xl px-4 py-3 backdrop-blur-md flex items-center gap-3">
            <Users className="w-10 h-10" />
            <div>
              <p className="text-sm uppercase tracking-wider opacity-80">Total Providers</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-lg border border-white/20">
            <p className="text-sm uppercase tracking-wider opacity-80">Approved</p>
            <p className="text-2xl font-semibold mt-1">{stats.approved}</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-lg border border-white/20">
            <p className="text-sm uppercase tracking-wider opacity-80">Pending</p>
            <p className="text-2xl font-semibold mt-1">{stats.pending}</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-lg border border-white/20">
            <p className="text-sm uppercase tracking-wider opacity-80">Rejected</p>
            <p className="text-2xl font-semibold mt-1">{stats.rejected}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
          <ShieldAlert className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-20">
          <Loader2 className="mr-2 h-8 w-8 animate-spin text-[var(--brand-primary)]" />
          <p className="mt-3 text-gray-500 font-medium">Loading provider credentials...</p>
        </div>
      ) : providers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-lg font-semibold text-gray-700">No providers yet</p>
          <p className="text-sm text-gray-500">
            As soon as providers register, their documents will appear here for verification.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {providers.map((provider) => (
            <div
              key={provider._id}
              className="rounded-3xl bg-white p-6 shadow-[0_25px_50px_rgba(15,23,42,0.07)] border border-gray-100 transition hover:-translate-y-1"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400">Provider</p>
                  <h3 className="text-2xl font-semibold text-gray-900">{provider.name}</h3>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                    <span>{provider.email}</span>
                    {provider.phone && <span className="text-gray-400">•</span>}
                    {provider.phone && <span>{provider.phone}</span>}
                    {(provider.city || provider.location) && <span className="text-gray-400">•</span>}
                    {(provider.city || provider.location) && (
                      <span>
                        {provider.city}
                        {provider.location ? `, ${provider.location}` : ""}
                      </span>
                    )}
                  </div>
                  {provider.serviceType && (
                    <p className="mt-1 text-sm text-gray-500">
                      Service Type: <span className="font-medium text-gray-700">{provider.serviceType}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${statusClasses[provider.verificationStatus]}`}>
                    {provider.verificationStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                    Credentials & Documents
                  </p>
                  {renderDocuments(provider)}
                </div>

                <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleVerification(provider._id, "approved")}
                    style={gradientButtonStyle}
                    className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={actionLoading === `${provider._id}-approved`}
                  >
                    {actionLoading === `${provider._id}-approved` ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Approve
                  </button>
                  {provider.verificationStatus !== "pending" && (
                    <button
                      onClick={() => handleVerification(provider._id, "pending")}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-5 py-2 text-sm font-semibold text-amber-700 transition hover:border-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={actionLoading === `${provider._id}-pending`}
                    >
                      {actionLoading === `${provider._id}-pending` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShieldAlert className="h-4 w-4" />
                      )}
                      Mark Pending
                    </button>
                  )}
                  {provider.verificationStatus !== "rejected" && (
                    <button
                      onClick={() => handleVerification(provider._id, "rejected")}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-5 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={actionLoading === `${provider._id}-rejected`}
                    >
                      {actionLoading === `${provider._id}-rejected` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShieldAlert className="h-4 w-4" />
                      )}
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProvidersList;

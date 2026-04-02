import { useEffect, useState, useRef } from "react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { getCardImageUrl } from "../../utils/imageHelper";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  CreditCard,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  ShoppingBag,
  Trash2,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

type Me = {
  _id: string;
  name: string;
  email: string;
  role: "agent" | "STANDARD_AGENT" | "SUPER_ELITE_AGENT";
  agentEnabled?: boolean;
  agentType?: "individual" | "corporate";
  verificationStatus?: "pending" | "approved" | "rejected";
  isVerified?: boolean;
};

type ReferredStandardAgent = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  cityOfResidence?: string;
  primaryLocation?: string;
  createdAt: string;
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
  recentProfessionalBookings: Array<{
    _id: string;
    date: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    professionalPrice: number | null;
    serviceSeekerRequirements: string;
    note: string;
    createdAt: string;
    professional: {
      fullName: string;
      serviceType?: string;
      city?: string;
    } | null;
    customer: { name: string; email: string | null; phone: string | null } | null;
    commissionEtb: number | null;
    referralRecordStatus: string | null;
  }>;
};

type IdDocumentType = "fayda" | "kebele_id" | "driving_licence" | "passport";

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
  photo?: string;
  idAttachment?: string;
  idDocumentType?: IdDocumentType;
  guarantorFullName?: string;
  guarantorPhone?: string;
  guarantorCity?: string;
  guarantorPrimaryLocation?: string;
  guarantorIdAttachment?: string;
  guarantorPhoto?: string;
};

type EditProfessionalForm = {
  fullName: string;
  phone: string;
  email: string;
  whatsapp: string;
  telegram: string;
  city: string;
  location: string;
  serviceType: string;
  notes: string;
};

type ServicesOfferedItem = {
  id: string;
  serviceName: string;
  price: string;
  description: string;
};

/** Homehub brand: blue + orange, alternated across actions */
const brand = {
  shell: "h-[100dvh] min-h-0 flex flex-col overflow-hidden bg-gradient-to-br from-orange-50/60 via-white to-blue-50/70",
  scroll: "flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden overscroll-y-contain [scrollbar-gutter:stable]",
  inner: "w-full max-w-[100vw] px-3 min-[400px]:px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 sm:py-5 md:py-6 lg:py-8",
  btnBlue:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45",
  btnOrange:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-orange-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45",
  btnGradient:
    "w-full rounded-xl bg-gradient-to-r from-orange-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:from-orange-700 hover:to-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 disabled:opacity-60",
  outlineBlue:
    "inline-flex items-center justify-center gap-2 rounded-xl border-2 border-blue-600 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
  outlineOrange:
    "inline-flex items-center justify-center gap-2 rounded-xl border-2 border-orange-500 bg-white px-4 py-2 text-sm font-semibold text-orange-700 shadow-sm transition hover:bg-orange-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2",
  input:
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
  inputAlt:
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100",
} as const;

const ID_DOCUMENT_OPTIONS: { value: "" | IdDocumentType; label: string }[] = [
  { value: "", label: "Select document type…" },
  { value: "fayda", label: "Fayda" },
  { value: "kebele_id", label: "Kebele ID" },
  { value: "driving_licence", label: "Driving licence" },
  { value: "passport", label: "Passport" },
];

const idDocumentTypeLabel = (t?: string | null) =>
  ID_DOCUMENT_OPTIONS.find((o) => o.value === t)?.label || (t || "—");

const formatVerificationStatus = (status: "pending" | "approved" | "rejected") => {
  if (status === "approved") return "Verified";
  if (status === "rejected") return "Rejected";
  return "Pending";
};

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [me, setMe] = useState<Me | null>(null);
  const [dash, setDash] = useState<AgentDashboardResponse | null>(null);
  const [myProfessionals, setMyProfessionals] = useState<MyProfessional[]>([]);
  const [directoryQuery, setDirectoryQuery] = useState("");
  const [directoryServiceType, setDirectoryServiceType] = useState("");
  const [adding, setAdding] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreviewUrl, setProfilePhotoPreviewUrl] = useState<string | null>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const [idAttachmentFile, setIdAttachmentFile] = useState<File | null>(null);
  const [idDocumentType, setIdDocumentType] = useState<"" | IdDocumentType>("");
  const idAttachmentInputRef = useRef<HTMLInputElement>(null);
  const [guarantorIdAttachmentFile, setGuarantorIdAttachmentFile] = useState<File | null>(null);
  const [guarantorPhotoFile, setGuarantorPhotoFile] = useState<File | null>(null);
  const guarantorIdAttachmentInputRef = useRef<HTMLInputElement>(null);
  const guarantorPhotoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profilePhotoFile) {
      setProfilePhotoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(profilePhotoFile);
    setProfilePhotoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [profilePhotoFile]);

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
    guarantorFullName: "",
    guarantorPhone: "",
    guarantorCity: "",
    guarantorPrimaryLocation: "",
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
  const [bookingActionId, setBookingActionId] = useState<string | null>(null);
  /** Show or hide the full Recent professional bookings table. */
  const [showProfessionalBookingsList, setShowProfessionalBookingsList] = useState(true);
  const [myReferrals, setMyReferrals] = useState<ReferredStandardAgent[]>([]);
  const [referralLoading, setReferralLoading] = useState(false);
  const [creatingReferral, setCreatingReferral] = useState(false);
  const [referralForm, setReferralForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    cityOfResidence: "",
    primaryLocation: "",
    whatsapp: "",
    telegram: "",
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<MyProfessional | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm] = useState<EditProfessionalForm>({
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
  const [editIdDocumentType, setEditIdDocumentType] = useState<"" | IdDocumentType>("");
  const [editIdAttachmentFile, setEditIdAttachmentFile] = useState<File | null>(null);
  const editIdAttachmentInputRef = useRef<HTMLInputElement>(null);

  const accountVerificationStatus =
    me?.verificationStatus || (me?.isVerified ? "approved" : "pending");
  const accountVerificationLabel =
    accountVerificationStatus === "approved"
      ? "Verified"
      : accountVerificationStatus === "rejected"
        ? "Rejected"
        : "Pending";
  const accountVerificationBadgeClass =
    accountVerificationStatus === "approved"
      ? "bg-green-100 text-green-700 border border-green-200"
      : accountVerificationStatus === "rejected"
        ? "bg-red-100 text-red-700 border border-red-200"
        : "bg-amber-100 text-amber-700 border border-amber-200";

  const agentTierLabel = me?.agentType === "corporate" ? "Super / Elite" : "Standard";
  const canReferStandardAgents =
    me?.role === "SUPER_ELITE_AGENT" || (me?.role === "agent" && me?.agentType === "corporate");
  /** All agent roles may list/add professionals (API allows any agent). */
  const canAddProfessionals =
    me?.role === "agent" ||
    me?.role === "STANDARD_AGENT" ||
    me?.role === "SUPER_ELITE_AGENT";

  const extractServiceTypeTokens = (value?: string | null) =>
    (value || "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

  const serviceTypeOptions = Array.from(
    new Set(myProfessionals.flatMap((p) => extractServiceTypeTokens(p.serviceType)))
  ).sort((a, b) => a.localeCompare(b));

  const normalizedQuery = directoryQuery.trim().toLowerCase();
  const normalizedServiceType = directoryServiceType.trim().toLowerCase();

  const filteredMyProfessionals = myProfessionals.filter((p) => {
    const matchesQuery = !normalizedQuery || p.fullName.toLowerCase().includes(normalizedQuery);
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

        if (
          meRes.data.role !== "agent" &&
          meRes.data.role !== "STANDARD_AGENT" &&
          meRes.data.role !== "SUPER_ELITE_AGENT"
        ) {
          navigate("/dashboard");
          return;
        }

        setMe(meRes.data);

        const dashRes = await axios.get<AgentDashboardResponse>("/agents/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDash(dashRes.data);

        const myRes = await axios.get<{ professionals: MyProfessional[] }>(
          "/agents/my-professionals",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMyProfessionals(myRes.data.professionals || []);

        const isSuperElite =
          meRes.data.role === "SUPER_ELITE_AGENT" ||
          (meRes.data.role === "agent" && meRes.data.agentType === "corporate");
        if (isSuperElite) {
          setReferralLoading(true);
          const refsRes = await axios.get<{ referrals: ReferredStandardAgent[] }>(
            "/agents/my-referrals",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setMyReferrals(refsRes.data.referrals || []);
          setReferralLoading(false);
        }
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
    return (
      <div className={brand.shell}>
        <div className={brand.scroll}>
          <div className={`${brand.inner} min-h-full`}>
            <div className="h-9 w-44 animate-pulse rounded-lg bg-gradient-to-r from-blue-100 to-orange-100" />
            <div className="mt-5 h-28 animate-pulse rounded-2xl bg-white/90 shadow-sm ring-1 ring-blue-100/80" />
            <div className="mt-6 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-24 animate-pulse rounded-2xl ring-1 ${
                    i % 2 === 0 ? "bg-blue-50/80 ring-blue-100/60" : "bg-orange-50/80 ring-orange-100/60"
                  }`}
                />
              ))}
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="h-72 animate-pulse rounded-2xl bg-white/90 ring-1 ring-blue-100/70 sm:h-80" />
              <div className="h-72 animate-pulse rounded-2xl bg-white/90 ring-1 ring-orange-100/70 sm:h-80" />
            </div>
          </div>
        </div>
      </div>
    );
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

  const refreshAgentDashboard = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const dashRes = await axios.get<AgentDashboardResponse>("/agents/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setDash(dashRes.data);
  };

  const refreshMyReferrals = async () => {
    const token = localStorage.getItem("token");
    if (!token || !canReferStandardAgents) return;
    const refsRes = await axios.get<{ referrals: ReferredStandardAgent[] }>("/agents/my-referrals", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMyReferrals(refsRes.data.referrals || []);
  };

  const submitStandardAgentReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !canReferStandardAgents) return;
    try {
      setCreatingReferral(true);
      await axios.post(
        "/agents/refer",
        {
          ...referralForm,
          name: referralForm.name.trim(),
          email: referralForm.email.trim().toLowerCase(),
          phone: referralForm.phone.trim(),
          password: referralForm.password,
          cityOfResidence: referralForm.cityOfResidence.trim(),
          primaryLocation: referralForm.primaryLocation.trim(),
          whatsapp: referralForm.whatsapp.trim(),
          telegram: referralForm.telegram.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReferralForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        cityOfResidence: "",
        primaryLocation: "",
        whatsapp: "",
        telegram: "",
      });
      await refreshMyReferrals();
      alert("Standard agent referred successfully.");
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || "Failed to create referral");
    } finally {
      setCreatingReferral(false);
    }
  };

  const confirmProfessionalBooking = async (bookingId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    if (!window.confirm("Mark this booking as confirmed?")) return;
    setBookingActionId(bookingId);
    try {
      await axios.put(
        `/bookings/${bookingId}`,
        { status: "confirmed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await refreshAgentDashboard();
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || "Could not confirm booking");
    } finally {
      setBookingActionId(null);
    }
  };

  const deleteProfessionalBooking = async (bookingId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    if (
      !window.confirm(
        "Delete this booking permanently? Commission records tied to it will be removed. This cannot be undone."
      )
    )
      return;
    setBookingActionId(bookingId);
    try {
      await axios.delete(`/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await refreshAgentDashboard();
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || "Could not delete booking");
    } finally {
      setBookingActionId(null);
    }
  };

  const verifyProfessional = async (professionalId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    if (!window.confirm("Verify this professional now?")) return;
    try {
      await axios.patch(`/agents/my-professionals/${professionalId}/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await refreshMyProfessionals();
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || "Failed to verify professional");
    }
  };

  const deleteProfessional = async (professionalId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    if (
      !window.confirm(
        "Delete this professional permanently? This action cannot be undone."
      )
    )
      return;
    try {
      await axios.delete(`/agents/my-professionals/${professionalId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await refreshMyProfessionals();
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || "Failed to delete professional");
    }
  };

  const openEditModal = (professional: MyProfessional) => {
    setEditingProfessional(professional);
    setEditForm({
      fullName: professional.fullName || "",
      phone: professional.phone || "",
      email: professional.email || "",
      whatsapp: professional.whatsapp || "",
      telegram: professional.telegram || "",
      city: professional.city || "",
      location: professional.location || "",
      serviceType: professional.serviceType || "",
      notes: professional.notes || "",
    });
    setEditIdDocumentType((professional.idDocumentType as IdDocumentType) || "");
    setEditIdAttachmentFile(null);
    if (editIdAttachmentInputRef.current) editIdAttachmentInputRef.current.value = "";
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingProfessional(null);
    setEditSaving(false);
    setEditIdAttachmentFile(null);
    setEditIdDocumentType("");
    if (editIdAttachmentInputRef.current) editIdAttachmentInputRef.current.value = "";
  };

  const submitProfessionalUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !editingProfessional) return;
    if (!editForm.fullName.trim() || !editForm.phone.trim()) {
      alert("Full name and phone are required.");
      return;
    }

    try {
      setEditSaving(true);
      if (editIdAttachmentFile && !editIdDocumentType) {
        alert("Select ID document type when uploading an ID attachment.");
        setEditSaving(false);
        return;
      }

      const formData = new FormData();
      formData.append("fullName", editForm.fullName.trim());
      formData.append("phone", editForm.phone.trim());
      formData.append("email", editForm.email.trim());
      formData.append("whatsapp", editForm.whatsapp.trim());
      formData.append("telegram", editForm.telegram.trim());
      formData.append("serviceType", editForm.serviceType.trim());
      formData.append("city", editForm.city.trim());
      formData.append("location", editForm.location.trim());
      formData.append("notes", editForm.notes.trim());
      if (editIdAttachmentFile) {
        formData.append("idAttachment", editIdAttachmentFile);
        formData.append("idDocumentType", editIdDocumentType);
      } else if (editIdDocumentType && editingProfessional.idAttachment) {
        formData.append("idDocumentType", editIdDocumentType);
      }

      await axios.put(`/agents/my-professionals/${editingProfessional._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await refreshMyProfessionals();
      closeEditModal();
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || "Failed to update professional");
    } finally {
      setEditSaving(false);
    }
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

      if (idAttachmentFile && !idDocumentType) {
        setError(
          "Select ID document type (Fayda, Kebele ID, Driving licence, or Passport) when uploading an ID attachment."
        );
        return;
      }

      const formData = new FormData();
      formData.append("fullName", addForm.fullName.trim());
      formData.append("phone", addForm.phone.trim());
      if (addForm.email.trim()) formData.append("email", addForm.email.trim());
      if (addForm.whatsapp.trim()) formData.append("whatsapp", addForm.whatsapp.trim());
      if (addForm.telegram.trim()) formData.append("telegram", addForm.telegram.trim());
      if (addForm.city.trim()) formData.append("city", addForm.city.trim());
      if (addForm.location.trim()) formData.append("location", addForm.location.trim());
      formData.append("serviceType", computedServiceType);
      formData.append("notes", computedNotes);
      if (profilePhotoFile) {
        formData.append("photo", profilePhotoFile);
      }
      if (idAttachmentFile && idDocumentType) {
        formData.append("idAttachment", idAttachmentFile);
        formData.append("idDocumentType", idDocumentType);
      }
      if (addForm.guarantorFullName.trim()) {
        formData.append("guarantorFullName", addForm.guarantorFullName.trim());
      }
      if (addForm.guarantorPhone.trim()) {
        formData.append("guarantorPhone", addForm.guarantorPhone.trim());
      }
      if (addForm.guarantorCity.trim()) {
        formData.append("guarantorCity", addForm.guarantorCity.trim());
      }
      if (addForm.guarantorPrimaryLocation.trim()) {
        formData.append("guarantorPrimaryLocation", addForm.guarantorPrimaryLocation.trim());
      }
      if (guarantorIdAttachmentFile) {
        formData.append("guarantorIdAttachment", guarantorIdAttachmentFile);
      }
      if (guarantorPhotoFile) {
        formData.append("guarantorPhoto", guarantorPhotoFile);
      }

      await axios.post("/agents/my-professionals", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfilePhotoFile(null);
      if (profilePhotoInputRef.current) profilePhotoInputRef.current.value = "";
      setIdAttachmentFile(null);
      setIdDocumentType("");
      if (idAttachmentInputRef.current) idAttachmentInputRef.current.value = "";
      setGuarantorIdAttachmentFile(null);
      setGuarantorPhotoFile(null);
      if (guarantorIdAttachmentInputRef.current) guarantorIdAttachmentInputRef.current.value = "";
      if (guarantorPhotoInputRef.current) guarantorPhotoInputRef.current.value = "";

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
        guarantorFullName: "",
        guarantorPhone: "",
        guarantorCity: "",
        guarantorPrimaryLocation: "",
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
    setProfilePhotoFile(file || null);
  };

  const handleIdAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setIdAttachmentFile(file || null);
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
    <div className={brand.shell}>
      <div className={brand.scroll}>
        <div className={`${brand.inner} min-h-full`}>
          <div className="rounded-2xl border border-blue-100/60 bg-white/95 shadow-xl shadow-blue-900/[0.06] ring-1 ring-orange-100/40 p-4 sm:p-6 md:p-8 lg:p-10 relative overflow-hidden sm:rounded-3xl">
            <div
              className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-orange-500 via-blue-600 to-orange-500"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-blue-400/15 to-orange-300/15 blur-3xl"
              aria-hidden
            />

            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 lg:gap-8">
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-900 ring-1 ring-blue-200/60">
                  <LayoutDashboard className="h-3.5 w-3.5 shrink-0 text-orange-600" aria-hidden />
                  Agent workspace
                </span>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 min-[400px]:text-3xl sm:text-4xl">
                  {agentTierLabel} Agent Dashboard
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 min-[400px]:text-base sm:text-lg leading-relaxed">
                  Welcome{me?.name ? `, ${me.name}` : ""}. Track referrals, commissions, and the
                  professionals you connect to Homehub.
                </p>
                <span className={`inline-flex mt-3 px-3 py-1 rounded-full text-xs font-semibold ${accountVerificationBadgeClass}`}>
                  Super Admin Verification: {accountVerificationLabel}
                </span>
              </div>
              <button
                type="button"
                className={`${brand.btnOrange} w-full shrink-0 sm:w-auto px-5 py-2.5`}
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Log out
              </button>
            </div>

          {error && (
            <div className="relative mt-6 rounded-2xl border border-red-200/90 bg-red-50/90 px-4 py-3 text-red-800 text-sm sm:text-base shadow-sm">
              {error}
            </div>
          )}

          {/* Stats */}
          {dash && !error && canReferStandardAgents && (
            <>
              <div className="relative mt-6 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4 sm:mt-8 sm:gap-4">
                <div className="group rounded-2xl border border-blue-200/60 bg-gradient-to-br from-blue-50/95 to-white p-4 shadow-sm ring-1 ring-blue-100/40 transition hover:shadow-md sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-medium text-slate-600">Total referrals</div>
                    <span className="rounded-xl bg-blue-600/10 p-2 text-blue-700 ring-1 ring-blue-200/50">
                      <Users className="h-4 w-4" aria-hidden />
                    </span>
                  </div>
                  <div className="mt-3 text-2xl font-bold tabular-nums tracking-tight text-slate-900 min-[400px]:text-3xl">
                    {dash.stats.totalReferrals}
                  </div>
                </div>
                <div className="group rounded-2xl border border-orange-200/60 bg-gradient-to-br from-orange-50/95 to-white p-4 shadow-sm ring-1 ring-orange-100/40 transition hover:shadow-md sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-medium text-slate-600">Registrations</div>
                    <span className="rounded-xl bg-orange-600/10 p-2 text-orange-700 ring-1 ring-orange-200/50">
                      <UserPlus className="h-4 w-4" aria-hidden />
                    </span>
                  </div>
                  <div className="mt-3 text-2xl font-bold tabular-nums tracking-tight text-slate-900 min-[400px]:text-3xl">
                    {dash.stats.registrationReferrals}
                  </div>
                </div>
                <div className="group rounded-2xl border border-blue-200/60 bg-gradient-to-br from-blue-50/95 to-white p-4 shadow-sm ring-1 ring-blue-100/40 transition hover:shadow-md sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-medium text-slate-600">Purchases</div>
                    <span className="rounded-xl bg-blue-600/10 p-2 text-blue-700 ring-1 ring-blue-200/50">
                      <ShoppingBag className="h-4 w-4" aria-hidden />
                    </span>
                  </div>
                  <div className="mt-3 text-2xl font-bold tabular-nums tracking-tight text-slate-900 min-[400px]:text-3xl">
                    {dash.stats.purchaseReferrals}
                  </div>
                </div>
                <div className="group rounded-2xl border border-orange-200/60 bg-gradient-to-br from-orange-50/95 to-white p-4 shadow-sm ring-1 ring-orange-100/40 transition hover:shadow-md min-[480px]:col-span-2 xl:col-span-1 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-medium text-slate-600">Commission earned</div>
                    <span className="rounded-xl bg-orange-600/10 p-2 text-orange-800 ring-1 ring-orange-200/50">
                      <Wallet className="h-4 w-4" aria-hidden />
                    </span>
                  </div>
                  <div className="mt-3 text-2xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-3xl">
                    {new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
                      dash.stats.totalEarnings
                    )}{" "}
                    <span className="text-lg font-semibold text-slate-600">ETB</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
                <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-blue-50/50 to-white p-5 shadow-sm ring-1 ring-slate-900/[0.03]">
                  <div className="text-sm font-semibold text-slate-900">Your referral code</div>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-stretch">
                    <div className="flex-1 rounded-xl border border-blue-100/90 bg-white px-3 py-2.5 font-mono text-sm text-blue-950 shadow-inner">
                      {dash.me.referralCode || "—"}
                    </div>
                    <button
                      type="button"
                      onClick={copyReferral}
                      className={`${brand.btnBlue} shrink-0`}
                      disabled={!dash.me.referralCode}
                    >
                      <Copy className="h-4 w-4" aria-hidden />
                      Copy
                    </button>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-500">
                    Share this code so you earn commission when referred users complete paid bookings.
                  </p>
                </div>
                <div className="rounded-2xl border border-orange-100/70 bg-gradient-to-br from-orange-50/30 to-white p-5 shadow-sm ring-1 ring-orange-100/40">
                  <div className="text-sm font-semibold text-slate-900">Performance</div>
                  <div className="mt-3 text-sm text-slate-700">
                    <div>
                      <span className="font-medium text-slate-800">Conversion rate:</span>{" "}
                      <span className="tabular-nums text-lg font-bold text-slate-900">
                        {Math.round((dash.stats.conversionRate || 0) * 100)}%
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">
                      Purchases divided by registrations from tracked referrals.
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-blue-100/70 bg-gradient-to-br from-blue-50/30 to-white p-5 shadow-sm ring-1 ring-blue-100/40">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <CreditCard className="h-4 w-4 text-blue-600" aria-hidden />
                    Commission rate
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">
                    Default <span className="font-semibold text-slate-900">50%</span> per paid booking
                    (server setting <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">AGENT_COMMISSION_RATE</span>
                    ).
                  </p>
                </div>
              </div>

              {canReferStandardAgents && (
                <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-2">
                  <div className="rounded-2xl border border-blue-200/70 bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900">Refer Standard Agent</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Create a new Standard Agent account linked to you.
                    </p>
                    <form onSubmit={submitStandardAgentReferral} className="mt-4 grid grid-cols-1 gap-3">
                      <input
                        className={brand.input}
                        placeholder="Full name *"
                        value={referralForm.name}
                        onChange={(e) => setReferralForm((prev) => ({ ...prev, name: e.target.value }))}
                        required
                      />
                      <input
                        type="email"
                        className={brand.input}
                        placeholder="Email *"
                        value={referralForm.email}
                        onChange={(e) => setReferralForm((prev) => ({ ...prev, email: e.target.value }))}
                        required
                      />
                      <input
                        className={brand.input}
                        placeholder="Phone *"
                        value={referralForm.phone}
                        onChange={(e) => setReferralForm((prev) => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                      <input
                        type="password"
                        className={brand.input}
                        placeholder="Temporary password *"
                        value={referralForm.password}
                        onChange={(e) => setReferralForm((prev) => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <input
                        className={brand.input}
                        placeholder="City of residence"
                        value={referralForm.cityOfResidence}
                        onChange={(e) =>
                          setReferralForm((prev) => ({ ...prev, cityOfResidence: e.target.value }))
                        }
                      />
                      <input
                        className={brand.input}
                        placeholder="Primary location *"
                        value={referralForm.primaryLocation}
                        onChange={(e) =>
                          setReferralForm((prev) => ({ ...prev, primaryLocation: e.target.value }))
                        }
                        required
                      />
                      <button type="submit" className={brand.btnBlue} disabled={creatingReferral}>
                        {creatingReferral ? "Creating..." : "Create Referral"}
                      </button>
                    </form>
                  </div>

                  <div className="rounded-2xl border border-orange-200/70 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">My referred Standard Agents</h3>
                      <button type="button" onClick={refreshMyReferrals} className={brand.outlineOrange}>
                        Refresh
                      </button>
                    </div>
                    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full min-w-[28rem] text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-slate-700">Name</th>
                            <th className="px-3 py-2 text-left font-semibold text-slate-700">Email</th>
                            <th className="px-3 py-2 text-left font-semibold text-slate-700">Joined</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {myReferrals.map((r) => (
                            <tr key={r._id}>
                              <td className="px-3 py-2 text-slate-800">{r.name}</td>
                              <td className="px-3 py-2 text-slate-700">{r.email}</td>
                              <td className="px-3 py-2 text-slate-600">
                                {new Date(r.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                          {!referralLoading && myReferrals.length === 0 && (
                            <tr>
                              <td className="px-3 py-4 text-slate-500" colSpan={3}>
                                No referrals yet.
                              </td>
                            </tr>
                          )}
                          {referralLoading && (
                            <tr>
                              <td className="px-3 py-4 text-slate-500" colSpan={3}>
                                Loading referrals...
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {dash && !error && canAddProfessionals && (
            <>
              {/* Bookings for your listed professionals — full list shown on demand */}
              <div className="mt-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                      Recent professional bookings
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Customers booking the professionals you listed. Open the list to review details, confirm, or
                      delete bookings.
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-expanded={showProfessionalBookingsList}
                    onClick={() => setShowProfessionalBookingsList((v) => !v)}
                    className={`${brand.outlineOrange} shrink-0 w-full sm:w-auto py-2.5 px-4 text-sm`}
                  >
                    {showProfessionalBookingsList ? (
                      <>
                        <ChevronUp className="h-4 w-4" aria-hidden />
                        Hide list
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" aria-hidden />
                        View list
                        <span className="tabular-nums text-orange-900/90">
                          ({(dash.recentProfessionalBookings || []).length})
                        </span>
                      </>
                    )}
                  </button>
                </div>
                {showProfessionalBookingsList && (
                  <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/[0.03]">
                    <table className="w-full min-w-[58rem] text-sm">
                      <thead className="bg-gradient-to-r from-blue-600/10 via-orange-500/10 to-blue-600/10">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold text-slate-700">Customer</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-700">Professional</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-700">Scheduled</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-700">Payment</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-700">Commission</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-700 max-w-[10rem]">Note</th>
                          <th className="text-right px-4 py-3 font-semibold text-slate-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(dash.recentProfessionalBookings || []).map((b) => {
                          const st = (b.status || "pending").toLowerCase();
                          const canConfirm = st === "pending";
                          const busy = bookingActionId === b._id;
                          return (
                            <tr key={b._id} className="transition-colors hover:bg-slate-50/80">
                              <td className="px-4 py-3">
                                {b.customer ? (
                                  <div>
                                    <div className="font-medium text-gray-900">{b.customer.name}</div>
                                    <div className="text-xs text-gray-500">
                                      {[b.customer.email, b.customer.phone].filter(Boolean).join(" · ") || "—"}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-500">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {b.professional ? (
                                  <div>
                                    <div className="font-medium text-gray-900">{b.professional.fullName}</div>
                                    <div className="text-xs text-gray-500">
                                      {[b.professional.serviceType, b.professional.city]
                                        .filter(Boolean)
                                        .join(" · ") || "—"}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-500">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                                {new Date(b.date).toLocaleString()}
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold capitalize">
                                  {b.status || "pending"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-xs font-medium text-slate-700 capitalize">
                                  {b.paymentStatus}
                                </span>
                                <div className="text-xs text-slate-500 capitalize">{b.paymentMethod}</div>
                                {b.professionalPrice != null && (
                                  <div className="text-xs text-slate-600 mt-0.5 tabular-nums">
                                    {new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
                                      b.professionalPrice
                                    )}{" "}
                                    ETB
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-gray-700 tabular-nums">
                                {b.commissionEtb != null
                                  ? `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(b.commissionEtb)} ETB`
                                  : b.paymentStatus !== "paid"
                                    ? "After payment"
                                    : "—"}
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-600 max-w-[10rem] align-top">
                                <span className="line-clamp-3 break-words" title={b.note || undefined}>
                                  {b.note?.trim() ? b.note : "—"}
                                </span>
                                {b.serviceSeekerRequirements?.trim() && (
                                  <span
                                    className="mt-1 block line-clamp-3 break-words text-orange-700"
                                    title={b.serviceSeekerRequirements}
                                  >
                                    Req: {b.serviceSeekerRequirements}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right whitespace-nowrap">
                                <div className="inline-flex flex-wrap items-center justify-end gap-2">
                                  {canConfirm && (
                                    <button
                                      type="button"
                                      disabled={busy}
                                      onClick={() => void confirmProfessionalBooking(b._id)}
                                      className={`${brand.outlineBlue} py-1.5 px-2.5 text-xs`}
                                    >
                                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                                      Confirm
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => void deleteProfessionalBooking(b._id)}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:opacity-45"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {(!dash.recentProfessionalBookings || dash.recentProfessionalBookings.length === 0) && (
                          <tr>
                            <td className="px-4 py-6 text-gray-600" colSpan={8}>
                              No professional bookings yet. When customers book your listed professionals, they appear
                              here.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Add / My Professionals */}
          {canAddProfessionals && (
          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 xl:gap-10">
            <div className="rounded-2xl border border-slate-200/80 p-5 sm:p-6 bg-gradient-to-br from-blue-50/35 via-white to-white shadow-sm ring-1 ring-slate-900/[0.03]">
              <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Add professional</h2>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                Submit a lead for review. They can appear on the public catalog once verified by super admin.
              </p>

              <form onSubmit={submitProfessional} className="mt-4 space-y-4">
                {/* Basic Info */}
                <div className="rounded-2xl border border-slate-200/70 p-4 sm:p-5 bg-white/90 shadow-sm">
                  <div className="text-sm font-semibold text-slate-900 mb-3">
                    Basic info
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

                <div className="rounded-2xl border border-slate-200/70 p-4 sm:p-5 bg-white/90 shadow-sm">
                  <div className="text-sm font-semibold text-slate-900 mb-3">
                    Guarantor (optional)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      className={brand.input}
                      placeholder="Guarantor Full Name"
                      value={addForm.guarantorFullName}
                      onChange={(e) =>
                        setAddForm({ ...addForm, guarantorFullName: e.target.value })
                      }
                    />
                    <input
                      className={brand.input}
                      placeholder="Guarantor Phone"
                      value={addForm.guarantorPhone}
                      onChange={(e) =>
                        setAddForm({ ...addForm, guarantorPhone: e.target.value })
                      }
                    />
                    <input
                      className={brand.input}
                      placeholder="Guarantor City"
                      value={addForm.guarantorCity}
                      onChange={(e) =>
                        setAddForm({ ...addForm, guarantorCity: e.target.value })
                      }
                    />
                    <input
                      className={brand.input}
                      placeholder="Guarantor Primary Location"
                      value={addForm.guarantorPrimaryLocation}
                      onChange={(e) =>
                        setAddForm({ ...addForm, guarantorPrimaryLocation: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Services */}
                <div className="rounded-2xl border border-slate-200/70 p-4 sm:p-5 bg-white/90 shadow-sm">
                  <div className="text-sm font-semibold text-slate-900 mb-3">
                    Services offered
                  </div>

                  <div className="space-y-3">
                    {servicesOffered.map((svc, idx) => (
                      <div
                        key={svc.id}
                        className={`rounded-xl border p-3 ${
                          idx % 2 === 0
                            ? "border-blue-200/80 bg-blue-50/50"
                            : "border-orange-200/80 bg-orange-50/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-xs font-semibold text-gray-700">
                            Service {idx + 1}
                          </div>
                          {servicesOffered.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeServiceOffered(svc.id)}
                              className={
                                idx % 2 === 0
                                  ? "rounded-lg border-2 border-orange-500 bg-white px-2 py-1 text-xs font-semibold text-orange-700 transition hover:bg-orange-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-1"
                                  : "rounded-lg border-2 border-blue-600 bg-white px-2 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                              }
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
                      className={`${brand.outlineBlue} w-full py-2.5`}
                    >
                      Add another service
                    </button>
                  </div>
                </div>

                {/* Professional Details */}
                <div className="rounded-2xl border border-slate-200/70 p-4 sm:p-5 bg-white/90 shadow-sm">
                  <div className="text-sm font-semibold text-slate-900 mb-3">
                    Professional details
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Profile Image */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Profile Image Upload
                      </label>
                      <div className="flex items-center gap-3 flex-wrap">
                        <input
                          ref={profilePhotoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                          className="w-full sm:w-auto"
                        />
                        {profilePhotoPreviewUrl && (
                          <img
                            src={profilePhotoPreviewUrl}
                            alt="Profile preview"
                            className="w-14 h-14 rounded-full object-cover border border-gray-200"
                          />
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3 space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        ID attachment (optional)
                      </label>
                      <p className="text-xs text-gray-600">
                        Fayda, Kebele ID, driving licence, or passport — image or PDF.
                      </p>
                      <select
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition"
                        value={idDocumentType}
                        onChange={(e) =>
                          setIdDocumentType((e.target.value || "") as "" | IdDocumentType)
                        }
                      >
                        {ID_DOCUMENT_OPTIONS.map((o) => (
                          <option key={o.value || "none"} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                      <input
                        ref={idAttachmentInputRef}
                        type="file"
                        accept="image/*,.pdf,application/pdf"
                        onChange={handleIdAttachmentChange}
                        className="w-full sm:w-auto text-sm"
                      />
                      {idAttachmentFile && (
                        <div className="text-xs text-gray-600 truncate" title={idAttachmentFile.name}>
                          Selected: {idAttachmentFile.name}
                        </div>
                      )}
                    </div>
                    <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3 space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Guarantor attachment (optional)
                      </label>
                      <p className="text-xs text-gray-600">
                        Guarantor Fayda, Kebele ID, or Passport.
                      </p>
                      <input
                        ref={guarantorIdAttachmentInputRef}
                        type="file"
                        accept="image/*,.pdf,application/pdf"
                        onChange={(e) =>
                          setGuarantorIdAttachmentFile(e.target.files?.[0] || null)
                        }
                        className="w-full sm:w-auto text-sm"
                      />
                      {guarantorIdAttachmentFile && (
                        <div className="text-xs text-gray-600 truncate" title={guarantorIdAttachmentFile.name}>
                          Selected: {guarantorIdAttachmentFile.name}
                        </div>
                      )}
                    </div>
                    <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3 space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Guarantor photo (optional)
                      </label>
                      <input
                        ref={guarantorPhotoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => setGuarantorPhotoFile(e.target.files?.[0] || null)}
                        className="w-full sm:w-auto text-sm"
                      />
                      {guarantorPhotoFile && (
                        <div className="text-xs text-gray-600 truncate" title={guarantorPhotoFile.name}>
                          Selected: {guarantorPhotoFile.name}
                        </div>
                      )}
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

                <button type="submit" disabled={adding} className={brand.btnGradient}>
                  {adding ? "Adding…" : "Add professional"}
                </button>
              </form>
            </div>

            <div className="rounded-2xl border border-slate-200/80 p-5 sm:p-6 bg-gradient-to-br from-slate-50/80 via-white to-blue-50/25 shadow-sm ring-1 ring-slate-900/[0.03]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">My professionals</h2>
                <button
                  type="button"
                  onClick={refreshMyProfessionals}
                  className={`${brand.btnOrange} w-full sm:w-auto`}
                >
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  Refresh
                </button>
              </div>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                Everyone you have submitted and their review status.
              </p>

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

              <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/[0.03]">
                <table className="w-full min-w-[32rem] text-sm">
                  <thead className="bg-gradient-to-r from-orange-500/10 via-blue-600/10 to-orange-500/10">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700">Name</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700">Phone</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700">ID document</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700">Date</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMyProfessionals.map((p) => (
                      <tr key={p._id} className="transition-colors hover:bg-slate-50/80">
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
                            {formatVerificationStatus(p.status).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {p.idAttachment ? (
                            <div className="space-y-1">
                              <div className="text-xs text-gray-500">
                                {idDocumentTypeLabel(p.idDocumentType)}
                              </div>
                              <a
                                href={getCardImageUrl(p.idAttachment) || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-blue-600 hover:underline"
                              >
                                View attachment
                              </a>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(p)}
                              className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                            >
                              Update
                            </button>
                            {p.status !== "approved" && (
                              <button
                                type="button"
                                onClick={() => verifyProfessional(p._id)}
                                className="rounded-lg border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 hover:bg-green-100"
                              >
                                Verify
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => deleteProfessional(p._id)}
                              className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                            >
                              Delete permanently
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredMyProfessionals.length === 0 && (
                      <tr>
                        <td className="px-4 py-6 text-gray-600" colSpan={6}>
                          No professionals match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          )}

          {editModalOpen && editingProfessional && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm min-[480px]:p-4"
              onClick={closeEditModal}
            >
              <div
                className="flex max-h-[min(90vh,calc(100dvh-1.5rem))] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-blue-100/80"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-5 bg-gradient-to-r from-blue-600 via-blue-700 to-orange-500 text-white flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold truncate">Update professional</h3>
                    <p className="text-sm text-white/90 mt-1 truncate">
                      {editingProfessional.fullName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white flex items-center justify-center"
                    aria-label="Close update modal"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={submitProfessionalUpdate} className="p-5 overflow-y-auto space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      className={brand.input}
                      placeholder="Full Name *"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))}
                      required
                    />
                    <input
                      className={brand.input}
                      placeholder="Phone *"
                      value={editForm.phone}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                    <input
                      className={brand.input}
                      placeholder="Email"
                      value={editForm.email}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                    />
                    <input
                      className={brand.input}
                      placeholder="WhatsApp"
                      value={editForm.whatsapp}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
                    />
                    <input
                      className={brand.input}
                      placeholder="Telegram"
                      value={editForm.telegram}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, telegram: e.target.value }))}
                    />
                    <input
                      className={brand.input}
                      placeholder="City"
                      value={editForm.city}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, city: e.target.value }))}
                    />
                    <input
                      className={`${brand.input} sm:col-span-2`}
                      placeholder="Location"
                      value={editForm.location}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, location: e.target.value }))}
                    />
                    <input
                      className={`${brand.input} sm:col-span-2`}
                      placeholder="Service Type"
                      value={editForm.serviceType}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, serviceType: e.target.value }))}
                    />
                    <textarea
                      className={`${brand.input} sm:col-span-2`}
                      placeholder="Notes"
                      rows={4}
                      value={editForm.notes}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                    />

                    <div className={`${brand.input} sm:col-span-2 space-y-2 py-3`}>
                      <div className="text-sm font-semibold text-slate-800">ID attachment</div>
                      {editingProfessional.idAttachment && (
                        <div className="text-xs text-slate-600">
                          Current: {idDocumentTypeLabel(editingProfessional.idDocumentType)} —{" "}
                          <a
                            href={getCardImageUrl(editingProfessional.idAttachment) || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-blue-600 hover:underline"
                          >
                            open file
                          </a>
                        </div>
                      )}
                      <select
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none"
                        value={editIdDocumentType}
                        onChange={(e) =>
                          setEditIdDocumentType((e.target.value || "") as "" | IdDocumentType)
                        }
                      >
                        {ID_DOCUMENT_OPTIONS.map((o) => (
                          <option key={o.value || "none"} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                      <input
                        ref={editIdAttachmentInputRef}
                        type="file"
                        accept="image/*,.pdf,application/pdf"
                        onChange={(e) =>
                          setEditIdAttachmentFile(e.target.files?.[0] || null)
                        }
                        className="w-full text-sm"
                      />
                      {editIdAttachmentFile && (
                        <div className="text-xs text-slate-600 truncate">
                          New file: {editIdAttachmentFile.name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-2">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className={brand.outlineOrange}
                      disabled={editSaving}
                    >
                      Cancel
                    </button>
                    <button type="submit" className={brand.btnBlue} disabled={editSaving}>
                      {editSaving ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;


import axios from "./axios";
import { REGISTRATION_SERVICE_CATEGORIES } from "../constants/registrationServiceCategories";
import type { Service } from "./services";

export interface CreateServiceRequestData {
  fullName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  location: string;
  serviceNeeded: string;
  preferredDate?: string;
  budgetEtb?: number;
  details: string;
  videoDurationSeconds?: number;
}

export const createServiceRequest = async (payload: CreateServiceRequestData | FormData) => {
  const isMultipart = typeof FormData !== "undefined" && payload instanceof FormData;
  const response = await axios.post("/service-requests", payload, isMultipart ? {
    headers: { "Content-Type": "multipart/form-data" },
  } : undefined);
  return response.data;
};

export interface PublicServiceRequest {
  _id: string;
  serviceNeeded: string;
  details: string;
  location: string;
  budgetEtb?: number | null;
  preferredDate?: string | null;
  createdAt: string;
  status: string;
  requesterName: string;
}

function getFourDigitOrderId(id: string): string {
  const raw = String(id || "");
  // Deterministic 4-digit numeric ID based on source id characters.
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) % 10000;
  }
  return String(hash).padStart(4, "0");
}

function inferCategory(serviceNeeded: string, details: string): { category: string; subcategory: string } {
  const hay = `${serviceNeeded} ${details}`.toLowerCase();
  for (const cat of REGISTRATION_SERVICE_CATEGORIES) {
    const categoryName = cat.name.toLowerCase();
    if (hay.includes(categoryName)) {
      const sub = cat.subcategories.find((s) => hay.includes(s.toLowerCase())) || "";
      return { category: cat.name, subcategory: sub };
    }
    const sub = cat.subcategories.find((s) => hay.includes(s.toLowerCase()));
    if (sub) return { category: cat.name, subcategory: sub };
  }
  return { category: "Requested Services", subcategory: "" };
}

export function mapPublicRequestToService(row: PublicServiceRequest): Service {
  const { category, subcategory } = inferCategory(row.serviceNeeded, row.details || "");
  const budget = row.budgetEtb != null && Number(row.budgetEtb) > 0 ? Number(row.budgetEtb) : 0;
  const orderId = getFourDigitOrderId(row._id);
  return {
    id: String(row._id),
    title: row.serviceNeeded,
    description:
      row.details ||
      "Service request posted in the order catalogue. Professionals should contact HomeHub directly to receive this order.",
    category,
    subcategory,
    price: budget,
    priceType: "custom",
    photos: [],
    providerId: "",
    providerName: `Order ID #${orderId}`,
    providerRating: 0,
    serviceRating: null,
    ratingCount: 0,
    isAvailable: row.status === "new" || row.status === "reviewing",
    location: row.location || "",
    createdAt: row.createdAt,
    updatedAt: row.createdAt,
    catalogSource: "request",
    suggestedBookingPrice: budget || undefined,
  };
}

export const getPublicServiceRequests = async (): Promise<PublicServiceRequest[]> => {
  try {
    const response = await axios.get<PublicServiceRequest[]>("/service-requests/public");
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching public service requests:", error);
    return [];
  }
};

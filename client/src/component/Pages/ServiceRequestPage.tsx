import { useMemo, useState } from "react";
import { createServiceRequest } from "../../api/serviceRequests";
import { useTranslation } from "react-i18next";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  serviceNeeded: string;
  preferredDate: string;
  budgetEtb: string;
  details: string;
};

const ServiceRequestPage = () => {
  const { t } = useTranslation();
  const initialForm = useMemo<FormState>(() => {
    let fullName = "";
    let email = "";
    let phone = "";

    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const user = JSON.parse(raw);
        fullName = user?.name || "";
        email = user?.email || "";
        phone = user?.phone || "";
      }
    } catch (error) {
      console.warn("Could not parse local user for service request form");
    }

    return {
      fullName,
      email,
      phone,
      whatsapp: "",
      location: "",
      serviceNeeded: "",
      preferredDate: "",
      budgetEtb: "",
      details: "",
    };
  }, []);

  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

  const getVideoDurationSeconds = (file: File) =>
    new Promise<number>((resolve, reject) => {
      const video = document.createElement("video");
      const objectUrl = URL.createObjectURL(file);
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        const duration = Number(video.duration);
        URL.revokeObjectURL(objectUrl);
        if (!Number.isFinite(duration)) {
          reject(new Error("Could not read video duration"));
          return;
        }
        resolve(duration);
      };
      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Could not load video file"));
      };
      video.src = objectUrl;
    });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      let videoDurationSeconds: number | undefined;
      if (selectedVideo) {
        videoDurationSeconds = Math.ceil(await getVideoDurationSeconds(selectedVideo));
        if (videoDurationSeconds > 30 * 60) {
          setErrorMessage(t("serviceRequest.messages.videoTooLong"));
          setLoading(false);
          return;
        }
      }

      const payload = new FormData();
      payload.append("fullName", form.fullName);
      payload.append("email", form.email);
      payload.append("phone", form.phone);
      payload.append("location", form.location);
      payload.append("serviceNeeded", form.serviceNeeded);
      payload.append("details", form.details);
      if (form.whatsapp.trim()) payload.append("whatsapp", form.whatsapp);
      if (form.preferredDate) payload.append("preferredDate", form.preferredDate);
      if (form.budgetEtb.trim() !== "") payload.append("budgetEtb", String(Number(form.budgetEtb)));
      if (videoDurationSeconds != null) {
        payload.append("videoDurationSeconds", String(videoDurationSeconds));
      }
      selectedPhotos.forEach((file) => payload.append("photos", file));
      if (selectedVideo) payload.append("video", selectedVideo);

      const response = await createServiceRequest(payload);
      setSuccessMessage(
        response?.message || t("serviceRequest.messages.submitted")
      );
      setForm((prev) => ({
        ...prev,
        location: "",
        serviceNeeded: "",
        preferredDate: "",
        budgetEtb: "",
        details: "",
      }));
      setSelectedPhotos([]);
      setSelectedVideo(null);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setErrorMessage(
          t("serviceRequest.messages.endpointUnavailable")
        );
        return;
      }
      setErrorMessage(
        error?.response?.data?.message ||
          t("serviceRequest.messages.failed")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="mx-auto w-full max-w-3xl px-4">
        <div className="mx-auto mt-3 w-full max-w-xl rounded-2xl bg-white p-4 shadow-xl md:p-5">
          <h1 className="text-xl font-bold text-gray-900">{t("serviceRequest.title")}</h1>
          <p className="mt-2 text-gray-600">
            {t("serviceRequest.subtitle")}
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              placeholder={t("serviceRequest.fields.fullName")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
            />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder={t("serviceRequest.fields.email")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
            />
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder={t("serviceRequest.fields.phone")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
            />
            <input
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              placeholder={t("serviceRequest.fields.whatsappOptional")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
            />
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              placeholder={t("serviceRequest.fields.location")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
            />
            <input
              name="serviceNeeded"
              value={form.serviceNeeded}
              onChange={handleChange}
              required
              placeholder={t("serviceRequest.fields.serviceNeeded")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                name="preferredDate"
                type="datetime-local"
                value={form.preferredDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
              />
              <input
                name="budgetEtb"
                type="number"
                min="0"
                value={form.budgetEtb}
                onChange={handleChange}
                placeholder={t("serviceRequest.fields.budget")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>
            <textarea
              name="details"
              value={form.details}
              onChange={handleChange}
              required
              rows={5}
              placeholder={t("serviceRequest.fields.details")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
            />
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("serviceRequest.fields.photosOptional")}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) =>
                    setSelectedPhotos(Array.from(event.target.files || []))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("serviceRequest.fields.videoOptional")}
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(event) =>
                    setSelectedVideo(event.target.files?.[0] || null)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t("serviceRequest.fields.videoHint")}
                </p>
              </div>
            </div>

            {successMessage && (
              <div className="rounded-lg bg-green-50 px-4 py-3 text-green-700">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-red-700">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? t("serviceRequest.buttons.submitting") : t("serviceRequest.buttons.submit")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceRequestPage;

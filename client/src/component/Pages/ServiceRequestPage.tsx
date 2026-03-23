import { useMemo, useState } from "react";
import { createServiceRequest } from "../../api/serviceRequests";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  serviceNeeded: string;
  preferredDate: string;
  budgetEtb: string;
  details: string;
};

const ServiceRequestPage = () => {
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
      const payload = {
        ...form,
        budgetEtb:
          form.budgetEtb.trim() === "" ? undefined : Number(form.budgetEtb),
        preferredDate: form.preferredDate || undefined,
      };

      const response = await createServiceRequest(payload);
      setSuccessMessage(
        response?.message || "Service request submitted. We will contact you soon."
      );
      setForm((prev) => ({
        ...prev,
        location: "",
        serviceNeeded: "",
        preferredDate: "",
        budgetEtb: "",
        details: "",
      }));
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setErrorMessage(
          "Service request endpoint is not available on the current backend. Restart the backend (or deploy latest server changes) and try again."
        );
        return;
      }
      setErrorMessage(
        error?.response?.data?.message ||
          "Failed to submit service request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="mx-auto w-full max-w-3xl px-4">
        <div className="rounded-2xl bg-white p-6 shadow-xl md:p-10">
          <h1 className="text-3xl font-bold text-gray-900">Post a Service Request</h1>
          <p className="mt-2 text-gray-600">
            Tell us what you need, and we will notify the right team/provider.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              placeholder="Full name"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="Email address"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="Phone number"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              placeholder="Location / address"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
            <input
              name="serviceNeeded"
              value={form.serviceNeeded}
              onChange={handleChange}
              required
              placeholder="Service needed (e.g. plumbing, cleaning, electrician)"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                name="preferredDate"
                type="datetime-local"
                value={form.preferredDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
              <input
                name="budgetEtb"
                type="number"
                min="0"
                value={form.budgetEtb}
                onChange={handleChange}
                placeholder="Budget (ETB)"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>
            <textarea
              name="details"
              value={form.details}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Describe your request in detail..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />

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
              className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Service Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceRequestPage;

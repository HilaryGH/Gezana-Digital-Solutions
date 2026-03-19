import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AgentPartnershipAgreementBody } from "../../content/agentPartnershipAgreement";

const AgentsPartnershipAgreementPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to registration
        </Link>

        <header className="mb-8">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
            Legal
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-poppins">
            HomeHub Agents Service / Partnership Agreement
          </h1>
          <p className="mt-3 text-gray-600">
            For <span className="font-semibold">Standard</span>,{" "}
            <span className="font-semibold">Super</span>, and{" "}
            <span className="font-semibold">Elite</span> Agents partnering with
            HomeHub Digital Solutions.
          </p>
        </header>

        <article className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
          <AgentPartnershipAgreementBody />
        </article>
      </div>
    </div>
  );
};

export default AgentsPartnershipAgreementPage;

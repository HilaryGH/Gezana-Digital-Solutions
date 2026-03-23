/**
 * HomeHub Agents Service/Partnership Agreement
 * Applies to Standard, Super/Elite Agents.
 */
export function AgentPartnershipAgreementBody({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`space-y-4 text-sm text-gray-700 leading-relaxed ${className}`}>
      <p>
        <span className="font-semibold text-gray-900">Title:</span> HomeHub Agents
        Service/Partnership Agreement
      </p>
      <p>
        <span className="font-semibold text-gray-900">Scope:</span> This agreement
        applies to <span className="font-semibold">Standard Agents</span> and{" "}
        <span className="font-semibold">Super/Elite Agents</span> partnering with
        HomeHub Digital Solutions.
      </p>
      <p>
        <span className="font-semibold text-gray-900">Parties &amp; Recitals:</span>{" "}
        This agreement is entered into between{" "}
        <span className="font-semibold">HomeHub Digital Solutions</span> (the
        &quot;Platform&quot;) and the <span className="font-semibold">Agent</span>{" "}
        (an individual or company). The Agent wishes to recruit and support
        certified service providers on the Platform in exchange for the tools and
        support described below.
      </p>
      <p>
        <span className="font-semibold text-gray-900">Obligations of Agent:</span> The
        Agent shall recruit certified providers, ensure verification and compliance
        with Platform requirements, promote the Platform ethically and in line with
        brand guidelines, report relevant activities as requested, and shall not
        solicit providers or customers for competing platforms in breach of this
        agreement.
      </p>
      <p>
        <span className="font-semibold text-gray-900">Obligations of HomeHub:</span>{" "}
        HomeHub shall provide operational tools including a dedicated dashboard and
        account access, training and onboarding support, marketing support as made
        available by the Platform, and real-time or near real-time tracking of
        referrals and onboarded providers where technically available.
      </p>
      <p>
        <span className="font-semibold text-gray-900">Term &amp; Termination:</span>{" "}
        The initial term is <span className="font-semibold">one (1) year</span>,
        renewable as agreed by the parties. Either party may terminate for material
        breach, persistent non-performance, or as otherwise provided in Platform
        policies communicated to the Agent.
      </p>
      <p>
        <span className="font-semibold text-gray-900">
          Confidentiality, Data Protection &amp; Intellectual Property:
        </span>{" "}
        The Agent shall protect confidential Platform and user data, use personal
        data only for lawful Platform purposes, and shall not misuse or disclose
        such data except as required by law or with proper authorization. Platform
        software, branding, and materials remain the intellectual property of
        HomeHub.
      </p>
      <p>
        <span className="font-semibold text-gray-900">Liability &amp; Indemnity:</span>{" "}
        To the extent permitted by law, HomeHub&apos;s liability is limited as set
        out in Platform terms. The Agent agrees to indemnify HomeHub against claims
        arising from the Agent&apos;s misrepresentation, negligence, or misconduct in
        recruiting or onboarding providers.
      </p>
      <p>
        <span className="font-semibold text-gray-900">
          Governing Law &amp; Dispute Resolution:
        </span>{" "}
        This agreement is governed by the laws of{" "}
        <span className="font-semibold">Ethiopia</span>. Disputes shall be resolved
        by arbitration in <span className="font-semibold">Addis Ababa</span>, unless
        the parties agree otherwise in writing.
      </p>
      <p>
        <span className="font-semibold text-gray-900">
          Disclaimer &amp; Confirmation:
        </span>{" "}
        I certify that the information contained in this form is true and
        accurate. I have read and accepted the information contained in this
        agreement and confirm that services will be provided as stated in this
        document.
      </p>
      <p className="text-xs text-gray-500 pt-2 border-t border-gray-200">
        This summary is provided for convenience. The full legal terms may be
        supplemented by additional Platform policies, onboarding documents, or
        written addenda signed by the parties.
      </p>
    </div>
  );
}

const bcrypt = require("bcryptjs");
const User = require("../models/User");
const {
  sendStandardAgentReferralInvitationEmail,
  sendReferrerReferralCreatedEmail,
} = require("../utils/emailService");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const isSuperEliteAgent = (user) =>
  Boolean(
    user &&
      ((user.role === "agent" && user.agentType === "corporate") ||
        user.role === "SUPER_ELITE_AGENT")
  );

const assertSuperEliteAgent = (user) => {
  if (!isSuperEliteAgent(user)) {
    const err = new Error("Only SUPER_ELITE_AGENT can refer agents");
    err.statusCode = 403;
    throw err;
  }
};

const createStandardAgentReferral = async ({
  referrerId,
  name,
  email,
  phone,
  password,
  cityOfResidence,
  primaryLocation,
  whatsapp,
  telegram,
}) => {
  const referrer = await User.findById(referrerId).select(
    "_id name email role agentType"
  );
  if (!referrer) {
    const err = new Error("Referrer not found");
    err.statusCode = 404;
    throw err;
  }
  assertSuperEliteAgent(referrer);

  const cleanName = String(name || "").trim();
  const cleanEmail = normalizeEmail(email);
  const cleanPhone = String(phone || "").trim();
  const cleanPassword = String(password || "");
  const cleanCity = String(cityOfResidence || "").trim();
  const cleanPrimaryLocation = String(primaryLocation || "").trim();

  if (!cleanName || !cleanEmail || !cleanPhone || !cleanPassword || !cleanPrimaryLocation) {
    const err = new Error("name, email, phone, password and primaryLocation are required");
    err.statusCode = 400;
    throw err;
  }
  if (!EMAIL_REGEX.test(cleanEmail)) {
    const err = new Error("Invalid email format");
    err.statusCode = 400;
    throw err;
  }
  if (cleanEmail === normalizeEmail(referrer.email)) {
    const err = new Error("Self-referral is not allowed");
    err.statusCode = 400;
    throw err;
  }

  const existingUser = await User.findOne({ email: cleanEmail }).select("_id");
  if (existingUser) {
    const err = new Error("User with this email already exists");
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(cleanPassword, 10);
  const standardAgent = await User.create({
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    password: hashedPassword,
    role: "STANDARD_AGENT",
    agentType: "individual",
    referredBy: referrer._id,
    cityOfResidence: cleanCity || undefined,
    city: cleanCity || undefined,
    primaryLocation: cleanPrimaryLocation,
    whatsapp: String(whatsapp || "").trim() || undefined,
    telegram: String(telegram || "").trim() || undefined,
    agentEnabled: true,
  });

  // Fire-and-forget notifications so referral creation is not blocked by email delays.
  void sendStandardAgentReferralInvitationEmail(
    standardAgent.email,
    standardAgent.name,
    referrer.name
  );
  void sendReferrerReferralCreatedEmail(referrer.email, referrer.name, standardAgent.name, standardAgent.email);

  return standardAgent;
};

const listMyReferredStandardAgents = async ({ referrerId }) => {
  const me = await User.findById(referrerId).select("_id role agentType");
  if (!me) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  assertSuperEliteAgent(me);

  return User.find({
    role: { $in: ["STANDARD_AGENT", "agent"] },
    agentType: "individual",
    referredBy: me._id,
  })
    .select("_id name email phone cityOfResidence primaryLocation createdAt referredBy")
    .sort({ createdAt: -1 })
    .lean();
};

module.exports = {
  createStandardAgentReferral,
  listMyReferredStandardAgents,
};

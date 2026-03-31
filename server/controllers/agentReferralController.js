const {
  createStandardAgentReferral,
  listMyReferredStandardAgents,
} = require("../services/agentReferralService");

const referStandardAgent = async (req, res) => {
  try {
    const created = await createStandardAgentReferral({
      referrerId: req.user.userId,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      cityOfResidence: req.body.cityOfResidence,
      primaryLocation: req.body.primaryLocation,
      whatsapp: req.body.whatsapp,
      telegram: req.body.telegram,
    });

    return res.status(201).json({
      message: "STANDARD_AGENT created successfully",
      agent: {
        id: created._id,
        name: created.name,
        email: created.email,
        role: "STANDARD_AGENT",
        referredBy: created.referredBy,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      message: error.message || "Failed to create referral",
    });
  }
};

const getMyReferrals = async (req, res) => {
  try {
    const referrals = await listMyReferredStandardAgents({ referrerId: req.user.userId });
    return res.json({ referrals });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      message: error.message || "Failed to fetch referrals",
    });
  }
};

module.exports = {
  referStandardAgent,
  getMyReferrals,
};

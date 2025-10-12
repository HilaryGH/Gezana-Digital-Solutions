const Subscription = require("../models/Subscription");
const User = require("../models/User");
const { sendEmail } = require("./emailService");

// Check and update expired subscriptions
const checkExpiredSubscriptions = async () => {
  try {
    const now = new Date();

    // Find all active or trial subscriptions that have expired
    const expiredSubscriptions = await Subscription.find({
      status: { $in: ["active", "trial"] },
      endDate: { $lte: now },
    }).populate("user plan");

    console.log(`Found ${expiredSubscriptions.length} expired subscriptions`);

    for (const subscription of expiredSubscriptions) {
      // Update subscription status
      subscription.status = "expired";
      await subscription.save();

      // Update user
      await User.findByIdAndUpdate(subscription.user._id, {
        subscriptionStatus: "expired",
        currentSubscription: null,
      });

      // Send expiration email
      try {
        await sendEmail({
          to: subscription.user.email,
          subject: "Subscription Expired - Gezana",
          html: `
            <h2>Your Subscription Has Expired</h2>
            <p>Hi ${subscription.user.name},</p>
            <p>Your ${subscription.plan.displayName} subscription has expired.</p>
            <p>To continue enjoying our services, please renew your subscription.</p>
            <p><a href="${process.env.FRONTEND_URL}/subscriptions" style="background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Renew Now</a></p>
            <p>Thank you for using Gezana!</p>
          `,
        });
      } catch (emailError) {
        console.error("Error sending expiration email:", emailError);
      }

      console.log(`Expired subscription for user: ${subscription.user.email}`);
    }

    return expiredSubscriptions.length;
  } catch (error) {
    console.error("Error checking expired subscriptions:", error);
    throw error;
  }
};

// Send reminder emails for subscriptions expiring soon
const sendExpirationReminders = async (daysBefore = 3) => {
  try {
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + daysBefore);

    const subscriptionsToRemind = await Subscription.find({
      status: { $in: ["active"] },
      endDate: {
        $gte: new Date(),
        $lte: reminderDate,
      },
      // Only send reminder if auto-renew is off or payment is pending
      $or: [
        { autoRenew: false },
        { paymentStatus: "pending" },
      ],
    }).populate("user plan");

    console.log(`Sending ${subscriptionsToRemind.length} expiration reminders`);

    for (const subscription of subscriptionsToRemind) {
      try {
        const daysLeft = Math.ceil(
          (subscription.endDate - new Date()) / (1000 * 60 * 60 * 24)
        );

        await sendEmail({
          to: subscription.user.email,
          subject: `Subscription Expiring Soon - ${daysLeft} Days Left`,
          html: `
            <h2>Your Subscription is Expiring Soon</h2>
            <p>Hi ${subscription.user.name},</p>
            <p>Your ${subscription.plan.displayName} subscription will expire in ${daysLeft} days on ${subscription.endDate.toLocaleDateString()}.</p>
            <p>To avoid any interruption to your services, please renew your subscription.</p>
            <p><a href="${process.env.FRONTEND_URL}/subscriptions" style="background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Renew Now</a></p>
            <p>Thank you for being a valued member!</p>
          `,
        });

        console.log(`Sent reminder to: ${subscription.user.email}`);
      } catch (emailError) {
        console.error("Error sending reminder email:", emailError);
      }
    }

    return subscriptionsToRemind.length;
  } catch (error) {
    console.error("Error sending expiration reminders:", error);
    throw error;
  }
};

// Convert trial subscriptions to active when trial ends
const handleTrialConversions = async () => {
  try {
    const now = new Date();

    const trialEndingSubscriptions = await Subscription.find({
      status: "trial",
      trialEndDate: { $lte: now },
      endDate: { $gt: now },
      paymentStatus: "paid", // Only convert if payment is confirmed
    }).populate("user");

    console.log(`Converting ${trialEndingSubscriptions.length} trial subscriptions to active`);

    for (const subscription of trialEndingSubscriptions) {
      subscription.status = "active";
      await subscription.save();

      await User.findByIdAndUpdate(subscription.user._id, {
        subscriptionStatus: "active",
      });

      console.log(`Converted trial to active for: ${subscription.user.email}`);
    }

    return trialEndingSubscriptions.length;
  } catch (error) {
    console.error("Error handling trial conversions:", error);
    throw error;
  }
};

// Run all subscription maintenance tasks
const runSubscriptionMaintenance = async () => {
  console.log("🔄 Running subscription maintenance tasks...");

  try {
    const expiredCount = await checkExpiredSubscriptions();
    const remindersCount = await sendExpirationReminders(3);
    const conversionsCount = await handleTrialConversions();

    console.log("✅ Subscription maintenance completed:");
    console.log(`  - Expired subscriptions: ${expiredCount}`);
    console.log(`  - Reminders sent: ${remindersCount}`);
    console.log(`  - Trial conversions: ${conversionsCount}`);

    return {
      expiredCount,
      remindersCount,
      conversionsCount,
    };
  } catch (error) {
    console.error("❌ Subscription maintenance failed:", error);
    throw error;
  }
};

// Schedule to run daily at midnight
const scheduleSubscriptionMaintenance = () => {
  // Run immediately
  runSubscriptionMaintenance();

  // Then run every 24 hours
  setInterval(runSubscriptionMaintenance, 24 * 60 * 60 * 1000);

  console.log("📅 Scheduled subscription maintenance to run daily");
};

module.exports = {
  checkExpiredSubscriptions,
  sendExpirationReminders,
  handleTrialConversions,
  runSubscriptionMaintenance,
  scheduleSubscriptionMaintenance,
};






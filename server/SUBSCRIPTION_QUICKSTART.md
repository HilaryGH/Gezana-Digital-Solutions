# Subscription System - Quick Start Guide

## 🚀 Setup Instructions

### Step 1: Seed Subscription Plans

Run this command to create default subscription plans:

```bash
cd server
npm run seed:subscriptions
```

This will create:
- 4 Provider plans (Free, Basic, Professional, Enterprise)
- 2 Seeker plans (Free, Premium)

### Step 2: Restart Server

```bash
npm run dev
```

The subscription maintenance scheduler will start automatically.

## 📋 Testing the System

### 1. Get Available Plans

```bash
# Get all plans
curl http://localhost:5000/api/subscriptions/plans

# Get provider plans only
curl http://localhost:5000/api/subscriptions/plans?applicableTo=provider

# Get seeker plans only
curl http://localhost:5000/api/subscriptions/plans?applicableTo=seeker
```

### 2. Subscribe to a Plan (User must be logged in)

```bash
# First, login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Then subscribe (replace TOKEN and PLAN_ID)
curl -X POST http://localhost:5000/api/subscriptions/subscribe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "planId": "PLAN_ID",
    "paymentMethod": "card",
    "transactionId": "TXN123"
  }'
```

### 3. Check Your Subscription

```bash
curl http://localhost:5000/api/subscriptions/my-subscription \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Get Subscription History

```bash
curl http://localhost:5000/api/subscriptions/my-history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔧 Integration Examples

### Protecting Routes with Subscription

```javascript
const { requireActiveSubscription, checkServiceLimit } = require("./middleware/checkSubscription");

// Require active subscription
router.post("/services", 
  authMiddleware, 
  requireActiveSubscription, 
  checkServiceLimit,
  createService
);

// Optional subscription info
router.get("/dashboard", 
  authMiddleware, 
  attachSubscriptionInfo,
  getDashboard
);
```

### Tracking Usage

```javascript
// When creating a service
const subscription = await Subscription.findById(user.currentSubscription);
if (subscription) {
  subscription.usage.servicesCreated += 1;
  await subscription.save();
}

// When receiving a booking
subscription.usage.bookingsReceived += 1;
await subscription.save();
```

### Checking Subscription Status

```javascript
// In your route handler
if (req.hasActiveSubscription) {
  // User has subscription
  const plan = req.plan;
  const commission = plan.commissionRate;
} else {
  // User doesn't have subscription
  // Maybe show upgrade prompt
}
```

## 📊 Admin Operations

### Create Custom Plan

```javascript
POST /api/subscription-plans
{
  "name": "custom_pro",
  "displayName": "Custom Pro",
  "description": "Custom plan for special customers",
  "price": 799,
  "currency": "ETB",
  "duration": {
    "value": 1,
    "unit": "month"
  },
  "maxServices": 20,
  "maxBookingsPerMonth": 100,
  "commissionRate": 11,
  "applicableTo": "provider",
  "isActive": true,
  "trialDays": 10,
  "features": [
    { "name": "Up to 20 services", "included": true, "limit": 20 },
    { "name": "100 bookings/month", "included": true, "limit": 100 }
  ]
}
```

### View All Subscriptions

```javascript
GET /api/subscriptions/admin/all?status=active&page=1&limit=20
```

### Update Plan

```javascript
PUT /api/subscription-plans/:planId
{
  "price": 349,
  "maxServices": 15
}
```

## 🎯 Frontend Integration

### Display Plans

```typescript
// Fetch plans
const response = await fetch('/api/subscriptions/plans?applicableTo=provider');
const { plans } = await response.json();

// Display in UI
plans.forEach(plan => {
  console.log(`${plan.displayName}: ${plan.price} ETB/month`);
});
```

### Subscribe

```typescript
const subscribe = async (planId) => {
  const response = await fetch('/api/subscriptions/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      planId,
      paymentMethod: 'card',
      transactionId: 'TXN_' + Date.now()
    })
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('Subscribed successfully!');
  }
};
```

### Check Current Subscription

```typescript
const checkSubscription = async () => {
  const response = await fetch('/api/subscriptions/my-subscription', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const { hasSubscription, subscription, isActive } = await response.json();
  
  if (hasSubscription && isActive) {
    console.log('Active subscription:', subscription.plan.displayName);
  } else {
    console.log('No active subscription');
  }
};
```

## ⚙️ Automatic Features

The system automatically handles:

1. **Expiration** - Subscriptions are marked as expired when endDate is reached
2. **Reminders** - Email sent 3 days before expiration
3. **Trial Conversion** - Trial subscriptions convert to active after trial period
4. **User Status Updates** - User's subscriptionStatus is kept in sync

These run daily at midnight automatically.

## 🔐 Security Notes

- All subscription endpoints require authentication
- Admin endpoints check for admin role
- Users can only manage their own subscriptions
- Admins can view all subscriptions and manage plans

## 📧 Email Notifications

The system sends emails for:
- Subscription expiration
- Expiration reminders (3 days before)
- Payment confirmations (when integrated)

Make sure email service is configured in `utils/emailService.js`.

## 🎁 Trial Periods

Plans can have trial periods:
- Set `trialDays` in plan (e.g., 7, 14, 30)
- Trial subscriptions have `status: "trial"`
- Trial converts to `active` automatically when trial ends
- Trial requires payment info but won't charge until trial ends

## 💳 Payment Integration

Currently supports manual payment tracking. To integrate payment gateways:

1. **Stripe Integration**
   - Install: `npm install stripe`
   - Create Stripe checkout session
   - Update subscription on webhook

2. **Chapa Integration** (Ethiopian payment)
   - Use Chapa API
   - Create payment link
   - Verify payment status

## 📈 Usage Limits

Plans can have limits:
- `maxServices` - Maximum services a provider can create
- `maxBookingsPerMonth` - Maximum bookings per month
- `maxBookingsAsSeeker` - Maximum bookings for seekers
- `null` = unlimited

Middleware automatically enforces these limits.

## 🐛 Troubleshooting

### Plans not showing?
```bash
# Re-seed plans
npm run seed:subscriptions
```

### Subscription not expiring?
```bash
# Check subscription maintenance logs in server console
# Should run daily at midnight
```

### Can't create service?
- Check if subscription is active
- Verify service limit hasn't been reached
- Check middleware is properly attached

## 📚 Full Documentation

See `SUBSCRIPTION_SYSTEM.md` for complete API documentation.








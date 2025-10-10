# Subscription System Documentation

## Overview

The subscription system allows providers and seekers to subscribe to different plans with varying features and limits.

## Features

- ✅ Multiple subscription plans for providers and seekers
- ✅ Trial periods
- ✅ Auto-renewal
- ✅ Usage tracking (services, bookings)
- ✅ Payment status management
- ✅ Automatic expiration handling
- ✅ Email notifications
- ✅ Admin management

## Database Models

### SubscriptionPlan

Defines the available subscription plans with features and pricing.

**Fields:**
- `name`: Unique identifier
- `displayName`: User-friendly name
- `description`: Plan description
- `price`: Monthly price
- `duration`: Plan duration
- `features`: Array of features
- `maxServices`: Max services for providers
- `maxBookingsPerMonth`: Max bookings limit
- `commissionRate`: Commission percentage
- `discountRate`: Discount for seekers
- `applicableTo`: "provider", "seeker", or "both"
- `trialDays`: Free trial days
- `isActive`: Plan availability
- `isPopular`: Featured plan flag

### Subscription

Tracks individual user subscriptions.

**Fields:**
- `user`: Reference to User
- `plan`: Reference to SubscriptionPlan
- `status`: active | cancelled | expired | paused | trial
- `startDate`: Subscription start
- `endDate`: Subscription end
- `trialEndDate`: Trial period end
- `autoRenew`: Auto-renewal flag
- `paymentMethod`: Payment type
- `paymentStatus`: pending | paid | failed | refunded
- `usage`: Service and booking usage tracking

## API Endpoints

### Public Endpoints

#### Get All Plans
```
GET /api/subscriptions/plans?applicableTo=provider
```

**Query Parameters:**
- `applicableTo`: Filter by "provider" or "seeker"

**Response:**
```json
{
  "success": true,
  "plans": [...]
}
```

#### Get Specific Plan
```
GET /api/subscriptions/plans/:planId
```

### User Endpoints (Requires Authentication)

#### Get Current Subscription
```
GET /api/subscriptions/my-subscription
Headers: { "Authorization": "Bearer <token>" }
```

**Response:**
```json
{
  "success": true,
  "hasSubscription": true,
  "subscription": {...},
  "isActive": true,
  "isInTrial": false
}
```

#### Get Subscription History
```
GET /api/subscriptions/my-history
Headers: { "Authorization": "Bearer <token>" }
```

#### Subscribe to Plan
```
POST /api/subscriptions/subscribe
Headers: { "Authorization": "Bearer <token>" }
Content-Type: application/json

Body:
{
  "planId": "plan_id",
  "paymentMethod": "card",
  "transactionId": "TXN123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "subscription": {...}
}
```

#### Update Payment Status
```
PATCH /api/subscriptions/payment/:subscriptionId
Headers: { "Authorization": "Bearer <token>" }

Body:
{
  "paymentStatus": "paid",
  "transactionId": "TXN123",
  "amountPaid": 299
}
```

#### Cancel Subscription
```
POST /api/subscriptions/cancel/:subscriptionId
Headers: { "Authorization": "Bearer <token>" }

Body:
{
  "reason": "No longer needed"
}
```

#### Renew Subscription
```
POST /api/subscriptions/renew/:subscriptionId
Headers: { "Authorization": "Bearer <token>" }

Body:
{
  "paymentMethod": "card",
  "transactionId": "TXN124"
}
```

### Admin Endpoints

#### Get All Subscriptions
```
GET /api/subscriptions/admin/all?status=active&page=1&limit=20
Headers: { "Authorization": "Bearer <admin_token>" }
```

#### Create Subscription Plan
```
POST /api/subscription-plans
Headers: { "Authorization": "Bearer <admin_token>" }

Body: {Plan object}
```

#### Update Plan
```
PUT /api/subscription-plans/:planId
Headers: { "Authorization": "Bearer <admin_token>" }
```

#### Delete Plan
```
DELETE /api/subscription-plans/:planId
Headers: { "Authorization": "Bearer <admin_token>" }
```

#### Toggle Plan Status
```
PATCH /api/subscription-plans/:planId/toggle-status
Headers: { "Authorization": "Bearer <admin_token>" }
```

## Middleware

### requireActiveSubscription
Ensures user has an active subscription.

```javascript
const { requireActiveSubscription } = require("./middleware/checkSubscription");

router.post("/services", authMiddleware, requireActiveSubscription, ...);
```

### checkServiceLimit
Checks if user has reached service creation limit.

```javascript
const { checkServiceLimit } = require("./middleware/checkSubscription");

router.post("/services", 
  authMiddleware, 
  requireActiveSubscription, 
  checkServiceLimit, 
  ...
);
```

### checkBookingLimit
Checks if user has reached booking limit.

```javascript
const { checkBookingLimit } = require("./middleware/checkSubscription");

router.post("/bookings", 
  authMiddleware, 
  requireActiveSubscription, 
  checkBookingLimit, 
  ...
);
```

### attachSubscriptionInfo
Attaches subscription info without blocking (optional).

```javascript
const { attachSubscriptionInfo } = require("./middleware/checkSubscription");

router.get("/profile", authMiddleware, attachSubscriptionInfo, ...);
// req.subscription and req.plan will be available if user has subscription
```

## Usage Tracking

When a provider creates a service or receives a booking, update usage:

```javascript
const subscription = await Subscription.findById(user.currentSubscription);
subscription.usage.servicesCreated += 1;
await subscription.save();
```

When a seeker makes a booking:

```javascript
const subscription = await Subscription.findById(user.currentSubscription);
subscription.usage.bookingsMade += 1;
await subscription.save();
```

## Automatic Maintenance

The system automatically:
1. **Expires subscriptions** when endDate is reached
2. **Sends reminder emails** 3 days before expiration
3. **Converts trial to active** when trial period ends
4. **Updates user subscription status**

Runs daily at midnight (configurable).

## Setup Instructions

### 1. Seed Subscription Plans

```bash
node server/seedSubscriptionPlans.js
```

This creates default plans:
- **Provider Plans:** Free, Basic, Professional, Enterprise
- **Seeker Plans:** Free, Premium

### 2. Environment Variables

Add to `.env`:
```
FRONTEND_URL=http://localhost:5173
```

### 3. Test the System

```bash
# Start server
npm run dev

# The subscription maintenance will start automatically
```

## Default Plans

### Provider Plans

| Plan | Price | Services | Bookings | Commission | Trial |
|------|-------|----------|----------|------------|-------|
| Free | 0 ETB | 3 | 10/month | 15% | 0 days |
| Basic | 299 ETB | 10 | 50/month | 12% | 7 days |
| Professional | 599 ETB | Unlimited | Unlimited | 10% | 14 days |
| Enterprise | 999 ETB | Unlimited | Unlimited | 8% | 30 days |

### Seeker Plans

| Plan | Price | Bookings | Discount | Trial |
|------|-------|----------|----------|-------|
| Free | 0 ETB | 5/month | 0% | 0 days |
| Premium | 199 ETB | Unlimited | 5% | 7 days |

## Error Codes

- `NO_ACTIVE_SUBSCRIPTION`: User doesn't have active subscription
- `SUBSCRIPTION_EXPIRED`: Subscription has expired
- `SERVICE_LIMIT_REACHED`: Maximum services created
- `BOOKING_LIMIT_REACHED`: Maximum bookings reached

## Best Practices

1. Always use `requireActiveSubscription` for provider-only features
2. Update usage counters after successful operations
3. Handle subscription-related errors gracefully in frontend
4. Display remaining limits to users
5. Prompt users to upgrade when limits are reached

## Future Enhancements

- [ ] Stripe/PayPal integration
- [ ] Proration for upgrades/downgrades
- [ ] Multiple payment methods per user
- [ ] Subscription analytics dashboard
- [ ] Referral program
- [ ] Annual billing with discount
- [ ] Custom enterprise plans

## Support

For issues or questions, contact the development team.





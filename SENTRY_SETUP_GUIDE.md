# 🐛 **Sentry Error Tracking Setup Guide**

This guide will help you configure Sentry for comprehensive error tracking and performance monitoring in the Mobilify Pro Admin Panel.

## **📋 Prerequisites**

- Sentry account (free plan supports 5,000 errors/month)
- Email for alerts: `alerts@mobilify.app`
- Deployed application with Sentry SDK already installed

---

## **🚀 Step 1: Create Sentry Account & Project**

### **1.1 Account Setup**

1. **Go to Sentry:** https://sentry.io/
2. **Sign up** with email: `alerts@mobilify.app`
3. **Verify your email** address
4. **Choose plan:** Start with Free plan (5K errors/month)

### **1.2 Create Project**

1. **Click "Create Project"**
2. **Select Platform:** React
3. **Project Configuration:**
   - **Project Name:** `mobilify-admin`
   - **Team:** Default team
   - **Alert Rules:** Enable default alerts

4. **Copy the DSN** (Data Source Name) - you'll need this for environment variables

---

## **⚙️ Step 2: Configure Environment Variables**

### **2.1 Production Environment**

Add to your **Vercel Dashboard** → **Project Settings** → **Environment Variables**:

```env
VITE_SENTRY_DSN=https://YOUR_SENTRY_DSN@sentry.io/PROJECT_ID
```

### **2.2 Staging Environment**

You can use the same Sentry project for staging with environment tags, or create a separate project:

```env
VITE_SENTRY_DSN=https://YOUR_SENTRY_DSN@sentry.io/PROJECT_ID
```

### **2.3 Local Development**

Add to your local `.env.local` file (optional):

```env
# Leave empty to disable Sentry in development
VITE_SENTRY_DSN=
```

---

## **📧 Step 3: Configure Alert Rules**

### **3.1 Email Alerts**

1. **Go to Settings** → **Projects** → **mobilify-admin** → **Alerts**
2. **Create New Alert Rule:**
   - **Name:** `Critical Errors - Production`
   - **Environment:** production
   - **Conditions:**
     - When an event is seen
     - AND the event's level is equal to error or fatal
   - **Actions:** Send email to `alerts@mobilify.app`

### **3.2 Performance Alerts**

1. **Create Performance Alert:**
   - **Name:** `Slow Page Load - Production`
   - **Metric:** Transaction duration
   - **Threshold:** > 3 seconds
   - **Time Window:** 5 minutes
   - **Actions:** Send email notification

### **3.3 Error Rate Alerts**

1. **Create Error Rate Alert:**
   - **Name:** `High Error Rate - Production`
   - **Metric:** Error rate
   - **Threshold:** > 5% in 10 minutes
   - **Actions:** Send email + Slack (if configured)

---

## **🔧 Step 4: Configure Release Tracking**

### **4.1 Update GitHub Actions**

The CI/CD pipeline is already configured to notify Sentry of deployments. Ensure these secrets are set in GitHub:

```yaml
# In GitHub Repository Settings → Secrets
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_ORG=your_sentry_org_slug
SENTRY_PROJECT=mobilify-admin
```

### **4.2 Get Sentry Auth Token**

1. **Go to Sentry** → **Settings** → **Account** → **API** → **Auth Tokens**
2. **Create New Token:**
   - **Name:** `GitHub Actions - Mobilify`
   - **Scopes:** `project:releases`, `org:read`
3. **Copy token** and add to GitHub secrets

---

## **📊 Step 5: Configure Performance Monitoring**

### **5.1 Transaction Sampling**

The application is configured with:
- **Production:** 10% sampling rate (to stay within free limits)
- **Development:** 100% sampling rate (for testing)

### **5.2 Key Transactions to Monitor**

1. **Page Loads:**
   - Dashboard page load
   - Orders page load
   - Menu management page load

2. **User Actions:**
   - Login/logout
   - Order status updates
   - Menu item creation/editing

3. **API Calls:**
   - Firebase authentication
   - Firestore queries
   - File uploads to Firebase Storage

---

## **🎯 Step 6: Custom Error Context**

The application automatically captures:

### **6.1 User Context**
- User ID (Firebase UID)
- Email address
- Restaurant ID
- User role

### **6.2 Application Context**
- Application version
- Environment (production/staging)
- Browser information
- Device information

### **6.3 Custom Tags**
- Restaurant operations (orders, menu, reservations)
- Feature usage tracking
- Performance metrics

---

## **🔍 Step 7: Error Filtering & Privacy**

### **7.1 Data Scrubbing**

Sentry is configured to automatically scrub:
- Password fields
- Credit card numbers
- Personal identification numbers
- Email addresses in error messages

### **7.2 Error Filtering**

The application filters out:
- Network errors (non-actionable)
- Browser extension errors
- Development-only errors in production

### **7.3 Breadcrumbs**

Configured to capture:
- User interactions (clicks, form submissions)
- Navigation events
- API calls
- Console errors (filtered)

---

## **📈 Step 8: Monitoring Dashboard**

### **8.1 Key Metrics to Track**

1. **Error Rate:** Target < 1%
2. **Performance:** Page load < 3 seconds
3. **User Impact:** Affected users per error
4. **Resolution Time:** Time to fix critical errors

### **8.2 Regular Reviews**

1. **Daily:** Check for new critical errors
2. **Weekly:** Review error trends and performance
3. **Monthly:** Analyze user impact and improvement opportunities

---

## **🚨 Step 9: Incident Response**

### **9.1 Error Severity Levels**

1. **Fatal:** Application crashes, data loss
   - **Response Time:** Immediate (< 15 minutes)
   - **Notification:** Email + SMS

2. **Error:** Feature broken, user impact
   - **Response Time:** < 2 hours
   - **Notification:** Email

3. **Warning:** Potential issues, degraded performance
   - **Response Time:** < 24 hours
   - **Notification:** Email digest

### **9.2 Error Investigation Process**

1. **Triage (0-15 minutes):**
   - Assess error severity and user impact
   - Check if error is widespread or isolated
   - Determine if immediate action is needed

2. **Investigation (15-60 minutes):**
   - Review error details and stack trace
   - Check related errors and patterns
   - Identify root cause

3. **Resolution (1+ hours):**
   - Implement fix
   - Deploy to production
   - Monitor for resolution
   - Update error status in Sentry

---

## **🔧 Step 10: Advanced Configuration**

### **10.1 Custom Integrations**

```typescript
// Example: Custom error boundary
import * as Sentry from '@sentry/react';

const SentryErrorBoundary = Sentry.withErrorBoundary(YourComponent, {
  fallback: ({ error, resetError }) => (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={resetError}>Try again</button>
    </div>
  ),
});
```

### **10.2 Performance Profiling**

```typescript
// Example: Custom transaction
const transaction = Sentry.startTransaction({
  name: 'Order Processing',
  op: 'business_operation'
});

// Your business logic here

transaction.finish();
```

---

## **📋 Setup Checklist**

- [ ] Sentry account created with `alerts@mobilify.app`
- [ ] Project `mobilify-admin` created
- [ ] DSN added to Vercel environment variables
- [ ] Email alert rules configured
- [ ] Performance monitoring enabled
- [ ] GitHub Actions integration configured
- [ ] Error filtering and privacy settings applied
- [ ] Custom error context implemented
- [ ] Incident response procedures documented
- [ ] Team trained on Sentry dashboard

---

## **🔗 Quick Links**

- **Sentry Dashboard:** https://sentry.io/organizations/your-org/projects/mobilify-admin/
- **Issues:** https://sentry.io/organizations/your-org/issues/
- **Performance:** https://sentry.io/organizations/your-org/performance/
- **Releases:** https://sentry.io/organizations/your-org/releases/

---

## **📞 Support**

- **Sentry Documentation:** https://docs.sentry.io/
- **Sentry Support:** https://sentry.io/support/
- **Technical Team:** alerts@mobilify.app

---

**Next Steps:** After Sentry is configured, proceed with Google Analytics setup and UptimeRobot monitoring configuration.

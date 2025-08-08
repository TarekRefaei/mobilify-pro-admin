# **GitHub Secrets Configuration Guide**

**Document Version:** 1.0  
**Date:** January 27, 2025  
**Purpose:** Complete guide for configuring GitHub Actions secrets for CI/CD pipeline

---

## **🔐 Required GitHub Secrets**

### **Firebase Configuration Secrets**

#### **Production Firebase (mobilify-pro-admin)**

```
PROD_FIREBASE_API_KEY=AIza...
PROD_FIREBASE_AUTH_DOMAIN=mobilify-pro-admin.firebaseapp.com
PROD_FIREBASE_PROJECT_ID=mobilify-pro-admin
PROD_FIREBASE_STORAGE_BUCKET=mobilify-pro-admin.appspot.com
PROD_FIREBASE_MESSAGING_SENDER_ID=694671130478
PROD_FIREBASE_APP_ID=1:694671130478:web:...
```

#### **Staging Firebase (mobilify-staging)**

```
STAGING_FIREBASE_API_KEY=AIza...
STAGING_FIREBASE_AUTH_DOMAIN=mobilify-staging.firebaseapp.com
STAGING_FIREBASE_PROJECT_ID=mobilify-staging
STAGING_FIREBASE_STORAGE_BUCKET=mobilify-staging.appspot.com
STAGING_FIREBASE_MESSAGING_SENDER_ID=185041473388
STAGING_FIREBASE_APP_ID=1:185041473388:web:...
```

#### **Firebase Admin Token**

```
FIREBASE_TOKEN=1//...
```

### **Vercel Configuration Secrets**

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

### **Monitoring & Analytics Secrets**

```
SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=mobilify-admin
GA_MEASUREMENT_ID=G-...
```

### **Security & Backup Secrets**

```
SNYK_TOKEN=your_snyk_token
GCP_SA_KEY={"type": "service_account", ...}
GCP_PROJECT_ID=mobilify-pro-admin
BACKUP_BUCKET=mobilify-backups
SLACK_WEBHOOK=https://hooks.slack.com/services/...
```

---

## **📋 Step-by-Step Setup Instructions**

### **Step 1: Firebase Configuration**

1. **Get Production Firebase Config:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select `mobilify-pro-admin` project
   - Go to Project Settings → General → Your apps
   - Copy the config object values

2. **Get Staging Firebase Config:**
   - Switch to `mobilify-staging` project
   - Repeat the same process

3. **Generate Firebase Admin Token:**

   ```bash
   firebase login:ci
   ```

   - Copy the generated token

### **Step 2: Vercel Configuration**

1. **Get Vercel Token:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Settings → Tokens → Create Token
   - Copy the token

2. **Get Organization and Project IDs:**
   ```bash
   vercel whoami
   vercel projects ls
   ```

### **Step 3: Monitoring Setup**

1. **Sentry Configuration:**
   - Create account at [Sentry.io](https://sentry.io/)
   - Create new project "mobilify-admin"
   - Get DSN from Project Settings
   - Generate Auth Token from User Settings

2. **Google Analytics:**
   - Create GA4 property
   - Get Measurement ID from Admin → Data Streams

### **Step 4: Security & Backup**

1. **Snyk Token:**
   - Create account at [Snyk.io](https://snyk.io/)
   - Go to Account Settings → API Token

2. **Google Cloud Service Account:**

   ```bash
   # Create service account
   gcloud iam service-accounts create mobilify-backup \
     --display-name="Mobilify Backup Service"

   # Grant necessary permissions
   gcloud projects add-iam-policy-binding mobilify-pro-admin \
     --member="serviceAccount:mobilify-backup@mobilify-pro-admin.iam.gserviceaccount.com" \
     --role="roles/datastore.importExportAdmin"

   # Create and download key
   gcloud iam service-accounts keys create key.json \
     --iam-account=mobilify-backup@mobilify-pro-admin.iam.gserviceaccount.com
   ```

3. **Create Backup Bucket:**
   ```bash
   gsutil mb gs://mobilify-backups
   gsutil lifecycle set backup-lifecycle.json gs://mobilify-backups
   ```

---

## **🔧 Adding Secrets to GitHub**

### **Repository Secrets**

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with the exact name and value

### **Environment Secrets**

1. **Create Environments:**
   - Settings → Environments
   - Create "staging" environment
   - Create "production" environment

2. **Add Environment-Specific Secrets:**
   - Add Firebase configs to respective environments
   - Add deployment protection rules for production

---

## **🧪 Testing the Setup**

### **Test Staging Deployment**

1. **Push to phase-8 branch:**

   ```bash
   git checkout phase-8
   git push origin phase-8
   ```

2. **Check GitHub Actions:**
   - Go to Actions tab
   - Verify all jobs pass
   - Check staging deployment

### **Test Production Deployment**

1. **Merge to main:**

   ```bash
   git checkout main
   git merge phase-8
   git push origin main
   ```

2. **Verify Production:**
   - Check production deployment
   - Verify backup job runs
   - Test monitoring alerts

---

## **🚨 Security Best Practices**

### **Secret Management**

- Never commit secrets to code
- Use environment-specific secrets
- Rotate tokens regularly
- Use least-privilege access

### **Access Control**

- Limit who can modify secrets
- Use environment protection rules
- Enable required reviews for production
- Monitor secret usage

### **Monitoring**

- Set up alerts for failed deployments
- Monitor backup job status
- Track security scan results
- Review access logs regularly

---

## **📞 Troubleshooting**

### **Common Issues**

1. **Firebase Token Expired:**

   ```bash
   firebase logout
   firebase login:ci
   ```

2. **Vercel Deployment Fails:**
   - Check project ID is correct
   - Verify token permissions
   - Check build logs

3. **Backup Job Fails:**
   - Verify service account permissions
   - Check bucket exists
   - Review GCP quotas

### **Debug Commands**

```bash
# Test Firebase connection
firebase projects:list --token $FIREBASE_TOKEN

# Test Vercel connection
vercel whoami --token $VERCEL_TOKEN

# Test GCP connection
gcloud auth activate-service-account --key-file=key.json
gcloud projects list
```

---

## **📊 Monitoring Dashboard**

### **Key Metrics to Track**

- Deployment success rate
- Test coverage percentage
- Security scan results
- Backup completion status
- Performance metrics

### **Alert Thresholds**

- Failed deployment: Immediate
- Test coverage < 90%: Warning
- Security vulnerabilities: High priority
- Backup failure: Critical

---

**Next Steps:** Configure all secrets and test the CI/CD pipeline with a test deployment.

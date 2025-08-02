# 🚀 **Deployment & Maintenance Guide**

## **📋 Overview**

This guide provides step-by-step instructions for deploying, maintaining, and scaling the Mobilify Pro Admin Panel. It covers everything from initial setup to ongoing maintenance procedures.

---

## **🏗️ Initial Deployment Setup**

### **Prerequisites**
- Node.js 18+ installed
- Git configured
- Firebase account
- Vercel account
- Google Cloud account (for backups)

### **Step 1: Repository Setup**
```bash
# Clone the repository
git clone https://github.com/TarekRefaei/mobilify-pro-admin.git
cd mobilify-admin

# Install dependencies
npm install

# Verify installation
npm run build
```

### **Step 2: Firebase Configuration**
1. **Create Firebase Projects:**
   ```
   Production: mobilify-pro-admin
   Staging: mobilify-staging
   ```

2. **Enable Services:**
   - Authentication (Email/Password)
   - Firestore Database
   - Storage
   - Analytics

3. **Configure Security Rules:**
   ```bash
   # Deploy Firestore rules
   firebase deploy --only firestore:rules --project mobilify-pro-admin
   firebase deploy --only firestore:rules --project mobilify-staging
   
   # Deploy Storage rules
   firebase deploy --only storage --project mobilify-pro-admin
   firebase deploy --only storage --project mobilify-staging
   ```

### **Step 3: Vercel Deployment**
1. **Connect Repository:**
   - Link GitHub repository to Vercel
   - Configure auto-deployment from main branch

2. **Environment Variables:**
   ```env
   # Production (.env.vercel.production)
   VITE_FIREBASE_API_KEY=your_production_api_key
   VITE_FIREBASE_AUTH_DOMAIN=mobilify-pro-admin.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=mobilify-pro-admin
   VITE_FIREBASE_STORAGE_BUCKET=mobilify-pro-admin.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_SENTRY_DSN=your_sentry_dsn
   VITE_ENVIRONMENT=production
   VITE_APP_VERSION=1.0.0
   
   # Preview (.env.vercel.preview)
   VITE_FIREBASE_PROJECT_ID=mobilify-staging
   VITE_ENVIRONMENT=staging
   # ... other staging variables
   ```

3. **Build Configuration:**
   ```json
   // vercel.json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

---

## **🔄 Continuous Deployment**

### **GitHub Actions Workflow**
The project includes automated CI/CD pipeline:

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test
      - run: npm run build
```

### **Deployment Process**
1. **Code Changes:** Push to main branch
2. **Automated Testing:** GitHub Actions runs tests
3. **Build:** Vite creates production build
4. **Deploy:** Vercel automatically deploys
5. **Verification:** Health checks confirm deployment

### **Rollback Procedure**
```bash
# List recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]

# Or promote a specific deployment
vercel promote [deployment-url] --scope=production
```

---

## **📊 Monitoring Setup**

### **UptimeRobot Configuration**
1. **Create Monitors:**
   ```
   Monitor 1: Main Application
   URL: https://mobilify-admin-hlp8pmtlc-tarekrefaeis-projects.vercel.app
   Type: HTTP(s)
   Interval: 5 minutes
   
   Monitor 2: Health Endpoint
   URL: https://mobilify-admin-hlp8pmtlc-tarekrefaeis-projects.vercel.app/health
   Type: HTTP(s)
   Keyword: "healthy"
   Interval: 5 minutes
   
   Monitor 3: Login Page
   URL: https://mobilify-admin-hlp8pmtlc-tarekrefaeis-projects.vercel.app/login
   Type: HTTP(s)
   Interval: 5 minutes
   ```

2. **Alert Configuration:**
   - Email: alerts@mobilify.app
   - SMS: Optional for critical alerts
   - Webhook: For integration with other systems

### **Sentry Error Tracking**
1. **Create Sentry Project**
2. **Configure DSN in environment variables**
3. **Set up error alerts and performance monitoring**

### **Google Analytics Setup**
1. **Create GA4 property**
2. **Configure tracking ID**
3. **Set up conversion goals**

---

## **💾 Backup Strategy**

### **Automated Backups**
```yaml
# .github/workflows/backup.yml
name: Weekly Backup
on:
  schedule:
    - cron: '0 2 * * 0'  # Every Sunday at 2 AM UTC

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Backup Production
        run: |
          gcloud firestore export gs://mobilify-backups-2025/production/firestore-backup-$(date +%Y-%m-%d-%H-%M-%S) \
            --project=mobilify-pro-admin
      
      - name: Backup Staging
        run: |
          gcloud firestore export gs://mobilify-backups-2025/staging/firestore-backup-staging-$(date +%Y-%m-%d-%H-%M-%S) \
            --project=mobilify-staging
```

### **Manual Backup**
```bash
# Create manual backup
gcloud firestore export gs://mobilify-backups-2025/manual/backup-$(date +%Y-%m-%d) \
  --project=mobilify-pro-admin

# Verify backup
gsutil ls gs://mobilify-backups-2025/manual/
```

### **Backup Verification**
```powershell
# Run backup status check
./scripts/backup-status.ps1

# Test backup configuration
./scripts/test-backup.ps1 -BucketName "mobilify-backups-2025"
```

---

## **🔧 Maintenance Procedures**

### **Weekly Maintenance**
1. **Review Monitoring Alerts**
   - Check UptimeRobot reports
   - Review Sentry error logs
   - Analyze performance metrics

2. **Security Updates**
   ```bash
   # Check for security vulnerabilities
   npm audit
   
   # Update dependencies
   npm update
   
   # Run security scan
   npm run security:scan
   ```

3. **Performance Review**
   - Run Lighthouse audits
   - Check bundle size
   - Review Core Web Vitals

### **Monthly Maintenance**
1. **Backup Verification**
   - Test backup restoration
   - Verify backup integrity
   - Review storage costs

2. **Security Review**
   - Review Firebase security rules
   - Check access logs
   - Update credentials if needed

3. **Performance Optimization**
   - Analyze user behavior data
   - Optimize slow queries
   - Update caching strategies

### **Quarterly Maintenance**
1. **Dependency Updates**
   ```bash
   # Major dependency updates
   npm outdated
   npm update --save
   
   # Test after updates
   npm run test
   npm run build
   ```

2. **Security Audit**
   - Penetration testing
   - Code security review
   - Access control audit

3. **Disaster Recovery Testing**
   - Test backup restoration
   - Verify failover procedures
   - Update incident response plan

---

## **📈 Scaling Considerations**

### **Performance Optimization**
1. **Code Splitting**
   ```typescript
   // Implement lazy loading for routes
   const OrdersPage = lazy(() => import('./pages/OrdersPage'));
   ```

2. **Bundle Optimization**
   ```bash
   # Analyze bundle size
   npm run build:analyze
   
   # Optimize images
   npm run optimize:images
   ```

3. **Caching Strategy**
   - Vercel Edge Network caching
   - Browser caching headers
   - Service worker implementation

### **Database Scaling**
1. **Firestore Optimization**
   - Index optimization
   - Query optimization
   - Data structure review

2. **Connection Pooling**
   - Firebase SDK optimization
   - Connection management

### **Infrastructure Scaling**
1. **Vercel Pro Features**
   - Enhanced performance
   - Advanced analytics
   - Priority support

2. **CDN Optimization**
   - Global edge locations
   - Image optimization
   - Compression

---

## **🚨 Troubleshooting**

### **Common Issues**

#### **Build Failures**
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build

# Check for TypeScript errors
npm run type-check
```

#### **Deployment Issues**
```bash
# Check Vercel logs
vercel logs --follow

# Redeploy manually
vercel --prod
```

#### **Database Connection Issues**
1. Check Firebase project status
2. Verify environment variables
3. Review Firestore security rules
4. Check API quotas and limits

#### **Performance Issues**
1. Run Lighthouse audit
2. Check bundle size
3. Analyze network requests
4. Review error logs

### **Emergency Procedures**
1. **Immediate Response**
   - Acknowledge incident
   - Assess impact
   - Implement temporary fix

2. **Investigation**
   - Check monitoring dashboards
   - Review error logs
   - Identify root cause

3. **Resolution**
   - Implement permanent fix
   - Test thoroughly
   - Deploy to production

4. **Post-Incident**
   - Document lessons learned
   - Update procedures
   - Improve monitoring

---

## **📚 Resources**

### **Documentation Links**
- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

### **Support Channels**
- **Technical Issues:** GitHub Issues
- **Security Issues:** security@mobilify.app
- **General Support:** support@mobilify.app

### **Training Materials**
- Operations Manual: `/OPERATIONS_MANUAL.md`
- User Guide: `/MANUAL_TESTING_GUIDE.md`
- API Documentation: `/docs/api/`

---

**Last Updated:** 2025-08-02  
**Version:** 1.0  
**Next Review:** 2025-09-02

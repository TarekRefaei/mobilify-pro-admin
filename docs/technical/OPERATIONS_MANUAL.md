# 🔧 **Operations Manual - Mobilify Pro Admin Panel**

## **📋 Overview**

This operations manual provides comprehensive guidance for maintaining, monitoring, and troubleshooting the Mobilify Pro Admin Panel in production. It serves as the primary reference for system administrators, developers, and support staff.

---

## **🏗️ System Architecture**

### **Production Environment**
- **Primary URL:** https://mobilify-admin-hlp8pmtlc-tarekrefaeis-projects.vercel.app
- **Hosting:** Vercel (Auto-deployment from GitHub main branch)
- **Database:** Firebase Firestore (europe-west1)
- **Authentication:** Firebase Authentication
- **Storage:** Firebase Storage
- **CDN:** Vercel Edge Network

### **Technology Stack**
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **State Management:** React Context + Custom Hooks
- **Build Tool:** Vite
- **Package Manager:** npm

---

## **🔐 Access & Credentials**

### **Production Access**
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Firebase Console:** https://console.firebase.google.com/project/mobilify-pro-admin
- **GitHub Repository:** https://github.com/TarekRefaei/mobilify-pro-admin
- **Google Cloud Console:** https://console.cloud.google.com/

### **Demo Account**
- **Email:** demo@cairobites.com
- **Password:** CairoBites2025!
- **Restaurant:** Cairo Bites (كايرو بايتس)

### **Monitoring Accounts**
- **Sentry:** https://sentry.io/organizations/mobilify/
- **UptimeRobot:** https://uptimerobot.com/dashboard
- **Google Analytics:** https://analytics.google.com/

---

## **📊 Monitoring & Alerting**

### **Health Check Endpoints**
```
Primary Health Check: /health
Static Health Check: /api/health.json
```

### **UptimeRobot Monitors**
1. **Mobilify Admin - Production**
   - URL: https://mobilify-admin-hlp8pmtlc-tarekrefaeis-projects.vercel.app
   - Method: GET
   - Interval: 5 minutes

2. **Mobilify Admin - Login Page**
   - URL: https://mobilify-admin-hlp8pmtlc-tarekrefaeis-projects.vercel.app/login
   - Method: GET
   - Interval: 5 minutes

3. **Mobilify Admin - API Health**
   - URL: https://mobilify-admin-hlp8pmtlc-tarekrefaeis-projects.vercel.app/health
   - Method: GET
   - Interval: 5 minutes
   - Keyword: "healthy"

### **Alert Channels**
- **Email:** alerts@mobilify.app
- **Response Time:** < 5 minutes for critical alerts
- **Escalation:** After 15 minutes of downtime

---

## **🔄 Deployment Process**

### **Automatic Deployment**
1. **Trigger:** Push to `main` branch
2. **CI/CD:** GitHub Actions workflow
3. **Build:** Vite production build
4. **Deploy:** Vercel automatic deployment
5. **Duration:** ~2-3 minutes

### **Manual Deployment**
```bash
# Emergency manual deployment
git push origin main --force-with-lease

# Rollback to previous version
vercel rollback [deployment-url]
```

### **Environment Variables**
```env
# Production Environment (.env.vercel.production)
VITE_FIREBASE_API_KEY=AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=mobilify-pro-admin.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mobilify-pro-admin
VITE_FIREBASE_STORAGE_BUCKET=mobilify-pro-admin.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789012345
VITE_SENTRY_DSN=https://ae42cde909db54b78fdd5903f92d9662@o4509767400620032.ingest.de.sentry.io/4509767406714960
VITE_ENVIRONMENT=production
VITE_APP_VERSION=1.0.0
```

---

## **💾 Backup & Recovery**

### **Automated Backups**
- **Schedule:** Weekly (Sundays at 2:00 AM UTC)
- **Retention:** 4 weeks (28 days)
- **Storage:** Google Cloud Storage (gs://mobilify-backups-2025/)
- **Workflow:** GitHub Actions (.github/workflows/backup.yml)

### **Backup Verification**
```powershell
# Check backup status
./scripts/backup-status.ps1

# Test backup configuration
./scripts/test-backup.ps1
```

### **Manual Backup**
```bash
# Create manual backup
gcloud firestore export gs://mobilify-backups-2025/manual/backup-$(date +%Y-%m-%d) --project=mobilify-pro-admin
```

### **Recovery Process**
1. **Identify backup to restore**
2. **Create new Firestore database**
3. **Import backup data**
4. **Update application configuration**
5. **Verify data integrity**

---

## **🚨 Incident Response**

### **Severity Levels**

#### **Critical (P0) - Response: Immediate**
- Complete application unavailability
- Data loss or corruption
- Security breaches
- Authentication system failure

#### **High (P1) - Response: < 1 hour**
- Major feature unavailability
- Performance degradation > 50%
- Error rates > 10%

#### **Medium (P2) - Response: < 4 hours**
- Minor feature issues
- Performance degradation < 50%
- Error rates 1-10%

#### **Low (P3) - Response: < 24 hours**
- UI inconsistencies
- Non-critical feature requests
- Documentation updates

### **Incident Response Steps**
1. **Acknowledge:** Confirm incident within 5 minutes
2. **Assess:** Determine severity and impact
3. **Communicate:** Notify stakeholders
4. **Investigate:** Identify root cause
5. **Resolve:** Implement fix
6. **Verify:** Confirm resolution
7. **Document:** Post-incident review

---

## **🔍 Troubleshooting Guide**

### **Common Issues**

#### **Application Won't Load**
```bash
# Check deployment status
vercel ls

# Check build logs
vercel logs [deployment-url]

# Verify DNS
nslookup mobilify-admin-hlp8pmtlc-tarekrefaeis-projects.vercel.app
```

#### **Authentication Issues**
1. **Check Firebase Console**
2. **Verify environment variables**
3. **Check Firestore security rules**
4. **Review Sentry error logs**

#### **Database Connection Issues**
1. **Check Firebase project status**
2. **Verify Firestore rules**
3. **Check network connectivity**
4. **Review API quotas**

#### **Performance Issues**
1. **Check Lighthouse scores**
2. **Review bundle size**
3. **Analyze network requests**
4. **Check CDN performance**

### **Log Analysis**
```bash
# Vercel function logs
vercel logs --follow

# Sentry error tracking
# Visit: https://sentry.io/organizations/mobilify/

# Firebase logs
# Visit: https://console.firebase.google.com/project/mobilify-pro-admin/logs
```

---

## **📈 Performance Monitoring**

### **Key Metrics**
- **Page Load Time:** < 3 seconds
- **Time to Interactive:** < 5 seconds
- **First Contentful Paint:** < 2 seconds
- **Cumulative Layout Shift:** < 0.1
- **Error Rate:** < 1%

### **Monitoring Tools**
- **Lighthouse:** Automated performance audits
- **Sentry:** Error tracking and performance monitoring
- **Google Analytics:** User behavior and performance
- **UptimeRobot:** Availability monitoring

### **Performance Optimization**
1. **Bundle Analysis:** `npm run build:analyze`
2. **Image Optimization:** WebP format, lazy loading
3. **Code Splitting:** Dynamic imports for routes
4. **Caching:** Vercel Edge Network caching

---

## **🔒 Security**

### **Security Measures**
- **HTTPS:** Enforced on all connections
- **CSP:** Content Security Policy headers
- **Firebase Security Rules:** Multi-tenant data isolation
- **Environment Variables:** Secure credential management
- **Input Validation:** XSS and injection protection

### **Security Monitoring**
- **Sentry:** Security error tracking
- **Firebase:** Authentication monitoring
- **Vercel:** DDoS protection
- **Regular Security Audits:** Monthly reviews

### **Security Incident Response**
1. **Immediate:** Isolate affected systems
2. **Assess:** Determine scope and impact
3. **Contain:** Prevent further damage
4. **Investigate:** Identify attack vector
5. **Recover:** Restore secure operations
6. **Learn:** Update security measures

---

## **📞 Support Contacts**

### **Technical Support**
- **Primary:** Development Team
- **Secondary:** System Administrator
- **Emergency:** On-call engineer

### **Vendor Support**
- **Vercel Support:** https://vercel.com/support
- **Firebase Support:** https://firebase.google.com/support
- **Google Cloud Support:** https://cloud.google.com/support

### **Escalation Matrix**
1. **Level 1:** Development Team (0-2 hours)
2. **Level 2:** Senior Developer (2-8 hours)
3. **Level 3:** Technical Lead (8-24 hours)
4. **Level 4:** External Consultant (24+ hours)

---

## **📚 Additional Resources**

### **Documentation**
- **User Guide:** `/MANUAL_TESTING_GUIDE.md`
- **API Documentation:** `/docs/api/`
- **Deployment Guide:** `/docs/VERCEL_DEPLOYMENT_GUIDE.md`
- **Security Guide:** `/documents/Security_Compliance_Guide.md`

### **Training Materials**
- **Admin Training:** `/documents/User_Onboarding_Guide.md`
- **Developer Onboarding:** `/documents/Coding Standards Guide_ Mobilify Pro Admin Panel.md`
- **Testing Procedures:** `/PRODUCTION_TESTING_PLAN.md`

---

**Last Updated:** 2025-08-02  
**Version:** 1.0  
**Next Review:** 2025-09-02

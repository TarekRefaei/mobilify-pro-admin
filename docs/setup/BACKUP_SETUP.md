# 💾 **Backup Strategy Setup Guide**

This guide will help you configure automated weekly Firestore backups to Google Cloud Storage for the Mobilify Pro Admin Panel.

## **📋 Prerequisites**

- Google Cloud Platform account
- Firebase projects (mobilify-pro-admin, mobilify-staging)
- GitHub repository with Actions enabled
- Email account for notifications (alerts@mobilify.app)

---

## **🚀 Step 1: Create Google Cloud Storage Bucket**

### **1.1 Create Backup Bucket**

1. **Go to Google Cloud Console:**
   - Visit https://console.cloud.google.com/storage
   - Select project: `mobilify-pro-admin`

2. **Create New Bucket:**
   - **Name:** `mobilify-backups-2025` (must be globally unique)
   - **Location:** `europe-west1` (same as Firebase)
   - **Storage Class:** Standard
   - **Access Control:** Uniform (bucket-level)

3. **Configure Lifecycle Rules:**
   - **Rule 1:** Delete objects older than 90 days
   - **Rule 2:** Move to Nearline storage after 30 days

### **1.2 Create Folder Structure**

```bash
# Create folder structure in the bucket
gsutil mkdir gs://mobilify-backups-2025/production
gsutil mkdir gs://mobilify-backups-2025/staging
gsutil mkdir gs://mobilify-backups-2025/manual
```

---

## **🔐 Step 2: Create Service Account**

### **2.1 Create Service Account**

1. **Go to IAM & Admin → Service Accounts:**
   - https://console.cloud.google.com/iam-admin/serviceaccounts

2. **Create Service Account:**
   - **Name:** `mobilify-backup-service`
   - **Description:** `Service account for automated Firestore backups`

3. **Grant Permissions:**
   - `Cloud Datastore Import Export Admin`
   - `Storage Admin`
   - `Firebase Admin`

### **2.2 Generate Service Account Key**

1. **Click on the service account**
2. **Go to Keys tab**
3. **Add Key → Create new key → JSON**
4. **Download the JSON file** (keep it secure!)

---

## **⚙️ Step 3: Configure GitHub Secrets**

### **3.1 Required GitHub Secrets**

Go to **GitHub Repository → Settings → Secrets and variables → Actions**

Add these secrets:

```bash
# Google Cloud Configuration
GCP_SA_KEY=<paste_entire_json_content_from_step_2.2>
BACKUP_BUCKET=mobilify-backups-2025

# Email Notifications (Gmail App Password recommended)
EMAIL_USERNAME=alerts@mobilify.app
EMAIL_PASSWORD=<gmail_app_password>
```

### **3.2 Gmail App Password Setup**

1. **Enable 2-Factor Authentication** on alerts@mobilify.app
2. **Go to Google Account Settings:**
   - https://myaccount.google.com/security
3. **Generate App Password:**
   - Select "Mail" as the app
   - Copy the 16-character password
   - Use this as `EMAIL_PASSWORD` secret

---

## **📅 Step 4: Backup Schedule Configuration**

### **4.1 Current Schedule**

The backup runs automatically:

- **Frequency:** Every Sunday at 2 AM UTC (4 AM Cairo time)
- **Retention:** 4 weeks (28 days)
- **Projects:** Both production and staging

### **4.2 Manual Backup Trigger**

You can trigger backups manually:

1. **Go to GitHub Actions:**
   - https://github.com/your-repo/actions
2. **Select "Weekly Database Backup" workflow**
3. **Click "Run workflow"**
4. **Choose branch and click "Run workflow"**

---

## **🔍 Step 5: Backup Verification**

### **5.1 Verify Backup Creation**

```bash
# List recent backups
gsutil ls gs://mobilify-backups-2025/production/
gsutil ls gs://mobilify-backups-2025/staging/

# Check backup size and date
gsutil du -sh gs://mobilify-backups-2025/production/firestore-backup-*
```

### **5.2 Test Backup Integrity**

```bash
# Download a backup for testing (optional)
gsutil -m cp -r gs://mobilify-backups-2025/production/firestore-backup-YYYY-MM-DD-HH-MM-SS ./test-backup/

# Verify backup contents
ls -la ./test-backup/
```

---

## **📧 Step 6: Email Notifications**

### **6.1 Notification Content**

You'll receive weekly emails with:

- ✅ Backup completion status
- 📊 Backup summary (production + staging)
- 🔗 Direct links to storage and logs
- 📋 Next steps and troubleshooting

### **6.2 Email Configuration**

- **To:** alerts@mobilify.app
- **From:** Mobilify Backup System
- **Subject:** "Mobilify Pro - Weekly Backup ✅ Completed" or "❌ Failed"
- **Frequency:** Weekly + on failures

---

## **🔄 Step 7: Restore Procedures**

### **7.1 Emergency Restore Process**

```bash
# 1. List available backups
gsutil ls gs://mobilify-backups-2025/production/

# 2. Import backup to new/existing project
gcloud firestore import gs://mobilify-backups-2025/production/firestore-backup-YYYY-MM-DD-HH-MM-SS \
  --project=mobilify-pro-admin

# 3. Verify data integrity
# Check key collections in Firebase Console
```

### **7.2 Partial Restore (Specific Collections)**

```bash
# Restore only specific collections
gcloud firestore import gs://mobilify-backups-2025/production/firestore-backup-YYYY-MM-DD-HH-MM-SS \
  --collection-ids=orders,menuItems \
  --project=mobilify-pro-admin
```

---

## **📊 Step 8: Monitoring & Maintenance**

### **8.1 Regular Checks**

- **Weekly:** Verify backup completion emails
- **Monthly:** Check storage usage and costs
- **Quarterly:** Test restore procedures

### **8.2 Storage Cost Optimization**

```bash
# Check storage usage
gsutil du -sh gs://mobilify-backups-2025/

# Estimated costs (europe-west1):
# - Standard Storage: ~$0.020/GB/month
# - Nearline Storage: ~$0.010/GB/month
# - Expected monthly cost: $5-15 for typical restaurant data
```

---

## **🚨 Step 9: Troubleshooting**

### **9.1 Common Issues**

**Backup Failed - Permission Denied:**

```bash
# Solution: Verify service account permissions
gcloud projects get-iam-policy mobilify-pro-admin
```

**Email Notifications Not Working:**

```bash
# Solution: Check Gmail app password
# Verify EMAIL_USERNAME and EMAIL_PASSWORD secrets
```

**Storage Bucket Access Denied:**

```bash
# Solution: Verify bucket permissions
gsutil iam get gs://mobilify-backups-2025
```

### **9.2 Emergency Contacts**

- **Technical Issues:** alerts@mobilify.app
- **Google Cloud Support:** https://cloud.google.com/support
- **GitHub Actions Support:** https://github.com/support

---

## **📋 Setup Checklist**

- [ ] Google Cloud Storage bucket created (`mobilify-backups-2025`)
- [ ] Service account created with proper permissions
- [ ] Service account JSON key downloaded
- [ ] GitHub secrets configured (GCP*SA_KEY, BACKUP_BUCKET, EMAIL*\*)
- [ ] Gmail app password generated for notifications
- [ ] Manual backup test completed successfully
- [ ] Email notifications verified working
- [ ] Restore procedure documented and tested
- [ ] Team trained on backup monitoring

---

## **🔗 Quick Links**

- **Google Cloud Storage:** https://console.cloud.google.com/storage/browser/mobilify-backups-2025
- **GitHub Actions:** https://github.com/your-repo/actions/workflows/backup.yml
- **Firebase Console (Prod):** https://console.firebase.google.com/project/mobilify-pro-admin
- **Firebase Console (Staging):** https://console.firebase.google.com/project/mobilify-staging

---

## **📞 Support**

- **Backup Documentation:** This guide
- **Technical Support:** alerts@mobilify.app
- **Emergency Restore:** Follow Step 7 procedures

---

**Next Steps:** After backup setup is complete, proceed with Task 7 - Production Testing with Cairo Bites Demo Restaurant.

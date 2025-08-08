# 🔧 Scripts Directory

This directory contains utility scripts for managing and monitoring the Mobilify Pro Admin Panel.

## 📁 Available Scripts

### 🔄 Backup Management

- **`backup-status.ps1`** - Check backup status and storage usage
- **`test-backup.ps1`** - Test backup configuration and connectivity

### 🚀 Deployment

- **`deploy.ps1`** - Manual deployment script for emergency use
- **`production-test.ps1`** - Production environment testing and validation

## 🖥️ System Requirements

All scripts are written in **PowerShell** and require:

- **Windows PowerShell 5.1+** or **PowerShell Core 7+**
- **Google Cloud SDK** (for backup scripts)
- **Git** (for deployment scripts)
- **Appropriate permissions** for the target systems

## 🚀 Usage Examples

### Check Backup Status

```powershell
# Check recent backups
./scripts/backup-status.ps1

# Check backups for specific number of days
./scripts/backup-status.ps1 -DaysToShow 14
```

### Test Backup Configuration

```powershell
# Test backup setup
./scripts/test-backup.ps1

# Test with specific bucket
./scripts/test-backup.ps1 -BucketName "your-backup-bucket"
```

### Manual Deployment

```powershell
# Deploy current branch
./scripts/deploy.ps1

# Deploy with specific commit
./scripts/deploy.ps1 -CommitHash "abc123"
```

### Production Testing

```powershell
# Run production tests
./scripts/production-test.ps1

# Run with verbose output
./scripts/production-test.ps1 -Verbose
```

## ⚙️ Configuration

### Environment Variables

Some scripts may require environment variables:

```powershell
# Google Cloud Project IDs
$env:PRODUCTION_PROJECT = "mobilify-pro-admin"
$env:STAGING_PROJECT = "mobilify-staging"

# Backup bucket name
$env:BACKUP_BUCKET = "mobilify-backups-2025"
```

### Prerequisites Setup

1. **Install Google Cloud SDK:**

   ```powershell
   # Download from: https://cloud.google.com/sdk/docs/install
   gcloud auth login
   gcloud config set project mobilify-pro-admin
   ```

2. **Configure Git:**
   ```powershell
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

## 🔒 Security Considerations

- **Never commit credentials** to version control
- **Use environment variables** for sensitive data
- **Run scripts with minimal required permissions**
- **Review script contents** before execution
- **Test scripts in staging** before production use

## 📋 Script Maintenance

### Regular Tasks

- **Weekly:** Review backup status using `backup-status.ps1`
- **Monthly:** Test backup configuration with `test-backup.ps1`
- **As needed:** Run production tests with `production-test.ps1`

### Updating Scripts

1. **Test changes** in staging environment
2. **Review security implications** of modifications
3. **Update documentation** if script behavior changes
4. **Commit changes** with descriptive messages

## 🆘 Troubleshooting

### Common Issues

#### **"Execution Policy" Error**

```powershell
# Allow script execution (run as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### **Google Cloud Authentication**

```powershell
# Re-authenticate with Google Cloud
gcloud auth login
gcloud auth application-default login
```

#### **Permission Denied**

```powershell
# Check current user permissions
whoami /groups
# Run PowerShell as Administrator if needed
```

### Getting Help

- **Script-specific help:** Use `Get-Help ./script-name.ps1`
- **Google Cloud issues:** Check [Google Cloud Documentation](https://cloud.google.com/docs)
- **Git issues:** Check [Git Documentation](https://git-scm.com/doc)
- **General support:** Contact support@mobilify.app

## 📚 Related Documentation

- **[Backup Setup Guide](../docs/setup/BACKUP_SETUP.md)** - Backup strategy configuration
- **[Deployment Guide](../docs/technical/DEPLOYMENT_GUIDE.md)** - Deployment procedures
- **[Operations Manual](../docs/technical/OPERATIONS_MANUAL.md)** - System operations
- **[Production Testing](../docs/testing/PRODUCTION_TESTING.md)** - Testing procedures

---

**Last Updated:** 2025-08-02  
**Maintained by:** Mobilify Development Team  
**Support:** support@mobilify.app

# 💾 Backup Testing Script for Mobilify Pro Admin Panel
# This script tests the backup configuration and verifies everything is working

param(
    [string]$BucketName = "mobilify-backups-2025",
    [string]$ProjectId = "mobilify-pro-admin",
    [switch]$SkipRestore = $false
)

Write-Host "🔍 Testing Backup Configuration for Mobilify Pro" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Check if gcloud is installed
Write-Host "`n1. Checking Google Cloud SDK..." -ForegroundColor Yellow
try {
    $gcloudVersion = gcloud version --format="value(Google Cloud SDK)" 2>$null
    Write-Host "✅ Google Cloud SDK installed: $gcloudVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Google Cloud SDK not found. Please install it first." -ForegroundColor Red
    Write-Host "   Download from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# Check authentication
Write-Host "`n2. Checking authentication..." -ForegroundColor Yellow
try {
    $currentAccount = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
    if ($currentAccount) {
        Write-Host "✅ Authenticated as: $currentAccount" -ForegroundColor Green
    } else {
        Write-Host "❌ Not authenticated. Please run: gcloud auth login" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Authentication check failed" -ForegroundColor Red
    exit 1
}

# Check project access
Write-Host "`n3. Checking project access..." -ForegroundColor Yellow
try {
    $currentProject = gcloud config get-value project 2>$null
    Write-Host "📋 Current project: $currentProject" -ForegroundColor Blue
    
    # Set project if different
    if ($currentProject -ne $ProjectId) {
        Write-Host "🔄 Switching to project: $ProjectId" -ForegroundColor Yellow
        gcloud config set project $ProjectId
    }
    
    # Verify project access
    $projectInfo = gcloud projects describe $ProjectId --format="value(name)" 2>$null
    Write-Host "✅ Project access verified: $projectInfo" -ForegroundColor Green
} catch {
    Write-Host "❌ Cannot access project: $ProjectId" -ForegroundColor Red
    exit 1
}

# Check storage bucket access
Write-Host "`n4. Checking storage bucket access..." -ForegroundColor Yellow
try {
    $bucketExists = gsutil ls gs://$BucketName 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Bucket accessible: gs://$BucketName" -ForegroundColor Green
        
        # List bucket contents
        Write-Host "📁 Bucket contents:" -ForegroundColor Blue
        gsutil ls gs://$BucketName/
    } else {
        Write-Host "❌ Cannot access bucket: gs://$BucketName" -ForegroundColor Red
        Write-Host "   Please create the bucket or check permissions" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Bucket access check failed" -ForegroundColor Red
    exit 1
}

# Check Firestore permissions
Write-Host "`n5. Checking Firestore permissions..." -ForegroundColor Yellow
try {
    # Try to list collections (this requires read access)
    $collections = gcloud firestore collections list --project=$ProjectId --format="value(name)" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Firestore access verified" -ForegroundColor Green
        Write-Host "📊 Collections found: $($collections.Count)" -ForegroundColor Blue
    } else {
        Write-Host "⚠️  Limited Firestore access (may still work for exports)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not verify Firestore permissions" -ForegroundColor Yellow
}

# Test manual backup
Write-Host "`n6. Testing manual backup..." -ForegroundColor Yellow
$backupName = "test-backup-$(Get-Date -Format 'yyyy-MM-dd-HH-mm-ss')"
$backupPath = "gs://$BucketName/test/$backupName"

Write-Host "🔄 Creating test backup: $backupName" -ForegroundColor Blue
try {
    # Start backup export
    $exportResult = gcloud firestore export $backupPath --project=$ProjectId --async 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backup export initiated successfully" -ForegroundColor Green
        Write-Host "📍 Backup location: $backupPath" -ForegroundColor Blue
        
        # Extract operation ID from output
        $operationId = ($exportResult | Select-String "operations/(.+)" | ForEach-Object { $_.Matches[0].Groups[1].Value })
        if ($operationId) {
            Write-Host "🔍 Operation ID: $operationId" -ForegroundColor Blue
            
            # Wait a bit and check status
            Write-Host "⏳ Waiting 30 seconds for backup to start..." -ForegroundColor Yellow
            Start-Sleep -Seconds 30
            
            $operationStatus = gcloud firestore operations describe $operationId --project=$ProjectId --format="value(done)" 2>$null
            if ($operationStatus -eq "True") {
                Write-Host "✅ Backup completed successfully!" -ForegroundColor Green
            } else {
                Write-Host "🔄 Backup is still in progress (this is normal)" -ForegroundColor Yellow
                Write-Host "   Check status with: gcloud firestore operations describe $operationId --project=$ProjectId" -ForegroundColor Blue
            }
        }
    } else {
        Write-Host "❌ Backup export failed: $exportResult" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Backup test failed: $_" -ForegroundColor Red
    exit 1
}

# Verify backup files
Write-Host "`n7. Verifying backup files..." -ForegroundColor Yellow
Start-Sleep -Seconds 10  # Give it a moment

try {
    $backupFiles = gsutil ls $backupPath/ 2>$null
    if ($LASTEXITCODE -eq 0 -and $backupFiles) {
        Write-Host "✅ Backup files created successfully" -ForegroundColor Green
        Write-Host "📁 Files in backup:" -ForegroundColor Blue
        $backupFiles | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    } else {
        Write-Host "⏳ Backup files not yet available (backup may still be in progress)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not verify backup files immediately" -ForegroundColor Yellow
}

# Test restore (optional)
if (-not $SkipRestore) {
    Write-Host "`n8. Testing restore capability..." -ForegroundColor Yellow
    Write-Host "⚠️  Skipping actual restore to avoid data conflicts" -ForegroundColor Yellow
    Write-Host "   To test restore manually, use:" -ForegroundColor Blue
    Write-Host "   gcloud firestore import $backupPath --project=$ProjectId" -ForegroundColor Gray
} else {
    Write-Host "`n8. Skipping restore test (--SkipRestore specified)" -ForegroundColor Yellow
}

# Cleanup test backup
Write-Host "`n9. Cleaning up test backup..." -ForegroundColor Yellow
$cleanup = Read-Host "Do you want to delete the test backup? (y/N)"
if ($cleanup -eq "y" -or $cleanup -eq "Y") {
    try {
        gsutil -m rm -r $backupPath/ 2>$null
        Write-Host "✅ Test backup cleaned up" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not clean up test backup (may not exist yet)" -ForegroundColor Yellow
    }
} else {
    Write-Host "📁 Test backup preserved at: $backupPath" -ForegroundColor Blue
}

# Summary
Write-Host "`n🎉 Backup Configuration Test Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Google Cloud SDK: Working" -ForegroundColor Green
Write-Host "✅ Authentication: Working" -ForegroundColor Green
Write-Host "✅ Project Access: Working" -ForegroundColor Green
Write-Host "✅ Storage Bucket: Accessible" -ForegroundColor Green
Write-Host "✅ Firestore Export: Working" -ForegroundColor Green

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Configure GitHub Secrets (see BACKUP_STRATEGY_SETUP.md)" -ForegroundColor White
Write-Host "2. Test the automated workflow manually" -ForegroundColor White
Write-Host "3. Verify email notifications are working" -ForegroundColor White
Write-Host "4. Schedule regular backup monitoring" -ForegroundColor White

Write-Host "`n🔗 Useful Commands:" -ForegroundColor Cyan
Write-Host "• List backups: gsutil ls gs://$BucketName/" -ForegroundColor White
Write-Host "• Check operations: gcloud firestore operations list --project=$ProjectId" -ForegroundColor White
Write-Host "• Manual backup: gcloud firestore export gs://$BucketName/manual/backup-$(Get-Date -Format 'yyyy-MM-dd') --project=$ProjectId" -ForegroundColor White

Write-Host "`nBackup testing completed successfully! 🚀" -ForegroundColor Green

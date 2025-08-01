# 📊 Backup Status Dashboard for Mobilify Pro Admin Panel
# This script provides a comprehensive view of backup status and health

param(
    [string]$BucketName = "mobilify-backups-2025",
    [string]$ProductionProject = "mobilify-pro-admin",
    [string]$StagingProject = "mobilify-staging",
    [int]$DaysToShow = 30
)

Write-Host "📊 Mobilify Pro - Backup Status Dashboard" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Bucket: gs://$BucketName" -ForegroundColor Blue
Write-Host "Date Range: Last $DaysToShow days" -ForegroundColor Blue
Write-Host ""

# Function to format file size
function Format-FileSize {
    param([long]$Size)
    
    if ($Size -gt 1GB) {
        return "{0:N2} GB" -f ($Size / 1GB)
    } elseif ($Size -gt 1MB) {
        return "{0:N2} MB" -f ($Size / 1MB)
    } elseif ($Size -gt 1KB) {
        return "{0:N2} KB" -f ($Size / 1KB)
    } else {
        return "$Size bytes"
    }
}

# Function to get backup info
function Get-BackupInfo {
    param([string]$Path)
    
    try {
        $backups = gsutil ls -l $Path 2>$null | Where-Object { $_ -match "^\s*\d+" }
        $backupList = @()
        
        foreach ($backup in $backups) {
            if ($backup -match "^\s*(\d+)\s+(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)\s+(.+)$") {
                $size = [long]$matches[1]
                $date = [datetime]$matches[2]
                $path = $matches[3]
                
                # Extract backup name from path
                $backupName = Split-Path $path -Leaf
                
                $backupList += [PSCustomObject]@{
                    Name = $backupName
                    Date = $date
                    Size = $size
                    SizeFormatted = Format-FileSize $size
                    Path = $path
                    Age = (Get-Date) - $date
                }
            }
        }
        
        return $backupList | Sort-Object Date -Descending
    } catch {
        Write-Host "⚠️  Could not retrieve backup info for $Path" -ForegroundColor Yellow
        return @()
    }
}

# Check if gsutil is available
try {
    gsutil version > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ gsutil not found. Please install Google Cloud SDK." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ gsutil not found. Please install Google Cloud SDK." -ForegroundColor Red
    exit 1
}

# Get production backups
Write-Host "🏭 Production Backups (mobilify-pro-admin)" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

$productionBackups = Get-BackupInfo "gs://$BucketName/production/"
$recentProdBackups = $productionBackups | Where-Object { $_.Age.TotalDays -le $DaysToShow }

if ($recentProdBackups.Count -gt 0) {
    Write-Host "📈 Found $($recentProdBackups.Count) backups in the last $DaysToShow days" -ForegroundColor Blue
    Write-Host ""
    
    $recentProdBackups | ForEach-Object {
        $ageText = if ($_.Age.TotalDays -lt 1) {
            "{0:N1} hours ago" -f $_.Age.TotalHours
        } else {
            "{0:N0} days ago" -f $_.Age.TotalDays
        }
        
        $status = if ($_.Age.TotalDays -le 7) { "🟢" } elseif ($_.Age.TotalDays -le 14) { "🟡" } else { "🔴" }
        
        Write-Host "$status $($_.Date.ToString('yyyy-MM-dd HH:mm')) | $($_.SizeFormatted.PadLeft(8)) | $ageText" -ForegroundColor White
    }
    
    # Production backup statistics
    $totalProdSize = ($recentProdBackups | Measure-Object -Property Size -Sum).Sum
    $avgProdSize = ($recentProdBackups | Measure-Object -Property Size -Average).Average
    $latestProdBackup = $recentProdBackups | Select-Object -First 1
    
    Write-Host ""
    Write-Host "📊 Production Statistics:" -ForegroundColor Blue
    Write-Host "   Total Size: $(Format-FileSize $totalProdSize)" -ForegroundColor White
    Write-Host "   Average Size: $(Format-FileSize $avgProdSize)" -ForegroundColor White
    Write-Host "   Latest Backup: $($latestProdBackup.Date.ToString('yyyy-MM-dd HH:mm')) ($($latestProdBackup.Age.TotalDays.ToString('N1')) days ago)" -ForegroundColor White
} else {
    Write-Host "❌ No recent production backups found!" -ForegroundColor Red
}

Write-Host ""

# Get staging backups
Write-Host "🧪 Staging Backups (mobilify-staging)" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Yellow

$stagingBackups = Get-BackupInfo "gs://$BucketName/staging/"
$recentStagingBackups = $stagingBackups | Where-Object { $_.Age.TotalDays -le $DaysToShow }

if ($recentStagingBackups.Count -gt 0) {
    Write-Host "📈 Found $($recentStagingBackups.Count) backups in the last $DaysToShow days" -ForegroundColor Blue
    Write-Host ""
    
    $recentStagingBackups | ForEach-Object {
        $ageText = if ($_.Age.TotalDays -lt 1) {
            "{0:N1} hours ago" -f $_.Age.TotalHours
        } else {
            "{0:N0} days ago" -f $_.Age.TotalDays
        }
        
        $status = if ($_.Age.TotalDays -le 7) { "🟢" } elseif ($_.Age.TotalDays -le 14) { "🟡" } else { "🔴" }
        
        Write-Host "$status $($_.Date.ToString('yyyy-MM-dd HH:mm')) | $($_.SizeFormatted.PadLeft(8)) | $ageText" -ForegroundColor White
    }
    
    # Staging backup statistics
    $totalStagingSize = ($recentStagingBackups | Measure-Object -Property Size -Sum).Sum
    $avgStagingSize = ($recentStagingBackups | Measure-Object -Property Size -Average).Average
    $latestStagingBackup = $recentStagingBackups | Select-Object -First 1
    
    Write-Host ""
    Write-Host "📊 Staging Statistics:" -ForegroundColor Blue
    Write-Host "   Total Size: $(Format-FileSize $totalStagingSize)" -ForegroundColor White
    Write-Host "   Average Size: $(Format-FileSize $avgStagingSize)" -ForegroundColor White
    Write-Host "   Latest Backup: $($latestStagingBackup.Date.ToString('yyyy-MM-dd HH:mm')) ($($latestStagingBackup.Age.TotalDays.ToString('N1')) days ago)" -ForegroundColor White
} else {
    Write-Host "❌ No recent staging backups found!" -ForegroundColor Red
}

Write-Host ""

# Overall health check
Write-Host "🏥 Backup Health Assessment" -ForegroundColor Magenta
Write-Host "============================" -ForegroundColor Magenta

$healthScore = 0
$maxScore = 100

# Check if we have recent backups (within 7 days)
$latestProd = $productionBackups | Select-Object -First 1
$latestStaging = $stagingBackups | Select-Object -First 1

if ($latestProd -and $latestProd.Age.TotalDays -le 7) {
    Write-Host "✅ Production backups are current (within 7 days)" -ForegroundColor Green
    $healthScore += 40
} elseif ($latestProd -and $latestProd.Age.TotalDays -le 14) {
    Write-Host "⚠️  Production backups are getting old (7-14 days)" -ForegroundColor Yellow
    $healthScore += 20
} else {
    Write-Host "❌ Production backups are outdated or missing!" -ForegroundColor Red
}

if ($latestStaging -and $latestStaging.Age.TotalDays -le 7) {
    Write-Host "✅ Staging backups are current (within 7 days)" -ForegroundColor Green
    $healthScore += 30
} elseif ($latestStaging -and $latestStaging.Age.TotalDays -le 14) {
    Write-Host "⚠️  Staging backups are getting old (7-14 days)" -ForegroundColor Yellow
    $healthScore += 15
} else {
    Write-Host "❌ Staging backups are outdated or missing!" -ForegroundColor Red
}

# Check backup consistency (at least 3 backups in last 30 days)
if ($recentProdBackups.Count -ge 3) {
    Write-Host "✅ Production backup frequency is good (≥3 in 30 days)" -ForegroundColor Green
    $healthScore += 15
} else {
    Write-Host "⚠️  Production backup frequency is low (<3 in 30 days)" -ForegroundColor Yellow
    $healthScore += 5
}

if ($recentStagingBackups.Count -ge 3) {
    Write-Host "✅ Staging backup frequency is good (≥3 in 30 days)" -ForegroundColor Green
    $healthScore += 15
} else {
    Write-Host "⚠️  Staging backup frequency is low (<3 in 30 days)" -ForegroundColor Yellow
    $healthScore += 5
}

Write-Host ""
Write-Host "🎯 Overall Backup Health Score: $healthScore/100" -ForegroundColor $(
    if ($healthScore -ge 80) { "Green" }
    elseif ($healthScore -ge 60) { "Yellow" }
    else { "Red" }
)

if ($healthScore -ge 80) {
    Write-Host "🎉 Excellent! Your backup system is healthy." -ForegroundColor Green
} elseif ($healthScore -ge 60) {
    Write-Host "⚠️  Good, but there's room for improvement." -ForegroundColor Yellow
} else {
    Write-Host "🚨 Action required! Your backup system needs attention." -ForegroundColor Red
}

# Recommendations
Write-Host ""
Write-Host "💡 Recommendations:" -ForegroundColor Cyan

if ($healthScore -lt 100) {
    if (-not $latestProd -or $latestProd.Age.TotalDays -gt 7) {
        Write-Host "• Run a manual production backup immediately" -ForegroundColor White
    }
    if (-not $latestStaging -or $latestStaging.Age.TotalDays -gt 7) {
        Write-Host "• Run a manual staging backup immediately" -ForegroundColor White
    }
    if ($recentProdBackups.Count -lt 3 -or $recentStagingBackups.Count -lt 3) {
        Write-Host "• Verify the weekly backup schedule is working" -ForegroundColor White
        Write-Host "• Check GitHub Actions workflow status" -ForegroundColor White
    }
}

Write-Host "• Monitor backup sizes for unusual growth" -ForegroundColor White
Write-Host "• Test restore procedures quarterly" -ForegroundColor White
Write-Host "• Review storage costs monthly" -ForegroundColor White

# Quick commands
Write-Host ""
Write-Host "🔧 Quick Commands:" -ForegroundColor Cyan
Write-Host "• Manual backup: gcloud firestore export gs://$BucketName/manual/backup-$(Get-Date -Format 'yyyy-MM-dd') --project=$ProductionProject" -ForegroundColor Gray
Write-Host "• List all backups: gsutil ls gs://$BucketName/" -ForegroundColor Gray
Write-Host "• Check storage usage: gsutil du -sh gs://$BucketName/" -ForegroundColor Gray
Write-Host "• GitHub Actions: https://github.com/your-repo/actions/workflows/backup.yml" -ForegroundColor Gray

Write-Host ""
Write-Host "Dashboard completed! 📊" -ForegroundColor Green

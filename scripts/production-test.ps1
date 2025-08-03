# 🧪 Production Testing Script for Cairo Bites Demo Restaurant
# Task 7: Production Testing - Automated validation script

param(
    [string]$ProductionUrl = "https://mobilify-admin-hlp8pmtlc-tarekrefaeis-projects.vercel.app",
    [string]$DemoEmail = "demo@cairobites.com",
    [string]$DemoPassword = "CairoBites2025!",
    [switch]$SkipHealthCheck = $false,
    [switch]$Verbose = $false
)

# Colors for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"
$Blue = "Blue"

function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Success,
        [string]$Details = ""
    )
    
    $status = if ($Success) { "✅ PASS" } else { "❌ FAIL" }
    $color = if ($Success) { $Green } else { $Red }
    
    Write-Host "$status $TestName" -ForegroundColor $color
    if ($Details -and ($Verbose -or -not $Success)) {
        Write-Host "   $Details" -ForegroundColor Gray
    }
}

function Test-UrlResponse {
    param(
        [string]$Url,
        [int]$ExpectedStatus = 200,
        [string]$ExpectedContent = $null
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 30 -UseBasicParsing
        
        $statusMatch = $response.StatusCode -eq $ExpectedStatus
        $contentMatch = if ($ExpectedContent) { 
            $response.Content -like "*$ExpectedContent*" 
        } else { 
            $true 
        }
        
        return @{
            Success = $statusMatch -and $contentMatch
            StatusCode = $response.StatusCode
            ContentLength = $response.Content.Length
            ResponseTime = $response.Headers.'X-Response-Time'
        }
    }
    catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = 0
        }
    }
}

function Test-HealthEndpoint {
    param([string]$BaseUrl)
    
    Write-Host "`n🔍 Testing Health Endpoints..." -ForegroundColor $Cyan
    
    # Test main health endpoint
    $healthResult = Test-UrlResponse -Url "$BaseUrl/health"
    Write-TestResult -TestName "Health endpoint accessibility" -Success $healthResult.Success -Details "Status: $($healthResult.StatusCode)"
    
    # Test static health JSON
    $staticHealthResult = Test-UrlResponse -Url "$BaseUrl/api/health.json" -ExpectedContent "healthy"
    Write-TestResult -TestName "Static health JSON endpoint" -Success $staticHealthResult.Success -Details "Status: $($staticHealthResult.StatusCode)"
    
    return $healthResult.Success -and $staticHealthResult.Success
}

function Test-ApplicationPages {
    param([string]$BaseUrl)
    
    Write-Host "`n📱 Testing Application Pages..." -ForegroundColor $Cyan
    
    # Test main application (should redirect to login)
    $appResult = Test-UrlResponse -Url $BaseUrl
    Write-TestResult -TestName "Main application loads" -Success $appResult.Success -Details "Status: $($appResult.StatusCode)"
    
    # Test login page specifically
    $loginResult = Test-UrlResponse -Url "$BaseUrl/login"
    Write-TestResult -TestName "Login page accessibility" -Success $loginResult.Success -Details "Status: $($loginResult.StatusCode)"
    
    return $appResult.Success -and $loginResult.Success
}

function Test-StaticAssets {
    param([string]$BaseUrl)
    
    Write-Host "`n🎨 Testing Static Assets..." -ForegroundColor $Cyan
    
    # Test favicon
    $faviconResult = Test-UrlResponse -Url "$BaseUrl/favicon.ico"
    Write-TestResult -TestName "Favicon loads" -Success $faviconResult.Success -Details "Status: $($faviconResult.StatusCode)"
    
    # Test manifest
    $manifestResult = Test-UrlResponse -Url "$BaseUrl/manifest.json"
    Write-TestResult -TestName "PWA manifest loads" -Success $manifestResult.Success -Details "Status: $($manifestResult.StatusCode)"
    
    return $faviconResult.Success -and $manifestResult.Success
}

function Test-SecurityHeaders {
    param([string]$BaseUrl)
    
    Write-Host "`n🔒 Testing Security Headers..." -ForegroundColor $Cyan
    
    try {
        $response = Invoke-WebRequest -Uri $BaseUrl -Method Head -UseBasicParsing
        
        $hasCSP = $response.Headers.ContainsKey('Content-Security-Policy')
        $hasXFrame = $response.Headers.ContainsKey('X-Frame-Options')
        $hasXContent = $response.Headers.ContainsKey('X-Content-Type-Options')
        
        Write-TestResult -TestName "Content Security Policy header" -Success $hasCSP
        Write-TestResult -TestName "X-Frame-Options header" -Success $hasXFrame
        Write-TestResult -TestName "X-Content-Type-Options header" -Success $hasXContent
        
        return $hasCSP -or $hasXFrame -or $hasXContent # At least one security header
    }
    catch {
        Write-TestResult -TestName "Security headers check" -Success $false -Details $_.Exception.Message
        return $false
    }
}

function Test-PerformanceMetrics {
    param([string]$BaseUrl)
    
    Write-Host "`n⚡ Testing Performance Metrics..." -ForegroundColor $Cyan
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $result = Test-UrlResponse -Url $BaseUrl
    $stopwatch.Stop()
    
    $loadTime = $stopwatch.ElapsedMilliseconds
    $isGoodPerformance = $loadTime -lt 3000 # Less than 3 seconds
    
    Write-TestResult -TestName "Page load time < 3 seconds" -Success $isGoodPerformance -Details "$loadTime ms"
    
    if ($result.Success -and $result.ContentLength) {
        $sizeKB = [math]::Round($result.ContentLength / 1024, 2)
        $isGoodSize = $sizeKB -lt 1000 # Less than 1MB
        Write-TestResult -TestName "Page size < 1MB" -Success $isGoodSize -Details "$sizeKB KB"
        
        return $isGoodPerformance -and $isGoodSize
    }
    
    return $isGoodPerformance
}

function Test-MonitoringEndpoints {
    param([string]$BaseUrl)
    
    Write-Host "`n📊 Testing Monitoring Integration..." -ForegroundColor $Cyan
    
    # Test if Sentry is configured (check for Sentry script in page)
    try {
        $response = Invoke-WebRequest -Uri $BaseUrl -UseBasicParsing
        $hasSentry = $response.Content -like "*sentry*"
        Write-TestResult -TestName "Sentry integration detected" -Success $hasSentry
        
        # Test if Google Analytics is configured
        $hasGA = $response.Content -like "*gtag*" -or $response.Content -like "*analytics*"
        Write-TestResult -TestName "Google Analytics integration detected" -Success $hasGA
        
        return $hasSentry -or $hasGA
    }
    catch {
        Write-TestResult -TestName "Monitoring integration check" -Success $false -Details $_.Exception.Message
        return $false
    }
}

# Main testing execution
Write-Host "🧪 Starting Production Testing for Cairo Bites Demo Restaurant" -ForegroundColor $Blue
Write-Host "🌐 Testing URL: $ProductionUrl" -ForegroundColor $Blue
Write-Host "📧 Demo Account: $DemoEmail" -ForegroundColor $Blue
Write-Host "⏰ Started at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor $Blue

$testResults = @{}

# Phase 1: Basic Connectivity Tests
if (-not $SkipHealthCheck) {
    $testResults.Health = Test-HealthEndpoint -BaseUrl $ProductionUrl
}

$testResults.Pages = Test-ApplicationPages -BaseUrl $ProductionUrl
$testResults.Assets = Test-StaticAssets -BaseUrl $ProductionUrl
$testResults.Security = Test-SecurityHeaders -BaseUrl $ProductionUrl
$testResults.Performance = Test-PerformanceMetrics -BaseUrl $ProductionUrl
$testResults.Monitoring = Test-MonitoringEndpoints -BaseUrl $ProductionUrl

# Summary
Write-Host "`n📋 Test Summary" -ForegroundColor $Blue
Write-Host "=" * 50 -ForegroundColor $Blue

$totalTests = $testResults.Count
$passedTests = ($testResults.Values | Where-Object { $_ -eq $true }).Count
$successRate = [math]::Round(($passedTests / $totalTests) * 100, 1)

foreach ($test in $testResults.GetEnumerator()) {
    $status = if ($test.Value) { "✅" } else { "❌" }
    Write-Host "$status $($test.Key) Tests" -ForegroundColor $(if ($test.Value) { $Green } else { $Red })
}

Write-Host "`n📊 Overall Results:" -ForegroundColor $Blue
Write-Host "   Passed: $passedTests/$totalTests tests ($successRate%)" -ForegroundColor $(if ($successRate -ge 80) { $Green } else { $Red })

if ($successRate -ge 80) {
    Write-Host "`n🎉 Production testing PASSED! Ready for user testing." -ForegroundColor $Green
    Write-Host "📝 Next Steps:" -ForegroundColor $Cyan
    Write-Host "   1. Create demo account: $DemoEmail" -ForegroundColor $Gray
    Write-Host "   2. Seed Cairo Bites demo data" -ForegroundColor $Gray
    Write-Host "   3. Perform manual user acceptance testing" -ForegroundColor $Gray
    Write-Host "   4. Validate all features work correctly" -ForegroundColor $Gray
} else {
    Write-Host "`n⚠️  Production testing FAILED! Issues need to be resolved." -ForegroundColor $Red
    Write-Host "🔧 Recommended Actions:" -ForegroundColor $Yellow
    Write-Host "   1. Check failed tests above" -ForegroundColor $Gray
    Write-Host "   2. Review application logs" -ForegroundColor $Gray
    Write-Host "   3. Verify deployment configuration" -ForegroundColor $Gray
    Write-Host "   4. Re-run tests after fixes" -ForegroundColor $Gray
}

Write-Host "`n⏰ Completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor $Blue

# Return exit code based on success rate
exit $(if ($successRate -ge 80) { 0 } else { 1 })

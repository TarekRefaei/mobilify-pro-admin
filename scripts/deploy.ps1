# Mobilify Pro Admin Panel - Vercel Deployment Script
# Run this script to deploy to Vercel

Write-Host "🚀 Mobilify Pro Admin Panel - Vercel Deployment" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}

# Check if user is logged in
Write-Host "`n🔐 Checking Vercel authentication..." -ForegroundColor Yellow
try {
    $whoami = vercel whoami
    Write-Host "✅ Logged in as: $whoami" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to Vercel. Please login:" -ForegroundColor Red
    Write-Host "Run: vercel login" -ForegroundColor Yellow
    Write-Host "Use account: refa3igroup@gmail.com" -ForegroundColor Yellow
    exit 1
}

# Build the application
Write-Host "`n🔨 Building application..." -ForegroundColor Yellow
npm run build:prod

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Note about vercel.json
Write-Host "`n📝 Note: Using Vercel auto-detection for Vite projects" -ForegroundColor Cyan

# Deploy to Vercel
Write-Host "`n🚀 Deploying to Vercel..." -ForegroundColor Yellow

# Ask user which environment to deploy to
$environment = Read-Host "Deploy to (1) Preview or (2) Production? Enter 1 or 2"

if ($environment -eq "2") {
    Write-Host "🌟 Deploying to PRODUCTION..." -ForegroundColor Magenta
    vercel --prod
} else {
    Write-Host "🧪 Deploying to PREVIEW..." -ForegroundColor Cyan
    vercel
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🌐 Your application is now live!" -ForegroundColor Green
    
    if ($environment -eq "2") {
        Write-Host "Production URL: https://mobilify-admin.vercel.app" -ForegroundColor Magenta
    } else {
        Write-Host "Preview URL will be shown above" -ForegroundColor Cyan
    }
    
    Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Test the deployed application" -ForegroundColor White
    Write-Host "2. Configure environment variables if needed" -ForegroundColor White
    Write-Host "3. Set up monitoring and alerts" -ForegroundColor White
    Write-Host "4. Create demo restaurant data" -ForegroundColor White
} else {
    Write-Host "`n❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above and try again." -ForegroundColor Yellow
}

Write-Host "`n🎉 Deployment script completed!" -ForegroundColor Green

# **Vercel Deployment Guide: Mobilify Pro Admin Panel**

**Document Version:** 1.0  
**Date:** January 27, 2025  
**Account:** refa3igroup@gmail.com  
**Target URL:** mobilify-admin.vercel.app

---

## **🚀 Automated Setup Instructions**

### **Step 1: Login to Vercel**

```bash
# Login with your account
vercel login
# Enter: refa3igroup@gmail.com
# Follow the email verification process
```

### **Step 2: Initialize Vercel Project**

```bash
# From the mobilify-admin directory
vercel

# Answer the prompts:
# ? Set up and deploy "mobilify-admin"? [Y/n] Y
# ? Which scope do you want to deploy to? [Your Account]
# ? Link to existing project? [y/N] N
# ? What's your project's name? mobilify-admin
# ? In which directory is your code located? ./
```

### **Step 3: Configure Environment Variables**

**Production Environment Variables:**
```bash
# Add production Firebase config
vercel env add VITE_FIREBASE_API_KEY production
# Enter your production Firebase API key

vercel env add VITE_FIREBASE_AUTH_DOMAIN production
# Enter: mobilify-pro-admin.firebaseapp.com

vercel env add VITE_FIREBASE_PROJECT_ID production
# Enter: mobilify-pro-admin

vercel env add VITE_FIREBASE_STORAGE_BUCKET production
# Enter: mobilify-pro-admin.appspot.com

vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
# Enter: 694671130478

vercel env add VITE_FIREBASE_APP_ID production
# Enter your production Firebase App ID

vercel env add VITE_ENVIRONMENT production
# Enter: production

vercel env add VITE_SENTRY_DSN production
# Enter your Sentry DSN (optional for now)

vercel env add VITE_GA_MEASUREMENT_ID production
# Enter your Google Analytics ID (optional for now)
```

**Preview/Staging Environment Variables:**
```bash
# Add staging Firebase config
vercel env add VITE_FIREBASE_API_KEY preview
# Enter your staging Firebase API key

vercel env add VITE_FIREBASE_AUTH_DOMAIN preview
# Enter: mobilify-staging.firebaseapp.com

vercel env add VITE_FIREBASE_PROJECT_ID preview
# Enter: mobilify-staging

vercel env add VITE_FIREBASE_STORAGE_BUCKET preview
# Enter: mobilify-staging.appspot.com

vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID preview
# Enter: 185041473388

vercel env add VITE_FIREBASE_APP_ID preview
# Enter your staging Firebase App ID

vercel env add VITE_ENVIRONMENT preview
# Enter: staging
```

### **Step 4: Deploy to Production**

```bash
# Deploy to production
vercel --prod

# This will:
# 1. Build the application
# 2. Deploy to mobilify-admin.vercel.app
# 3. Set up automatic deployments from GitHub
```

### **Step 5: Configure Custom Domain (Optional)**

```bash
# If you have a custom domain
vercel domains add yourdomain.com
vercel alias mobilify-admin.vercel.app yourdomain.com
```

---

## **🔧 Manual Vercel Dashboard Configuration**

### **Alternative Setup via Dashboard**

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Login with `refa3igroup@gmail.com`

2. **Import GitHub Repository:**
   - Click "New Project"
   - Import from GitHub
   - Select your `mobilify-admin` repository
   - Configure build settings:
     - **Framework Preset:** Vite
     - **Root Directory:** `mobilify-admin`
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`

3. **Configure Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add all the variables listed in Step 3 above

4. **Configure Domains:**
   - Go to Project Settings → Domains
   - Add `mobilify-admin.vercel.app` as primary domain

---

## **📋 Build Configuration**

### **Package.json Scripts**

Ensure these scripts exist in your `package.json`:

```json
{
  "scripts": {
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  }
}
```

### **Vite Configuration**

Update `vite.config.ts` for production builds:

```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore']
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }
})
```

---

## **🔐 Security Configuration**

### **Environment Variables Security**

- **Never commit** `.env` files to Git
- Use Vercel's environment variable system
- Separate staging and production configs
- Rotate API keys regularly

### **Content Security Policy**

The `vercel.json` file includes comprehensive CSP headers:

```json
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; ..."
}
```

---

## **📊 Monitoring & Analytics**

### **Vercel Analytics**

1. **Enable Vercel Analytics:**
   - Go to Project Settings → Analytics
   - Enable Web Analytics
   - Add analytics script to your app

2. **Performance Monitoring:**
   - Monitor Core Web Vitals
   - Track deployment performance
   - Set up alerts for issues

### **Custom Monitoring**

```typescript
// Add to your main.tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

---

## **🚀 Deployment Workflow**

### **Automatic Deployments**

- **Production:** Deploys on push to `main` branch
- **Preview:** Deploys on push to other branches
- **Pull Requests:** Creates preview deployments

### **Manual Deployments**

```bash
# Deploy current branch to preview
vercel

# Deploy to production
vercel --prod

# Deploy specific branch
vercel --prod --target production
```

---

## **🧪 Testing Deployments**

### **Pre-deployment Checklist**

- [ ] All environment variables configured
- [ ] Build completes successfully
- [ ] Firebase connection works
- [ ] Authentication flow functional
- [ ] All routes accessible
- [ ] Performance metrics acceptable

### **Post-deployment Verification**

```bash
# Test the deployed application
curl -I https://mobilify-admin.vercel.app

# Check specific endpoints
curl https://mobilify-admin.vercel.app/login
curl https://mobilify-admin.vercel.app/dashboard
```

---

## **🔧 Troubleshooting**

### **Common Issues**

1. **Build Failures:**
   ```bash
   # Check build logs
   vercel logs
   
   # Test build locally
   npm run build
   ```

2. **Environment Variable Issues:**
   ```bash
   # List all environment variables
   vercel env ls
   
   # Remove incorrect variable
   vercel env rm VARIABLE_NAME
   ```

3. **Domain Configuration:**
   ```bash
   # Check domain status
   vercel domains ls
   
   # Verify DNS settings
   nslookup mobilify-admin.vercel.app
   ```

### **Debug Commands**

```bash
# Check project status
vercel ls

# View deployment logs
vercel logs [deployment-url]

# Inspect project settings
vercel inspect
```

---

## **📈 Performance Optimization**

### **Build Optimization**

- Enable tree shaking
- Use code splitting
- Optimize bundle size
- Enable compression

### **Caching Strategy**

```json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## **📞 Support & Resources**

### **Vercel Documentation**
- [Vercel Docs](https://vercel.com/docs)
- [Vite Deployment Guide](https://vercel.com/guides/deploying-vite-with-vercel)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

### **Getting Help**
- Vercel Support: [vercel.com/support](https://vercel.com/support)
- Community: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

**Next Steps:** Follow the automated setup instructions to deploy your application to production.

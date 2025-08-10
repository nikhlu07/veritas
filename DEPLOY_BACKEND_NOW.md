# 🚀 Deploy Backend to Vercel NOW

## Step 1: Go to Vercel
1. Visit [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"New Project"**

## Step 2: Import Your Repo
1. Find your `veritas` repository
2. Click **"Import"**
3. **IMPORTANT**: Set **Root Directory** to `veritas-backend`
4. **Framework Preset**: Other
5. Click **"Deploy"** (it will fail first time - that's expected)

## Step 3: Add Environment Variables
In your Vercel project dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add these **EXACT** variables:

```bash
NODE_ENV=production
PORT=3002

# Hedera Configuration (your existing values)
HEDERA_ACCOUNT_ID=0.0.6535104-nvsjj
HEDERA_PRIVATE_KEY=e36ceff57437de411a773a7e03078947e3164c93c1e828a65810668b48dd5182
HEDERA_NETWORK=testnet
HEDERA_TOPIC_ID=0.0.6535283

# Database (replace PASSWORD with your Supabase password)
DATABASE_URL=postgresql://postgres.yuyoxwwfeodcosghgkkn:YOUR_SUPABASE_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres

# CORS (will update after frontend is deployed)
FRONTEND_URL=https://localhost:3000
```

## Step 4: Redeploy
1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Wait for build to complete (~2 minutes)

## Step 5: Test Your Backend
Your backend will be live at: `https://your-project-name.vercel.app`

Test endpoints:
- **Health check**: `https://your-backend-url.vercel.app/health`
- **Products**: `https://your-backend-url.vercel.app/api/products`

## ✅ Success Checklist
- [ ] Build completed successfully
- [ ] Health endpoint returns "healthy"
- [ ] Database connection working
- [ ] Hedera service ready

## 🔧 If Build Fails
Check the build logs for:
- Missing dependencies
- Environment variable issues
- Database connection problems

## Next Step
Once backend is working, we'll deploy the frontend and connect them together!

---

**Your backend URL will be something like:**
`veritas-backend-username.vercel.app`

Save this URL - we'll need it for the frontend deployment! 🎯
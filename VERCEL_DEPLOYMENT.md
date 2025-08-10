# 🚀 Vercel Deployment Guide

## Quick Deploy (2 minutes each)

### 1. Deploy Backend First

1. Go to [vercel.com](https://vercel.com) → "New Project"
2. Import from GitHub: `your-username/veritas`
3. **Root Directory**: `veritas-backend`
4. **Framework**: Other
5. Click **Deploy**

**Environment Variables to add:**
```bash
NODE_ENV=production
PORT=3002
HEDERA_ACCOUNT_ID=0.0.6535104-nvsjj
HEDERA_PRIVATE_KEY=e36ceff57437de411a773a7e03078947e3164c93c1e828a65810668b48dd5182
HEDERA_NETWORK=testnet
HEDERA_TOPIC_ID=0.0.6535283
DATABASE_URL=postgresql://postgres.yuyoxwwfeodcosghgkkn:[YOUR-SUPABASE-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### 2. Deploy Frontend Second

1. **New Project** → Import same repo
2. **Root Directory**: `veritas-frontend`
3. **Framework**: Next.js
4. Click **Deploy**

**Environment Variables to add:**
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_FALLBACK_MODE=true
HEDERA_ACCOUNT_ID=0.0.6535104-nvsjj
HEDERA_PRIVATE_KEY=e36ceff57437de411a773a7e03078947e3164c93c1e828a65810668b48dd5182
HEDERA_NETWORK=testnet
HEDERA_TOPIC_ID=0.0.6535283
```

### 3. Update CORS Settings

After frontend is deployed, update backend environment:
```bash
FRONTEND_URL=https://your-actual-frontend-url.vercel.app
```

## 🎯 Pro Tips

### Domain Names
- Backend: `veritas-backend-username.vercel.app`
- Frontend: `veritas-frontend-username.vercel.app`
- Or use custom domains in Vercel settings

### Performance
- ✅ Both projects use optimized builds
- ✅ Database connection pooling enabled
- ✅ CDN caching for static assets
- ✅ Automatic SSL certificates

### Environment Variables
- Add them in **Project Settings** → **Environment Variables**
- Use "Production", "Preview", and "Development" for all environments
- Copy exact values from your `.env` files

### Monitoring
- Check **Functions** tab for serverless function logs
- Monitor **Analytics** for performance metrics
- Set up **Alerts** for downtime notifications

## 🔧 Troubleshooting

**Database Connection Issues:**
```bash
# Make sure to use the pooled connection
DATABASE_URL=postgresql://postgres.yuyoxwwfeodcosghgkkn:PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

**CORS Errors:**
- Update `FRONTEND_URL` in backend with actual frontend URL
- Redeploy backend after URL update

**Build Failures:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

## ✅ Final Checklist

- [ ] Backend deployed and responding at `/health`
- [ ] Frontend deployed and loading
- [ ] Database connection working
- [ ] QR codes generating properly
- [ ] Product verification working
- [ ] Smart fallback working when backend is down

## 🌐 Test Your Deployment

1. **Backend health**: `https://your-backend.vercel.app/health`
2. **Frontend**: `https://your-frontend.vercel.app`
3. **Create product**: Use the submit form
4. **Verify product**: Scan the QR code or use verification page

Your Veritas app will be live globally with automatic scaling! 🎉
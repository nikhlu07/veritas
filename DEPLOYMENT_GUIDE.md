# 🚀 Veritas Deployment Guide

## Frontend Deployment (Vercel)

### 1. Connect GitHub to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your `veritas` repository
4. Select `veritas-frontend` as root directory

### 2. Environment Variables in Vercel
```bash
# In Vercel Dashboard → Settings → Environment Variables
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_APP_ENV=production
HEDERA_ACCOUNT_ID=0.0.6535104-nvsjj
HEDERA_PRIVATE_KEY=e36ceff57437de411a773a7e03078947e3164c93c1e828a65810668b48dd5182
HEDERA_NETWORK=testnet
HEDERA_TOPIC_ID=0.0.6535283
```

### 3. Build Settings
- **Framework Preset**: Next.js
- **Root Directory**: `veritas-frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

## Backend Deployment (Railway/Render)

### Option A: Railway (Recommended)

1. **Connect GitHub to Railway**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Select `veritas-backend` folder

2. **Environment Variables**
   ```bash
   PORT=3002
   NODE_ENV=production
   HEDERA_ACCOUNT_ID=0.0.6535104-nvsjj
   HEDERA_PRIVATE_KEY=e36ceff57437de411a773a7e03078947e3164c93c1e828a65810668b48dd5182
   HEDERA_NETWORK=testnet
   HEDERA_TOPIC_ID=0.0.6535283
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```

3. **Database (Optional)**
   - Add PostgreSQL service in Railway
   - Copy DATABASE_URL to environment variables

### Option B: Render

1. **Create Web Service**
   - Connect GitHub repository
   - Root Directory: `veritas-backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Add Environment Variables** (same as above)

## Database Options

### Option 1: No Database (Blockchain Only)
- ✅ **Works immediately**
- ✅ **All data stored on Hedera**
- ❌ **No local caching**
- ❌ **Slower queries**

### Option 2: PostgreSQL (Recommended)
- **Railway**: Add PostgreSQL service
- **Render**: Add PostgreSQL add-on
- **Supabase**: Free PostgreSQL hosting

## Domain Setup

### Custom Domain (Optional)
1. **Frontend**: Add custom domain in Vercel
2. **Backend**: Add custom domain in Railway/Render
3. **Update CORS**: Update FRONTEND_URL in backend

## SSL & Security
- ✅ **Automatic HTTPS** on Vercel/Railway
- ✅ **Environment variables** encrypted
- ✅ **CSP headers** already configured

## Monitoring & Analytics

### Add to Production
```bash
# Optional analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
NEXT_PUBLIC_MIXPANEL_TOKEN=your_token
```

## Cost Estimates

### Free Tier (Perfect for Demo)
- **Vercel**: Free (hobby plan)
- **Railway**: $5/month (after free credits)
- **Total**: ~$5/month

### Production Scale
- **Vercel Pro**: $20/month
- **Railway Pro**: $20/month  
- **Database**: $10/month
- **Total**: ~$50/month

## Deployment Commands

### Manual Deployment
```bash
# Frontend
cd veritas-frontend
npm run build

# Backend  
cd veritas-backend
npm run build
npm start
```

### Automatic Deployment
- ✅ **Auto-deploy** on git push
- ✅ **Preview deployments** for PRs
- ✅ **Rollback** capability

## Testing Deployed App

### 1. Test Frontend
- Visit your Vercel URL
- Check landing page loads
- Test navigation

### 2. Test Backend
- Visit `your-backend-url/health`
- Should return health status

### 3. Test Integration
- Submit a product
- Verify blockchain transaction
- Check QR code generation

## Production Checklist

- [ ] Environment variables set
- [ ] Database connected (if using)
- [ ] CORS configured
- [ ] SSL certificates active
- [ ] Custom domains configured
- [ ] Analytics added
- [ ] Error monitoring setup
- [ ] Backup strategy planned

## Troubleshooting

### Common Issues
1. **CORS Errors**: Update FRONTEND_URL in backend
2. **Environment Variables**: Check all are set correctly
3. **Build Failures**: Check Node.js version compatibility
4. **Database Connection**: Verify DATABASE_URL format

### Debug Commands
```bash
# Check environment variables
echo $HEDERA_ACCOUNT_ID

# Test Hedera connection
node scripts/test-hedera.js

# Check API health
curl https://your-backend-url/health
```
# 🚀 Supabase PostgreSQL Setup for Veritas

## Quick Setup (5 minutes)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) 
2. Click "Start your project" → "New Project"
3. Choose organization and set:
   - **Name**: `veritas-db`
   - **Password**: Generate strong password
   - **Region**: Choose closest to your users

### 2. Get Connection Details
In your Supabase dashboard:
1. Go to **Settings** → **Database**
2. Copy the **Connection string** (starts with `postgresql://`)
3. Note the **Connection pooling** URL for production

### 3. Run Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Copy and paste the entire content from `veritas-backend/db/schema.sql`
3. Click **Run** to create tables and sample data

### 4. Environment Variables

For **Local Development** (`.env.local`):
```bash
# Your Supabase connection string (pooled for better performance)
DATABASE_URL=postgresql://postgres.yuyoxwwfeodcosghgkkn:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres

# Direct connection if needed for migrations
DATABASE_DIRECT_URL=postgresql://postgres.yuyoxwwfeodcosghgkkn:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres

# Individual variables (if preferred)
DB_HOST=aws-0-ap-south-1.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.yuyoxwwfeodcosghgkkn
DB_PASSWORD=[YOUR-PASSWORD]
DB_SSL=true
```

For **Production/Vercel**:
```bash
# Always use pooled connection for serverless
DATABASE_URL=postgresql://postgres.yuyoxwwfeodcosghgkkn:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

### ✅ Your Database Setup Status
- **Region**: Asia Pacific (ap-south-1) - Mumbai
- **Connection**: Transaction pooler configured
- **Schema**: Successfully deployed with sample data
- **Tables**: `products` and `claims` ready

### 5. Verify Connection
Run the backend locally to test:
```bash
cd veritas-backend
npm install
npm start
```

Look for: `✅ Database connected successfully`

## 🎯 Supabase Benefits
- **Free tier**: 500MB database, 50MB file storage
- **Auto-backups**: Daily backups included
- **Global CDN**: Fast worldwide access
- **Real-time**: Built-in websockets support
- **Auth**: Optional user authentication
- **Edge functions**: Serverless compute

## 🔧 Production Tips

### Connection Pooling
For production, always use the pooled connection:
```bash
# Pooled (recommended for serverless)
DATABASE_URL=postgresql://postgres:password@db.ref.supabase.co:6543/postgres?pgbouncer=true

# Direct (for persistent connections)
DATABASE_URL=postgresql://postgres:password@db.ref.supabase.co:5432/postgres
```

### Security
1. **Row Level Security**: Enable in Supabase if using client-side queries
2. **IP Restrictions**: Whitelist your server IPs in Supabase settings
3. **SSL**: Always use `DB_SSL=true` for production

### Performance
1. **Indexes**: Already optimized in our schema
2. **Connection limits**: Use pooling for serverless deployments
3. **Query optimization**: Use the built-in helpers in `db/connection.js`

## 📊 Database Schema Overview

```sql
Products Table:
- id (UUID, Primary Key)
- batch_id (Unique identifier like "VRT-2024-1234")
- product_name
- supplier_name  
- description
- created_at

Claims Table:
- id (UUID, Primary Key)
- product_id (Foreign Key → Products)
- claim_type (quality, authenticity, defect, packaging)
- claim_description
- hcs_transaction_id (Hedera blockchain reference)
- hcs_timestamp
- created_at
```

## 🔄 Migration Commands

If you need to reset or update the database:

```sql
-- Reset database (CAREFUL: This deletes all data!)
DROP TABLE IF EXISTS claims CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP FUNCTION IF EXISTS generate_batch_id CASCADE;

-- Then re-run the full schema.sql file
```

## 🚨 Troubleshooting

**Connection Issues:**
- Check if your IP is whitelisted in Supabase
- Verify SSL is enabled: `DB_SSL=true`
- Use connection pooling URL for Vercel/serverless

**Performance Issues:**
- Use connection pooling: `?pgbouncer=true`
- Add `connection_limit=1` for serverless functions
- Monitor query performance in Supabase dashboard

**Schema Issues:**
- Make sure UUID extension is enabled
- Check if all tables were created successfully
- Verify sample data exists: `SELECT * FROM products LIMIT 5;`

## 📞 Support

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Discord**: [discord.supabase.com](https://discord.supabase.com)
- **Status Page**: [status.supabase.com](https://status.supabase.com)
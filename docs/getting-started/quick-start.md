# Quick Start Guide 🚀

Get Veritas up and running in under 5 minutes!

## Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Hedera Testnet Account** - [Create here](https://portal.hedera.com/)

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/nikhlu07/veritas.git
cd veritas
```

## 2️⃣ Install Dependencies

```bash
# Install all dependencies
npm run install:all

# Or install individually
cd veritas-frontend && npm install
cd ../veritas-backend && npm install
```

## 3️⃣ Environment Setup

### Backend Configuration
```bash
cd veritas-backend
cp .env.example .env
```

Edit `.env` with your Hedera credentials:
```env
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=your_private_key_here
HEDERA_NETWORK=testnet
DATABASE_URL=postgresql://user:password@localhost:5432/veritas
```

### Frontend Configuration
```bash
cd veritas-frontend
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

## 4️⃣ Create Hedera Topic

```bash
cd veritas-backend
node create-new-topic.js
```

This will output your topic ID - add it to your `.env` file:
```env
HEDERA_TOPIC_ID=0.0.YOUR_TOPIC_ID
```

## 5️⃣ Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:backend    # Backend on :3002
npm run dev:frontend   # Frontend on :3000
```

## 6️⃣ Test the Application

1. **Visit** [http://localhost:3000](http://localhost:3000)
2. **Submit a product** using the demo form
3. **Verify the product** using the generated batch ID
4. **Check blockchain** on [HashScan](https://hashscan.io/testnet)

## 🎉 You're Ready!

Your Veritas instance is now running locally. Try these next steps:

- **📝 [Submit your first product](http://localhost:3000/submit)**
- **🔍 [Verify a demo product](http://localhost:3000/verify/COFFEE-2024-1001)**
- **📚 [Read the full documentation](../README.md)**

## 🆘 Need Help?

- **🐛 Issues?** Check [Common Issues](../troubleshooting/common-issues.md)
- **❓ Questions?** See our [FAQ](../troubleshooting/faq.md)
- **💬 Support?** [Join our Discord](https://discord.gg/veritas)

---

**Next:** [Installation Guide](./installation.md) for detailed setup instructions.
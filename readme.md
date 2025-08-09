# Veritas - Blockchain Product Verification System

![Veritas Logo](./veritas-frontend/public/logo.svg)

A comprehensive product authenticity verification system built on the Hedera blockchain network. Veritas enables businesses to create tamper-proof product records and allows consumers to instantly verify product authenticity through QR codes.

## 🌟 Features

- **Blockchain Verification**: Immutable product records on Hedera Consensus Service
- **QR Code Generation**: Automatic QR code creation for product packaging
- **Real-time Verification**: Instant product authenticity checking
- **Beautiful UI**: Modern, responsive interface with Lufga typography
- **Multi-claim Support**: Support for various product claims (organic, fair-trade, etc.)
- **Batch Management**: Efficient handling of product batches
- **HashScan Integration**: Direct links to blockchain explorer

## 🏗️ Architecture

```
Frontend (Next.js) → Backend (Node.js) → Hedera Network
                                    ↓
                              PostgreSQL Database
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL (optional - can run without database)
- Hedera Testnet Account

### 1. Clone the Repository

```bash
git clone https://github.com/nikhlu07/veritas.git
cd veritas
```

### 2. Backend Setup

```bash
cd veritas-backend
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your Hedera credentials
nano .env
```

### 3. Frontend Setup

```bash
cd ../veritas-frontend
npm install

# Copy environment template  
cp .env.example .env.local

# Edit .env.local with your configuration
nano .env.local
```

### 4. Create Hedera Topic (First Time Only)

```bash
cd veritas-backend
node create-new-topic.js
```

### 5. Start Development Servers

```bash
# Terminal 1 - Backend
cd veritas-backend
npm run dev

# Terminal 2 - Frontend
cd veritas-frontend  
npm run dev
```

Visit `http://localhost:3000` to see the application!

## 📁 Project Structure

```
veritas/
├── veritas-frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/              # Next.js 13+ app directory
│   │   ├── components/       # Reusable UI components
│   │   └── lib/             # Utility functions
│   ├── public/              # Static assets
│   └── package.json
├── veritas-backend/          # Node.js backend API
│   ├── src/                 # TypeScript source files
│   ├── routes/              # API route handlers
│   ├── utils/               # Utility functions
│   ├── scripts/             # Setup and maintenance scripts
│   └── package.json
├── demo-setup/              # Demo data and setup scripts
└── README.md
```

## 🔧 Configuration

### Backend Environment Variables

```bash
# Server Configuration
PORT=3002
NODE_ENV=development

# Hedera Configuration
HEDERA_ACCOUNT_ID=your_account_id
HEDERA_PRIVATE_KEY=your_private_key
HEDERA_NETWORK=testnet
HEDERA_TOPIC_ID=your_topic_id

# Database (Optional)
DATABASE_URL=postgresql://user:password@localhost:5432/veritas
```

### Frontend Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_APP_ENV=development

# Hedera Configuration (must match backend)
HEDERA_ACCOUNT_ID=your_account_id
HEDERA_PRIVATE_KEY=your_private_key
HEDERA_NETWORK=testnet
HEDERA_TOPIC_ID=your_topic_id
```

## 🎯 Usage

### For Businesses (Product Submission)

1. Navigate to `/submit`
2. Fill in product details
3. Add sustainability claims
4. Submit to blockchain
5. Download generated QR code

### For Consumers (Product Verification)

1. Navigate to `/verify`
2. Scan QR code or enter batch ID
3. View product details and claims
4. See blockchain proof links

## 🔗 API Endpoints

### Products
- `POST /api/products` - Submit new product
- `GET /api/products/:batchId` - Get product details

### Verification  
- `GET /api/verify/:batchId` - Verify product authenticity
- `GET /api/verify/qr/:qrData` - Verify via QR code

### Health
- `GET /health` - API health check

## 🌐 Deployment

### Frontend (Vercel/Netlify)
```bash
cd veritas-frontend
npm run build
```

### Backend (Railway/Heroku)
```bash
cd veritas-backend  
npm run build
npm start
```

## 🧪 Testing

### Run Backend Tests
```bash
cd veritas-backend
npm test
```

### Test Hedera Integration
```bash
cd veritas-backend
node scripts/test-hedera.js
```

## � Docutmentation

- [Multi-Business Setup](./MULTI_BUSINESS_SETUP.md)
- [Security Model](./SECURITY_MODEL.md)
- [API Documentation](./veritas-backend/API-TEST-RESULTS.md)
- [Database Setup](./veritas-backend/SETUP-DATABASE.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Hedera Hashgraph](https://hedera.com/) for blockchain infrastructure
- [Next.js](https://nextjs.org/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- Modern system font stack for optimal performance

## 📞 Support

For support, create an issue on GitHub or contact the project maintainer.

---

**Built with ❤️ for supply chain transparency**

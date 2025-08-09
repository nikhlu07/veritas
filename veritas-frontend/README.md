# Veritas Frontend

A Next.js-based product authenticity verification system using blockchain technology and the Hedera Consensus Service.

## Features

- 🔒 Product authenticity verification using blockchain
- 📱 QR code generation and scanning
- 🌐 Mobile-responsive design
- ⚡ Optimized for performance
- 🔍 SEO-friendly with meta tags
- 🛡️ Error boundaries for robust UX
- 📊 Built-in analytics ready

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API server running (see ../veritas-backend)

## Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. Configure your environment variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_ENV=development
HEDERA_ACCOUNT_ID=your_hedera_account_id
HEDERA_PRIVATE_KEY=your_hedera_private_key
HEDERA_NETWORK=testnet
```

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production

```bash
# Build for production
npm run build

# Start production server
npm run start

# Test production build locally
npm run test:build
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run build:analyze` - Build with bundle analyzer
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/         # React components
│   ├── forms/         # Form components
│   ├── ui/           # UI components
│   └── verification/ # Verification-specific components
├── lib/              # Utility libraries
├── types/            # TypeScript type definitions
└── styles/           # Global styles
```

## Key Technologies

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **QRCode.js** - QR code generation
- **Hedera SDK** - Blockchain integration

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Other Platforms

The app generates a standalone build that can be deployed to:
- AWS Lambda/EC2
- Google Cloud Run
- Heroku
- DigitalOcean
- Netlify

## Performance Optimizations

- ✅ Image optimization with WebP/AVIF
- ✅ Bundle splitting and code splitting
- ✅ Compression enabled
- ✅ Security headers
- ✅ Minimal JavaScript bundles
- ✅ Prefetching and preloading
- ✅ PWA support with manifest

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
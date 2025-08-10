# Installation Guide 🛠️

Complete installation instructions for Veritas on different platforms.

## System Requirements

### Minimum Requirements
- **OS**: Windows 10, macOS 10.15, or Ubuntu 18.04+
- **Node.js**: Version 18.0 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Network**: Stable internet connection

### Recommended Requirements
- **OS**: Latest stable versions
- **Node.js**: Version 20.0+ (LTS)
- **RAM**: 16GB for development
- **Storage**: 10GB free space (for dependencies and logs)
- **Database**: PostgreSQL 14+ (optional for local development)

## Prerequisites Installation

### 1. Node.js Installation

#### Windows
```bash
# Using Chocolatey
choco install nodejs

# Or download from https://nodejs.org/
# Choose LTS version for stability
```

#### macOS
```bash
# Using Homebrew
brew install node

# Or using MacPorts
sudo port install nodejs18

# Or download from https://nodejs.org/
```

#### Linux (Ubuntu/Debian)
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Git Installation

#### Windows
```bash
# Using Chocolatey
choco install git

# Or download from https://git-scm.com/
```

#### macOS
```bash
# Using Homebrew
brew install git

# Or using Xcode Command Line Tools
xcode-select --install
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt-get install git

# CentOS/RHEL
sudo yum install git
```

### 3. PostgreSQL (Optional)

#### Windows
```bash
# Using Chocolatey
choco install postgresql

# Or download from https://www.postgresql.org/download/windows/
```

#### macOS
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Project Installation

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/nikhlu07/veritas.git
cd veritas

# Verify structure
ls -la
```

### 2. Install Dependencies

#### Option A: Install All at Once
```bash
# Install both frontend and backend dependencies
npm run install:all
```

#### Option B: Install Separately
```bash
# Frontend dependencies
cd veritas-frontend
npm install

# Backend dependencies
cd ../veritas-backend
npm install

# Return to root
cd ..
```

### 3. Environment Configuration

#### Backend Environment
```bash
cd veritas-backend
cp .env.example .env
```

Edit `veritas-backend/.env`:
```env
# Hedera Configuration
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=your_private_key_here
HEDERA_NETWORK=testnet
HEDERA_TOPIC_ID=0.0.YOUR_TOPIC_ID

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/veritas
DB_HOST=localhost
DB_PORT=5432
DB_NAME=veritas
DB_USER=your_username
DB_PASSWORD=your_password

# Server Configuration
PORT=3002
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

#### Frontend Environment
```bash
cd veritas-frontend
cp .env.example .env.local
```

Edit `veritas-frontend/.env.local`:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3002

# App Configuration
NEXT_PUBLIC_APP_NAME=Veritas
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

### 4. Database Setup (Optional)

#### Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE veritas;
CREATE USER veritas_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE veritas TO veritas_user;

# Exit PostgreSQL
\q
```

#### Run Migrations
```bash
cd veritas-backend
npm run migrate
```

### 5. Hedera Setup

#### Create Hedera Account
1. Visit [Hedera Portal](https://portal.hedera.com/)
2. Create testnet account
3. Note your Account ID and Private Key

#### Create Topic
```bash
cd veritas-backend
node create-new-topic.js
```

This will output:
```
Topic created successfully!
Topic ID: 0.0.1234567
Add this to your .env file as HEDERA_TOPIC_ID
```

Add the Topic ID to your `.env` file.

## Verification

### 1. Test Backend
```bash
cd veritas-backend
npm run dev
```

Visit [http://localhost:3002/health](http://localhost:3002/health)
Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### 2. Test Frontend
```bash
cd veritas-frontend
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)
You should see the Veritas landing page.

### 3. Test Full Integration
1. Submit a test product at [http://localhost:3000/submit](http://localhost:3000/submit)
2. Verify the product using the generated batch ID
3. Check the blockchain record on [HashScan](https://hashscan.io/testnet)

## Docker Installation (Alternative)

### Prerequisites
- Docker Desktop
- Docker Compose

### Quick Start
```bash
# Clone repository
git clone https://github.com/nikhlu07/veritas.git
cd veritas

# Copy environment files
cp veritas-backend/.env.example veritas-backend/.env
cp veritas-frontend/.env.example veritas-frontend/.env.local

# Edit environment files with your Hedera credentials

# Start with Docker Compose
docker-compose up -d

# Check status
docker-compose ps
```

### Docker Services
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3002
- **Database**: localhost:5432

## Troubleshooting

### Common Issues

#### Node.js Version Issues
```bash
# Check version
node --version

# If wrong version, use nvm
nvm install 18
nvm use 18
```

#### Permission Issues (Linux/macOS)
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

#### Port Already in Use
```bash
# Find process using port
lsof -i :3000
lsof -i :3002

# Kill process
kill -9 <PID>
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Test connection
psql -U postgres -h localhost -p 5432
```

### Getting Help

- 📚 [Quick Start Guide](./quick-start.md)
- 🔧 [Configuration Guide](./configuration.md)
- ❓ [FAQ](../troubleshooting/faq.md)
- 🐛 [Common Issues](../troubleshooting/common-issues.md)
- 💬 [GitHub Discussions](https://github.com/nikhlu07/veritas/discussions)

## Next Steps

After successful installation:

1. **📖 [Configuration Guide](./configuration.md)** - Detailed configuration options
2. **🚀 [First Steps](./first-steps.md)** - Your first product submission
3. **🏗️ [Development Setup](../development/setup.md)** - Set up development environment
4. **📡 [API Documentation](../api/overview.md)** - Explore the API

---

**Installation complete!** 🎉 You're ready to start using Veritas.
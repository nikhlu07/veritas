# System Architecture Overview 🏗️

Veritas is built as a modern, scalable web application with blockchain integration for immutable record keeping.

## High-Level Architecture

```mermaid
graph TB
    subgraph "User Layer"
        A[Web Browser]
        B[Mobile Browser]
        C[QR Scanner]
    end
    
    subgraph "Frontend Layer"
        D[Next.js 14 App]
        E[React Components]
        F[Tailwind CSS]
    end
    
    subgraph "Backend Layer"
        G[Node.js API]
        H[Express Server]
        I[PostgreSQL DB]
    end
    
    subgraph "Blockchain Layer"
        J[Hedera Consensus Service]
        K[HashScan Explorer]
        L[Immutable Storage]
    end
    
    A --> D
    B --> D
    C --> D
    D --> G
    G --> I
    G --> J
    J --> K
    J --> L
    
    style J fill:#00d4aa
    style D fill:#000000,color:#ffffff
    style I fill:#336791,color:#ffffff
```

## Core Components

### 1. Frontend (Next.js)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **Features**: 
  - Server-side rendering (SSR)
  - Static site generation (SSG)
  - QR code generation and scanning
  - Mobile-first responsive design

### 2. Backend (Node.js)
- **Runtime**: Node.js with Express framework
- **Database**: PostgreSQL for relational data
- **Features**:
  - RESTful API design
  - Data validation and sanitization
  - Blockchain integration
  - Error handling and logging

### 3. Blockchain (Hedera)
- **Network**: Hedera Consensus Service (HCS)
- **Purpose**: Immutable message storage
- **Benefits**:
  - 3-5 second finality
  - $0.0001 per transaction
  - Carbon negative consensus
  - Enterprise-grade security

## Data Flow

### Product Submission Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    participant H as Hedera
    
    U->>F: Submit Product Form
    F->>B: POST /api/products
    B->>DB: Store Product Data
    B->>H: Submit to HCS Topic
    H-->>B: Return Message ID
    B->>DB: Update with Message ID
    B-->>F: Return Batch ID
    F-->>U: Show Success + QR Code
```

### Verification Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    participant H as Hedera
    
    U->>F: Scan QR Code / Enter Batch ID
    F->>B: GET /api/verify/{batchId}
    B->>DB: Query Product Data
    B->>H: Fetch HCS Message
    H-->>B: Return Blockchain Proof
    B-->>F: Return Verification Data
    F-->>U: Display Verification Results
```

## Technology Stack

| Layer | Technology | Purpose | Why Chosen |
|-------|------------|---------|------------|
| **Frontend** | Next.js 14 | React framework | SSR, performance, developer experience |
| **Styling** | Tailwind CSS | Utility-first CSS | Rapid development, consistency |
| **Backend** | Node.js + Express | API server | JavaScript ecosystem, fast development |
| **Database** | PostgreSQL | Relational data | ACID compliance, complex queries |
| **Blockchain** | Hedera HCS | Immutable storage | Speed, cost, sustainability |
| **Deployment** | Vercel + Railway | Hosting | Global CDN, easy deployment |

## Security Architecture

### Data Protection
- **Input Validation**: All user inputs sanitized
- **SQL Injection**: Parameterized queries
- **XSS Protection**: Content Security Policy
- **HTTPS**: All communications encrypted

### Blockchain Security
- **Immutability**: Records cannot be altered
- **Transparency**: Public verification on HashScan
- **Consensus**: Hedera's aBFT consensus algorithm
- **Access Control**: Private keys secured

## Scalability Considerations

### Horizontal Scaling
- **Frontend**: CDN distribution via Vercel
- **Backend**: Stateless API servers
- **Database**: Read replicas for queries
- **Blockchain**: Hedera handles global scale

### Performance Optimization
- **Caching**: Redis for frequent queries
- **CDN**: Static assets globally distributed
- **Database**: Indexed queries and connection pooling
- **Blockchain**: Batch operations when possible

## Monitoring and Observability

### Metrics
- **Application**: Response times, error rates
- **Database**: Query performance, connection health
- **Blockchain**: Transaction success rates
- **User**: Page load times, conversion rates

### Logging
- **Structured Logging**: JSON format for parsing
- **Error Tracking**: Centralized error collection
- **Audit Trail**: All blockchain operations logged
- **Performance**: Request/response timing

---

**Next:** [Frontend Architecture](./frontend.md) for detailed frontend design.
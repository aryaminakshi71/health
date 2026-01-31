# Health - Healthcare Management System

A comprehensive healthcare management system for hospitals and clinics with multi-region compliance (HIPAA, GDPR).

## ✨ Features

- Electronic Health Records (EHR)
- Patient management
- Appointment scheduling
- Prescription management
- Billing and claims processing
- Lab results management
- Telemedicine support
- Compliance tracking (HIPAA, GDPR)
- Analytics and reporting
- Multi-region support

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ or Bun 1.3+
- PostgreSQL database
- Cloudflare account (for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/aryaminakshi71/health.git
cd health

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
bun run db:migrate

# Start development server
bun run dev
```

## 📚 Tech Stack

- **Frontend**: TanStack Start (React)
- **Backend**: Hono API with oRPC
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **Deployment**: Cloudflare Pages + Workers
- **Package Manager**: Bun

## 🏗️ Project Structure

```
health/
├── apps/
│   ├── web/          # Frontend application
│   └── api/          # Backend API
├── packages/         # Shared packages
│   ├── storage/      # Database package
│   ├── env/          # Environment configuration
│   └── core/         # Core utilities
└── archive/          # Legacy/archived code
```

## 🔧 Development

```bash
# Run development server
bun run dev

# Run API only
bun run dev:api

# Run web only
bun run dev:web

# Run type checking
bun run typecheck

# Run linter
bun run lint

# Run tests
bun run test
```

## 📦 Deployment

### Cloudflare Pages (Frontend)

1. Connect your GitHub repository to Cloudflare Pages
2. Configure build settings:
   - Build command: `bun run build:web`
   - Output directory: `apps/web/dist`
3. Add environment variables in Cloudflare dashboard

### Cloudflare Workers (Backend)

The API can be deployed to Cloudflare Workers. See deployment documentation for details.

## 📝 Environment Variables

See `.env.example` for required environment variables.

**Important:** This application handles sensitive healthcare data. Ensure all security measures are properly configured.

## 🔒 Security & Compliance

- HIPAA compliance features
- GDPR compliance features
- Data encryption
- Audit logging
- Access controls

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/aryaminakshi71/health)
- [Documentation](https://github.com/aryaminakshi71/health/wiki)

## 👤 Author

Arya Labs

---

Made with ❤️ by Arya Labs

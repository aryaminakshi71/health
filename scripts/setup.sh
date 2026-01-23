#!/bin/bash

# Helpdesk MVP Setup Script
# This script helps set up the helpdesk MVP

set -e

echo "🚀 Helpdesk MVP Setup"
echo "===================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
  echo "✅ .env file created. Please update it with your configuration."
  echo ""
else
  echo "✅ .env file already exists."
  echo ""
fi

# Check if DATABASE_URL is set
if grep -q "DATABASE_URL=postgresql://user:password@localhost" .env 2>/dev/null; then
  echo "⚠️  WARNING: DATABASE_URL appears to be using default values."
  echo "   Please update .env with your actual database connection string."
  echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
bun install
echo "✅ Dependencies installed."
echo ""

# Generate database migrations
echo "🗄️  Generating database migrations..."
cd packages/storage
bun run db:generate || echo "⚠️  Migration generation failed. Make sure DATABASE_URL is set correctly."
cd ../..
echo ""

# Push migrations to database
echo "📤 Pushing migrations to database..."
cd packages/storage
bun run db:push || echo "⚠️  Migration push failed. Make sure your database is running and DATABASE_URL is correct."
cd ../..
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Configure email service (Resend/SendGrid/AWS SES)"
echo "3. Set up Cloudflare R2 bucket"
echo "4. Run 'bun run dev' to start the development server"
echo ""

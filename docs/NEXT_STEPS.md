# Next Steps - Implementation Guide

This document outlines the steps to complete the helpdesk MVP setup and get it running.

## ✅ Step 1: Create Router Index

The router index file needs to be created to compose all routers. Create:

**`apps/api/src/routers/index.ts`**

```typescript
/**
 * App Router
 *
 * Composed router with all domain routers.
 */

import { healthRouter } from "./health";
import { userRouter } from "./user";
import { billingRouter } from "./billing";
import { notesRouter } from "./notes";
import { ticketsRouter } from "./tickets";
import { dashboardRouter } from "./dashboard";
import { kbRouter } from "./kb";
import { filesRouter } from "./files";

export const appRouter = {
  health: healthRouter,
  user: userRouter,
  billing: billingRouter,
  notes: notesRouter,
  tickets: ticketsRouter,
  dashboard: dashboardRouter,
  kb: kbRouter,
  files: filesRouter,
};

export type AppRouter = typeof appRouter;
```

## ✅ Step 2: Recreate Database Schema Files

Create the following schema files in `packages/storage/src/db/schema/`:

1. **`tickets.schema.ts`** - Tickets, comments, attachments, tags
2. **`kb.schema.ts`** - Knowledge base articles
3. **`sla.schema.ts`** - SLA rules and status tracking
4. **`canned-responses.schema.ts`** - Canned response templates

Then update **`packages/storage/src/db/schema/index.ts`** to export them:

```typescript
export * from './auth.schema'
export * from './auth.validators'
export * from './asset.schema'
export * from './billing.schema'
export * from './notes.schema'
export * from './notes.validators'
export * from './tickets.schema'
export * from './kb.schema'
export * from './sla.schema'
export * from './canned-responses.schema'
export * from '../enums'
```

## ✅ Step 3: Recreate Validation Schemas

Create validation files in `packages/core/src/validators/`:

1. **`ticket.ts`** - Ticket validation schemas
2. **`kb.ts`** - Knowledge base validation schemas

Then update **`packages/core/src/index.ts`** to export them.

## ✅ Step 4: Recreate Services

Create service files in `packages/core/src/services/`:

1. **`email.ts`** - Email notification service
2. **`sla.ts`** - SLA tracking service

## ✅ Step 5: Recreate R2 Upload Helpers

Create **`packages/storage/src/r2/upload.ts`** and **`packages/storage/src/r2/index.ts`**.

## ✅ Step 6: Run Database Migrations

```bash
# Generate migration files
bun run db:generate

# Apply migrations to database
bun run db:push
```

## ✅ Step 7: Configure Email Service

Replace the `MockEmailService` in `packages/core/src/services/email.ts` with your email provider:

### Option 1: Resend (Recommended)
```typescript
import { Resend } from 'resend';

export class ResendEmailService implements EmailService {
  private resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async send(options: EmailOptions): Promise<void> {
    await this.resend.emails.send({
      from: options.from || 'support@yourdomain.com',
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }
}

export function getEmailService(): EmailService {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set, using mock service');
    return new MockEmailService();
  }
  return new ResendEmailService(apiKey);
}
```

### Option 2: SendGrid
```typescript
import sgMail from '@sendgrid/mail';

export class SendGridEmailService implements EmailService {
  constructor(apiKey: string) {
    sgMail.setApiKey(apiKey);
  }

  async send(options: EmailOptions): Promise<void> {
    await sgMail.send({
      from: options.from || 'support@yourdomain.com',
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }
}
```

### Option 3: AWS SES
```typescript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

export class SESEmailService implements EmailService {
  private client: SESClient;

  constructor(region: string = 'us-east-1') {
    this.client = new SESClient({ region });
  }

  async send(options: EmailOptions): Promise<void> {
    const command = new SendEmailCommand({
      Source: options.from || 'support@yourdomain.com',
      Destination: {
        ToAddresses: Array.isArray(options.to) ? options.to : [options.to],
      },
      Message: {
        Subject: { Data: options.subject },
        Body: {
          Html: { Data: options.html },
          Text: options.text ? { Data: options.text } : undefined,
        },
      },
    });

    await this.client.send(command);
  }
}
```

## ✅ Step 8: Configure R2 Bucket

1. **Create R2 Bucket in Cloudflare Dashboard**
   - Go to Cloudflare Dashboard → R2
   - Create a new bucket (e.g., `helpdesk-uploads`)
   - Note the bucket name

2. **Set Up Environment Variables**
   Add to your `.env` or Cloudflare Workers environment:
   ```
   R2_BUCKET_NAME=helpdesk-uploads
   ```

3. **Configure CORS (if needed)**
   If you need to access files directly from the frontend, configure CORS on the bucket.

4. **Update R2 Client**
   Make sure `packages/storage/src/r2/client.ts` is set up to use the bucket from environment.

## ✅ Step 9: Test the Application

1. **Start Development Server**
   ```bash
   bun run dev
   ```

2. **Test Features**
   - Create a ticket
   - Add comments
   - Upload files
   - Create knowledge base articles
   - Check dashboard metrics

3. **Verify Email Notifications**
   - Check console logs (if using mock service)
   - Check email provider dashboard (if using real service)

## ✅ Step 10: Environment Variables Checklist

Make sure you have these environment variables set:

```bash
# Database
DATABASE_URL=postgresql://...

# Email (choose one)
RESEND_API_KEY=re_...
# OR
SENDGRID_API_KEY=SG...
# OR
AWS_SES_REGION=us-east-1

# R2
R2_BUCKET_NAME=helpdesk-uploads

# Site URL (for email links)
VITE_PUBLIC_SITE_URL=https://yourdomain.com
```

## 📝 Additional Notes

- All routers should be imported in `apps/api/src/routers/index.ts`
- All schema files should be exported in `packages/storage/src/db/schema/index.ts`
- All validators should be exported in `packages/core/src/index.ts`
- The app router is used in `apps/api/src/app.ts` to create the RPC handler

## 🚀 Deployment

Once everything is set up:

1. **Deploy to Cloudflare Workers**
   ```bash
   bun run deploy
   ```

2. **Set Environment Variables in Cloudflare Dashboard**
   - Go to Workers → Your Worker → Settings → Variables
   - Add all required environment variables

3. **Test Production**
   - Verify all endpoints work
   - Test file uploads
   - Test email notifications

---

**Status**: Ready for implementation
**Last Updated**: 2024
